import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Trash2, X } from "lucide-react";

function StoryViewer({
  stories,
  currentStoryIndex,
  setCurrentStoryIndex,
  setViewStory,
  removeStory,
}) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const videoRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);

  const STORY_DURATION = 5000;

  const storyGroup = stories[currentStoryIndex];
  const [currentGroupStoryIndex, setCurrentGroupStoryIndex] = useState(0);
  const viewStory = storyGroup?.stories[currentGroupStoryIndex];
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;
  const storyUserId = viewStory?.user?._id || viewStory?.user?.id || viewStory?.user;
  const canDeleteStory = viewStory?.is_owner === true ||
    String(storyUserId) === String(currentUserId) ||
    String(storyGroup?.userId) === String(currentUserId);

  // -------------------------
  // Next Story
  // -------------------------
  const nextStory = () => {
    if (storyGroup && currentGroupStoryIndex < storyGroup.stories.length - 1) {
      setCurrentGroupStoryIndex((prev) => prev + 1);
    } else {
      setViewStory(null);
    }
  };

  // -------------------------
  // Previous Story
  // -------------------------
  const previousStory = () => {
    if (storyGroup && currentGroupStoryIndex > 0) {
      setCurrentGroupStoryIndex((prev) => prev - 1);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  // -------------------------
  // Reset when story changes
  // -------------------------
  useEffect(() => {
    startTimeRef.current = Date.now();
    elapsedRef.current = 0;

    const resetProgress = window.setTimeout(() => {
      setProgress(0);
      setIsPaused(false);
      setMediaError(false);
    }, 0);

    return () => window.clearTimeout(resetProgress);
  }, [currentStoryIndex, currentGroupStoryIndex]);

  useEffect(() => {
    const resetGroupStory = window.setTimeout(() => {
      setCurrentGroupStoryIndex(0);
    }, 0);

    return () => window.clearTimeout(resetGroupStory);
  }, [currentStoryIndex]);

  async function handleDeleteStory() {
    if (!viewStory || !canDeleteStory) return;

    const response = await fetch(`/api/stories/${viewStory._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return;
    }

    removeStory(viewStory._id);
    if (storyGroup.stories.length > 1) {
      setCurrentGroupStoryIndex((prev) => Math.min(prev, storyGroup.stories.length - 2));
    } else {
      setViewStory(null);
    }
  }

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
  }, [currentGroupStoryIndex, isPaused]);

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
    if (mediaError) {
      return (
        <div className="flex min-h-[70vh] items-center justify-center p-8 text-center text-white">
          This story media could not be loaded.
        </div>
      );
    }

    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="h-auto max-h-[80vh] w-auto max-w-[90vw] object-contain select-none"
            draggable="false"
            onError={() => setMediaError(true)}
          />
        );

      case "video":
        return (
          <video
            ref={videoRef}
            src={viewStory.media_url}
            className="h-auto max-h-[80vh] w-auto max-w-[90vw] object-contain"
            autoPlay
            controls
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            onError={() => {
              setMediaError(true);
              setIsPaused(true);
            }}
          />
        );

      case "text":
        return null;

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

      {canDeleteStory && (
        <button
          onClick={handleDeleteStory}
          className="absolute top-4 right-16 z-50 text-white"
          aria-label="Delete story"
        >
          <Trash2 className="w-7 h-7 hover:text-red-400 transition cursor-pointer" />
        </button>
      )}

      {/* =========================
          Story Content
      ========================== */}
      <div
        className={`relative flex min-h-[70vh] w-[min(90vw,520px)] items-center justify-center overflow-hidden ${
          viewStory.media_type === "text" ? "bg-transparent" : "bg-black"
        }`}
        onMouseDown={pauseStory}
        onMouseUp={resumeStory}
        onMouseLeave={resumeStory}
        onTouchStart={pauseStory}
        onTouchEnd={resumeStory}
      >
        {renderContent()}
        {viewStory.content && (
          <p className="absolute bottom-4 left-4 right-4 z-10 rounded bg-black/50 p-3 text-center text-white">
            {viewStory.content}
          </p>
        )}
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