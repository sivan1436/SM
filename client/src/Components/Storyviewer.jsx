import React, { useEffect, useRef, useState } from "react";
import { X, BadgeCheck } from "lucide-react";

function StoryViewer({
  stories,
  currentStoryIndex,
  setCurrentStoryIndex,
  setViewStory,
}) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const STORY_DURATION = 5000;

  const viewStory = stories[currentStoryIndex];

  // -------------------------
  // Next Story
  // -------------------------
  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setViewStory(null);
    }
  };

  // -------------------------
  // Previous Story
  // -------------------------
  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  // -------------------------
  // Reset when story changes
  // -------------------------
  useEffect(() => {
    setProgress(0);
    setIsPaused(false);

    startTimeRef.current = Date.now();
    elapsedRef.current = 0;
  }, [currentStoryIndex]);

  // -------------------------
  // Image/Text Progress
  // -------------------------
  useEffect(() => {
    if (!viewStory) return;

    if (
      viewStory.media_type !== "image" &&
      viewStory.media_type !== "text"
    ) {
      return;
    }

    if (isPaused) return;

    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed =
        elapsedRef.current +
        (Date.now() - startTimeRef.current);

      const percentage = Math.min(
        (elapsed / STORY_DURATION) * 100,
        100
      );

      setProgress(percentage);

      if (percentage >= 100) {
        clearInterval(interval);
        elapsedRef.current = 0;
        nextStory();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentStoryIndex, isPaused]);

  // -------------------------
  // Pause Story
  // -------------------------
  const pauseStory = () => {
    if (
      viewStory?.media_type === "image" ||
      viewStory?.media_type === "text"
    ) {
      elapsedRef.current +=
        Date.now() - startTimeRef.current;
    }

    setIsPaused(true);

    // Pause video too
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // -------------------------
  // Resume Story
  // -------------------------
  const resumeStory = () => {
    setIsPaused(false);

    // Resume video
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // -------------------------
  // Video Progress
  // -------------------------
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;

    const { currentTime, duration } = videoRef.current;

    if (duration) {
      setProgress((currentTime / duration) * 100);
    }
  };

  // -------------------------
  // Video End
  // -------------------------
  const handleVideoEnded = () => {
    nextStory();
  };

  // -------------------------
  // Close
  // -------------------------
  const handleClose = () => {
    setViewStory(null);
  };

  if (!viewStory) return null;

  // -------------------------
  // Content
  // -------------------------
  function renderContent() {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="max-w-full max-h-[90vh] object-contain select-none"
            draggable="false"
          />
        );

      case "video":
        return (
          <video
            ref={videoRef}
            src={viewStory.media_url}
            className="max-h-[90vh] max-w-full object-contain"
            autoPlay
            controls
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
          />
        );

      case "text":
        return (
          <div className="w-full min-h-[70vh] flex items-center justify-center p-8 text-white text-2xl font-medium text-center select-none">
            {viewStory.content}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 select-none"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000",
      }}
    >
      {/* =========================
          Progress Bar
      ========================== */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-50">
        <div
          className="h-full bg-white"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* =========================
          User Info
      ========================== */}
      <div
        className="absolute top-4 left-4 z-50 flex items-center gap-3
        p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50"
      >
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />

        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>

          <BadgeCheck className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* =========================
          Close Button
      ========================== */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 text-white"
      >
        <X className="w-8 h-8 hover:scale-110 transition cursor-pointer" />
      </button>

      {/* =========================
          Story Content
      ========================== */}
      <div
        className="relative w-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onMouseDown={pauseStory}
        onMouseUp={resumeStory}
        onMouseLeave={resumeStory}
        onTouchStart={pauseStory}
        onTouchEnd={resumeStory}
      >
        {renderContent()}
      </div>

      {/* =========================
          Previous Area
      ========================== */}
      <button
        onClick={previousStory}
        className="absolute left-0 top-0 h-full w-1/3 z-40 cursor-pointer"
        aria-label="Previous story"
      />

      {/* =========================
          Next Area
      ========================== */}
      <button
        onClick={nextStory}
        className="absolute right-0 top-0 h-full w-1/3 z-40 cursor-pointer"
        aria-label="Next story"
      />
    </div>
  );
}

export default StoryViewer;