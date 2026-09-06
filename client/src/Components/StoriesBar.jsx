import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModel from "./CreateStory";
import StoryViewer from "./Storyviewer.jsx";

const getUserId = (user) => user?._id || user?.id || user;

function Stories() {
  const [stories, setStories] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = getUserId(currentUser);

  async function fetchStories() {
    try {
      const response = await fetch("/api/stories?limit=30", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Stories could not be loaded");
      }

      const groupedStories = data.stories.reduce((groups, story) => {
        const userId = getUserId(story.user);
        const existingGroup = groups.find(
          (group) => String(group.userId) === String(userId)
        );

        if (existingGroup) {
          existingGroup.stories.push(story);
        } else {
          groups.push({
            userId,
            user: story.user,
            stories: [story],
          });
        }

        return groups;
      }, []);

      setStories(groupedStories);
    } catch {
      setStories([]);
    }
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchStories, 0);
    return () => window.clearTimeout(initialFetch);
  }, []);

  // Open story
  const openStory = (story, index) => {
    setCurrentStoryIndex(index);
    setViewStory(story);
  };

  const removeStory = (storyId) => {
    setStories((currentGroups) => currentGroups
      .map((group) => ({
        ...group,
        stories: group.stories.filter((story) => story._id !== storyId),
      }))
      .filter((group) => group.stories.length > 0));
  };

  const currentUserGroup = stories.find(
    (group) => String(group.userId) === String(currentUserId)
  );
  const otherStoryGroups = stories.filter(
    (group) => String(group.userId) !== String(currentUserId)
  );

  const openCurrentUserStories = () => {
    if (currentUserGroup) {
      const currentUserIndex = stories.findIndex(
        (group) => group.userId === currentUserGroup.userId
      );
      openStory(currentUserGroup, currentUserIndex);
      return;
    }

    setShowModel(true);
  };

  const renderStoryMedia = (story) => {
    if (!story || story.media_type === "text") return null;

    return story.media_type === "image" ? (
      <img
        src={story.media_url}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-75"
      />
    ) : (
      <video
        src={story.media_url}
        className="absolute inset-0 h-full w-full object-cover opacity-75"
        muted
        preload="metadata"
      />
    );
  };

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">

        {/* Current user's story card */}
        <div
          onClick={openCurrentUserStories}
          className="relative min-w-30 max-w-30 h-40 overflow-hidden rounded-lg shadow cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-indigo-300 bg-gradient-to-b from-indigo-500 to-purple-600"
        >
          {renderStoryMedia(currentUserGroup?.stories[0])}

          <button
            type="button"
            aria-label="Add another story"
            onClick={(event) => {
              event.stopPropagation();
              setShowModel(true);
            }}
            className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow hover:bg-indigo-50"
          >
            <Plus className="size-5" />
          </button>

          <img
            src={currentUser?.profile_picture || currentUserGroup?.user?.profile_picture}
            alt=""
            className="absolute left-3 top-3 z-10 size-8 rounded-full object-cover ring-2 ring-white shadow"
          />
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 text-white">
            <p className="truncate text-sm font-medium">Your story</p>
            <p className="text-xs text-white/75">
              {currentUserGroup
                ? `${currentUserGroup.stories.length} ${currentUserGroup.stories.length === 1 ? "story" : "stories"}`
                : "Create story"}
            </p>
          </div>
        </div>

        {/* Other users' story cards */}
        {otherStoryGroups.map((group) => {
          const story = group.stories[0];
          const groupIndex = stories.findIndex((item) => item.userId === group.userId);

          return (
          <div
            key={group.userId}
            onClick={() => openStory(group, groupIndex)}
            className="relative min-w-30 max-w-30 h-40 overflow-hidden rounded-lg shadow cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95"
          >
            {renderStoryMedia(story)}

            {/* User Profile */}
            <img
              src={group.user.profile_picture}
              alt=""
              className="absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
            />

            {/* Story Content */}
            <p className="absolute inset-x-3 bottom-8 z-10 truncate text-sm text-white">
              {story.content || `${group.stories.length} stories`}
            </p>

            {/* Time */}
            <p className="text-white absolute bottom-1 right-2 z-10 text-xs">
              {moment(story.createdAt).fromNow()}
            </p>
          </div>
          );
        })}
      </div>

      {/* Story Creation Modal */}
      {showModel && (
        <StoryModel
          setShowModel={setShowModel}
          fetchStories={fetchStories}
        />
      )}

      {/* Story Viewer */}
      {viewStory && (
        <StoryViewer
          stories={stories}
          viewStory={viewStory}
          currentStoryIndex={currentStoryIndex}
          setCurrentStoryIndex={setCurrentStoryIndex}
          setViewStory={setViewStory}
          removeStory={removeStory}
        />
      )}
    </div>
  );
}

export default Stories;
