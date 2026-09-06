import { useState } from "react";
import { BadgeCheck, Heart, MessageSquare, Send, Share2Icon } from "lucide-react";
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
    try {
      const response = await fetch(`/api/posts/${post._id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message);
      setShares(data.post.shares_count?.length || 0);
      await navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post._id}`);
      toast.success("Post link copied");
    } catch (error) {
      toast.error(error.message || "Post could not be shared");
    }
  };
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full max-w-2xl">

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
      
    </div>
  );
}

export default PostCard;
