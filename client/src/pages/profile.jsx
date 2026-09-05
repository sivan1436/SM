import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loading from "../Components/loading";
import UserProfileInfo from "../Components/UserProfileInf0";
import PostCard from "../Components/Postcard";
import moment from "moment";
import ProfileEdit from "../Components/ProfileEdit";

function Profile() {
  const { profileId } = useParams();

  const [user, setUser] = useState(null);
  const [posts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        setCurrentUserId(currentUser?._id ? String(currentUser._id) : null);
        setShowEdit(false);

        if (!profileId) {
          setUser(currentUser);
          return;
        }

        const token = localStorage.getItem("token");
        const response = await fetch(`/api/messages/users/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load profile");
        }

        setUser(data.user);
      } catch (fetchError) {
        setError(fetchError.message);
      }
    }

    fetchProfile();
  }, [profileId]);

  return error ? (
    <div className="p-6 text-red-500">{error}</div>
  ) : user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">

          {/* Cover Photo */}
          <div className="h-40 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 md:h-56">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            isOwnProfile={
              Boolean(
                currentUserId &&
                user._id &&
                currentUserId === String(user._id)
              )
            }
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="mx-auto flex max-w-md rounded-xl bg-white p-1 shadow">
            {["posts", "media", "videos"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                />
              ))}
            </div>
          )}

          {/* Media */}
          {activeTab === "media" && (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {posts
                .filter((post) => post.image_urls?.length > 0)
                .flatMap((post) =>
                  post.image_urls.map((image, index) => (
                    <Link
                      key={index}
                      to={image}
                      className="relative group"
                    >
                      <img
                        src={image}
                        className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        alt=""
                      />

                      <p
                        className="absolute bottom-0 right-0 p-1 px-3 text-xs
                        text-white opacity-0 backdrop-blur-xl
                        transition duration-300 group-hover:opacity-100"
                      >
                        Posted {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  ))
                )}
            </div>
          )}

          {/* Videos */}
          {activeTab === "videos" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts
                .filter((post) => post.video_url)
                .map((post) => (
                  <div key={post._id} className="w-full">
                    <video
                      src={post.video_url}
                      controls
                      className="w-full rounded-xl"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit profile model */}
      {showEdit && (
        <ProfileEdit
          user={user}
          setUser={setUser}
          setShowEdit={setShowEdit}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
}

export default Profile;
