import {
  CalendarFoldIcon,
  MapPin,
  PenBox,
  Verified,
} from "lucide-react";
import moment from "moment";

function UserProfileInfo({
  user,
  posts,
  isOwnProfile,
  setShowEdit,
  onFollowersClick,
  onFollowingClick,
}) {
  return (
    <div className="relative bg-white px-4 py-4 md:px-8">
      <div className="flex flex-col items-start gap-6 md:flex-row">
        {/* Profile Picture */}
        <div className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white shadow-lg">
          <img
            src={user.profile_picture}
            className="h-full w-full rounded-full object-cover"
            alt={user.full_name || "Profile"}
          />
        </div>

        <div className="w-full pt-16 md:pl-36 md:pt-0">
          {/* User Info + Edit Button */}
          <div className="flex flex-col items-start justify-between md:flex-row">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>

                <Verified className="h-6 w-6 text-blue-600" />
              </div>

              <p className="text-gray-600">
                {user.username ? `@${user.username}` : "Add Username"}
              </p>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setShowEdit(true)}
                className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-50 md:mt-0"
              >
                <PenBox className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Bio */}
          <p className="mt-4 max-w-md text-sm text-gray-700">
            {user.bio || "Add a bio"}
          </p>

          {/* Location & Joined Date */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {user.location || "Add location"}
            </span>

            <span className="flex items-center gap-2">
              <CalendarFoldIcon className="h-4 w-4" />
              Joined{" "}
              <span className="font-medium">
                {moment(user.createdAt).fromNow()}
              </span>
            </span>
          </div>

          {/* Profile Stats */}
          <div className="mt-6 flex items-center gap-6 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-gray-900 sm:text-xl">
                {posts?.length || 0}
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">
                Posts
              </span>
            </div>

            <button
              type="button"
              onClick={onFollowersClick}
              className="flex cursor-pointer items-center gap-1 text-left hover:text-indigo-600"
            >
              <span className="text-lg font-bold text-gray-900 sm:text-xl">
                {user.followers?.length || 0}
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">
                Followers
              </span>
            </button>

            <button
              type="button"
              onClick={onFollowingClick}
              className="flex cursor-pointer items-center gap-1 text-left hover:text-indigo-600"
            >
              <span className="text-lg font-bold text-gray-900 sm:text-xl">
                {user.following?.length || 0}
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">
                Following
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileInfo;
