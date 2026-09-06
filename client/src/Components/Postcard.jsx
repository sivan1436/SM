import { useState } from "react";
import { BadgeCheck, Heart, MessageSquare, Send, Share2Icon, X } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function PostCard({ post }) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;

  const [likes, setLikes] = useState(post.likes_count?.length || 0);
  const [liked, setLiked] = useState(
    post.likes_count?.some((id) => String(id) === String(currentUserId)) || false
  );
  const [comments, setComments] = useState(post.comments || []);
  const [shares, setShares] = useState(post.shares_count?.length || 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [isLoadingShareUsers, setIsLoadingShareUsers] = useState(false);

  const postWithHashTags = post.content
    ? post.content.replace(
        /#(\w+)/g,
        '<span class="text-indigo-600">#$1</span>'
      )
    : "";

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setLiked(data.liked);
      setLikes(data.post.likes_count?.length || 0);
    } catch (error) {
      toast.error(error.message || "Like could not be updated");
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setComments(data.post.comments || []);
      setCommentText("");
      setShowComments(true);
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
      toast.error(error.message || "Post could not be shared");
    } finally {
      setIsLoadingShareUsers(false);
    }
  };

  const sharePostWithUser = async (userId) => {
    try {
      const response = await fetch(`/api/posts/${post._id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setShares(data.post.shares_count?.length || 0);
      navigate(`/messages/${userId}`, { state: { sharedPost: post } });
    } catch (error) {
      toast.error(error.message || "Post could not be shared");
    }
  };
  const navigate = useNavigate();

  return (
    <div id={`post-${post._id}`} className="bg-white rounded-xl shadow p-4 w-full max-w-2xl">

      {/* User Information */}
      <div  onClick={()=>navigate('/profile/'+post.user._id)} className="flex items-center gap-3 cursor-pointer">
        <img
          src={post.user.profile_picture}
          alt=""
          className="w-10 h-10 rounded-full shadow"
        />

        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>

          <div className="text-gray-500 text-sm">
            @{post.user.username} · {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="mt-3 text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashTags }}
        />
      )}

      {/* Images */}
      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {post.image_urls.map((img, index) => (
            post.post_type === "video" ? (
              <video key={index} src={img} controls className="w-full h-48 object-cover rounded-lg" />
            ) : (
              <img
                key={index}
                src={img}
                alt="Post media"
                className={`w-full h-48 object-cover rounded-lg ${
                  post.image_urls.length === 1 ? "col-span-2 h-auto" : ""
                }`}
              />
            )
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-3 mt-3 border-t border-gray-300">
        <button
          onClick={handleLike}
          className="flex items-center cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              liked ? "text-red-500 fill-red-500" : ""
            }`}
          />

          <span className="ml-1">{likes}</span>
        </button>
        <button
          onClick={() => setShowComments((previous) => !previous)}
          className="flex items-center cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="ml-1">{comments.length}</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center cursor-pointer"
        >
          <Share2Icon className="w-4 h-4" />
          <span className="ml-1">{shares}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="max-h-52 space-y-3 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-2 text-sm">
                <img
                  src={comment.user?.profile_picture}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <div className="min-w-0 rounded-lg bg-gray-50 px-3 py-2">
                  <p className="font-medium text-gray-800">{comment.user?.username || "User"}</p>
                  <p className="break-words text-gray-600">{comment.content}</p>
                </div>
              </div>
            ))}
            {!comments.length && <p className="text-sm text-gray-500">No comments yet.</p>}
          </div>
          <form onSubmit={handleComment} className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="rounded-lg bg-indigo-600 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Post comment"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {showShareOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Share post in chat</h2>
              <button type="button" onClick={() => setShowShareOptions(false)} aria-label="Close share options">
                <X className="size-5" />
              </button>
            </div>
            {isLoadingShareUsers && <p className="text-sm text-slate-500">Loading contacts...</p>}
            {!isLoadingShareUsers && !shareUsers.length && (
              <p className="text-sm text-slate-500">No contacts available.</p>
            )}
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {shareUsers.map((user) => (
                <button
                  type="button"
                  key={user._id}
                  onClick={() => sharePostWithUser(user._id)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-100"
                >
                  <img src={user.profile_picture} alt="" className="size-9 rounded-full object-cover" />
                  <span className="font-medium text-slate-700">{user.full_name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default PostCard;
