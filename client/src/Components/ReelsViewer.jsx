import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, MessageCircle, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ReelsViewer({ reels, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isLoadingShareUsers, setIsLoadingShareUsers] = useState(false);
  const videoRef = useRef(null);
  const touchStartY = useRef(null);
  const navigate = useNavigate();
  const reel = reels[currentIndex];
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!reel) return;
    videoRef.current?.load();
    videoRef.current?.play().catch(() => {});

    const resetReelState = window.setTimeout(() => {
        setLiked(reel.liked_by_me || (Array.isArray(reel.likes_count) && reel.likes_count.some((id) => String(id) === String(currentUserId))));
        setLikes(typeof reel.likes_count === "number" ? reel.likes_count : reel.likes_count?.length || 0);
        setShares(typeof reel.shares_count === "number" ? reel.shares_count : reel.shares_count?.length || 0);
      setComments(reel.comments || []);
      setCommentCount(reel.comments_count || reel.comments?.length || 0);
      setCommentText("");
      setShowComments(false);
    }, 0);

    return () => window.clearTimeout(resetReelState);
  }, [currentIndex, reel, currentUserId]);

  if (!reel) return null;

  const goToNext = () => {
    setCurrentIndex((index) => Math.min(index + 1, reels.length - 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  };

  const handleTouchStart = (event) => {
    touchStartY.current = event.changedTouches[0].clientY;
  };

  const handleTouchEnd = (event) => {
    if (touchStartY.current === null) return;
    const distance = touchStartY.current - event.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(distance) < 60) return;
    if (distance > 0) goToNext();
    else goToPrevious();
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${reel._id}/like`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setLiked(data.liked);
      setLikes(typeof data.post.likes_count === "number" ? data.post.likes_count : data.post.likes_count?.length || 0);
    } catch (error) {
      toast.error(error.message || "Like could not be updated");
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${reel._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setComments((current) => [...current, data.comment]);
      setCommentCount(data.comments_count || comments.length + 1);
      setCommentText("");
    } catch (error) {
      toast.error(error.message || "Comment could not be added");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    setShowShareOptions(true);
    setIsLoadingShareUsers(true);
    try {
      const response = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) throw new Error(data.message);
      setShareUsers(data.map(({ user }) => user));
    } catch (error) {
      toast.error(error.message || "Contacts could not be loaded");
    } finally {
      setIsLoadingShareUsers(false);
    }
  };

  const shareReelWithUser = async (userId) => {
    try {
      const response = await fetch(`/api/posts/${reel._id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setShares(typeof data.post.shares_count === "number" ? data.post.shares_count : data.post.shares_count?.length || 0);
      setShowShareOptions(false);
      navigate(`/messages/${userId}`, { state: { sharedPost: reel } });
      onClose();
      toast.success("Reel ready to send");
    } catch (error) {
      toast.error(error.message || "Reel could not be shared");
    }
  };

  const openComments = async () => {
    setShowComments(true);
    try {
      const response = await fetch(`/api/posts/${reel._id}/comments?limit=20`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setComments(data.comments || []);
      setCommentCount(data.comments_count || 0);
    } catch (error) {
      toast.error(error.message || "Comments could not be loaded");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 text-white">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close reels"
        className="absolute right-5 top-5 z-20 rounded-full bg-black/50 p-2"
      >
        <X className="size-7" />
      </button>
      <button
        type="button"
        onClick={goToPrevious}
        aria-label="Previous reel"
        className="absolute left-0 top-0 z-10 h-full w-1/4 cursor-pointer"
      />
      <button
        type="button"
        onClick={goToNext}
        aria-label="Next reel"
        className="absolute right-0 top-0 z-10 h-full w-1/4 cursor-pointer"
      />

      <div
        className="relative flex h-full w-full max-w-2xl items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          key={reel._id}
          src={reel.image_urls?.[0]}
          className="h-full max-h-screen w-full object-contain"
          autoPlay
          preload="metadata"
          loop={false}
          controls
          playsInline
          onEnded={goToNext}
        />

        <div className="absolute bottom-5 left-5 right-5 z-20 flex items-end justify-between gap-4">
          <div className="min-w-0 rounded-lg bg-black/45 p-3">
            <p className="font-semibold">{reel.user?.full_name}</p>
            <p className="mt-1 max-w-md whitespace-pre-line text-sm text-white/90">{reel.content}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-4 rounded-full bg-black/45 p-2">
            <button type="button" onClick={handleLike} className="flex flex-col items-center" aria-label="Like reel">
              <Heart className={`size-7 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-xs">{likes}</span>
            </button>
            <button type="button" onClick={() => showComments ? setShowComments(false) : openComments()} className="flex flex-col items-center" aria-label="Comment on reel">
              <MessageCircle className="size-7" />
              <span className="text-xs">{commentCount}</span>
            </button>
            <button type="button" onClick={handleShare} aria-label="Share reel">
              <Send className="size-7" />
              <span className="text-xs">{shares}</span>
            </button>
          </div>
        </div>

        {showComments && (
          <div className="absolute bottom-24 left-5 right-5 z-30 max-h-64 rounded-xl bg-white p-3 text-slate-800 shadow-xl">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-sm font-semibold">Comments</p>
              <button
                type="button"
                onClick={() => setShowComments(false)}
                aria-label="Close comments"
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {comments.map((comment) => (
                <p key={comment._id} className="text-sm">
                  <strong>{comment.user?.username || "User"}</strong> {comment.content}
                </p>
              ))}
              {!comments.length && <p className="text-sm text-slate-500">No comments yet.</p>}
            </div>
            <form onSubmit={handleComment} className="mt-2 flex gap-2">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-sm outline-none"
              />
              <button type="submit" disabled={isSubmitting} aria-label="Send comment" className="rounded bg-indigo-600 p-2 text-white disabled:opacity-50">
                <Send className="size-4" />
              </button>
            </form>
          </div>
        )}

        {showShareOptions && (
          <div className="absolute inset-x-5 bottom-24 z-40 rounded-xl bg-white p-4 text-slate-800 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Share reel in chat</h2>
              <button type="button" onClick={() => setShowShareOptions(false)} aria-label="Close share options">
                <X className="size-5" />
              </button>
            </div>
            {isLoadingShareUsers && <p className="text-sm text-slate-500">Loading contacts...</p>}
            {!isLoadingShareUsers && !shareUsers.length && <p className="text-sm text-slate-500">No contacts available.</p>}
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {shareUsers.map((user) => (
                <button type="button" key={user._id} onClick={() => shareReelWithUser(user._id)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-100">
                  <img src={user.profile_picture || null} alt="" className="size-9 rounded-full object-cover" />
                  <span className="font-medium">{user.full_name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 text-white/70">
        <ChevronDown className="size-5" /> {currentIndex + 1}/{reels.length}
      </div>
    </div>
  );
}

export default ReelsViewer;
