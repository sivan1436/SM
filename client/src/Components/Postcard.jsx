import { useState } from "react";
import { BadgeCheck, Heart, MessageSquare, Share2Icon } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function PostCard({ post }) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [likes, setLikes] = useState(post.likes_count?.length || 0);
  const [liked, setLiked] = useState(
    post.likes_count?.includes(currentUser?._id || currentUser?.id) || false
  );

  const postWithHashTags = post.content
    ? post.content.replace(
        /#(\w+)/g,
        '<span class="text-indigo-600">#$1</span>'
      )
    : "";

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
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
          onClick={handleLike}
          className="flex items-center cursor-pointer"
        >
          <MessageSquare
            className={`w-4 h-4`}
          />

          <span className="ml-1">{7}</span>
        </button>
          <button
          onClick={handleLike}
          className="flex items-center cursor-pointer"
        >
          <Share2Icon
            className={`w-4 h-4 `}
          />

          <span className="ml-1">{12}</span>
        </button>
        
      </div>
      
    </div>
  );
}

export default PostCard;
