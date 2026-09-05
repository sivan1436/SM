import { useState } from "react";
import { MapPin, Plus, Send, UserPlus } from "lucide-react";

function UserCard({ user, onUserUpdated }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [isFollowing, setIsFollowing] = useState(
    currentUser?.following?.some((id) => id.toString() === user._id.toString())
  );
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  async function handleFollow(event) {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token || !currentUser?._id) return;

    try {
      setIsFollowingLoading(true);
      const response = await fetch(`/api/connections/${user._id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not follow user");
      }

      setCurrentUser(data.currentUser);
      setIsFollowing(true);
      localStorage.setItem("user", JSON.stringify(data.currentUser));
      onUserUpdated?.(data.user);
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setIsFollowingLoading(false);
    }
  }

  function handleConnectionRequest(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      key={user._id}
      className="p-4 pt-6 flex flex-col justify-between w-72 min-h-80 shadow-md border border-gray-200 rounded-md bg-white"
    >
      <div>
        <img
          src={user.profile_picture}
          alt=""
          className="rounded-full w-16 h-16 object-cover shadow-md mx-auto"
        />

        <p className="mt-4 font-semibold text-center">{user.full_name}</p>

        {user.username && (
          <p className="text-gray-500 font-light text-center">
            @{user.username}
          </p>
        )}

        {user.bio && (
          <p className="text-gray-600 mt-2 text-center text-sm px-4 leading-relaxed">
            {user.bio}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1">
          <MapPin className="w-4 h-4 shrink-0 text-gray-500" />
          <span className="truncate max-w-24">{user.location}</span>
        </div>

        <div className="flex items-center gap-1 border border-gray-300 rounded-md px-2 py-1">
          <span>{user.followers?.length || 0}</span>
          Followers
        </div>
      </div>
      <div className="flex mt-4 gap-2">
        {/* F0ll0w Button */}
        <button onClick={handleFollow}
        disabled={isFollowing || isFollowingLoading}
        className="w-full py-2 rounded-md flex justify-center
        items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600
        hover : from-indigo-600 hover:to-purple-700 active:scale-95 transition
        text-white cursor-pointer"> 
            <UserPlus className="w-4 h-4" />{isFollowing ? 'Following' : isFollowingLoading ? 'Following...' : 'Follow'}
        </button>
 {/* connection/msg Button */}
 <button onClick={handleConnectionRequest}
 className="flex items-center justify-center w-16 border
 text-slate-500 group rounded-md cursor-pointer active:scale-95 transition"
 >{currentUser?.connections?.includes(user._id) ? 
    <Send className="w-5 h-5 group-hover:scale-105 transition"/> : <Plus className="w-5 h-5 group-hover:scale-105 transition"/> }</button>
      </div>
    </div>
  );
}

export default UserCard;
