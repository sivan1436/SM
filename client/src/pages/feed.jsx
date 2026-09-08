import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import assets from "../assets/assets";
import Loading from "../Components/loading";
import Stories from "../Components/StoriesBar";
import PostCard from "../Components/Postcard";
import RecentMessages from "../Components/RecentMessages";
import ReelsViewer from "../Components/ReelsViewer";
import { NavLink } from "react-router-dom";
import { menuItemsData } from "../assets/assets";
import { Plus, Video } from "lucide-react";

function Feed() {
  const [Feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReels, setShowReels] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestInFlight = useRef(false);
  const location = useLocation();

  async function fetchFeeds(cursor = null, append = false) {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    try {
      if (append) setIsLoadingMore(true);
      setError("");
      const query = new URLSearchParams({ limit: "20" });
      if (cursor) query.set("cursor", cursor);
      const response = await fetch(`/api/posts?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Posts could not be loaded");
      }

      setFeed((current) => append ? [...current, ...data.posts.filter((post) => !current.some((item) => item._id === post._id))] : data.posts);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
        const postId = new URLSearchParams(location.search).get("post");
        if (postId) {
          window.setTimeout(() => {
            document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: "smooth" });
          }, 0);
        }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      requestInFlight.current = false;
    }
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchFeeds, 0);
    window.addEventListener("focus", fetchFeeds);
    return () => {
      window.clearTimeout(initialFetch);
      window.removeEventListener("focus", fetchFeeds);
    };
  }, [location.search]);

  useEffect(() => {
    const scrollContainer = document.querySelector(".feed-scroll-container");
    if (!scrollContainer) return undefined;
    const handleScroll = () => {
      if (hasMore && !isLoadingMore && scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 400) {
        fetchFeeds(nextCursor, true);
      }
    };
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, nextCursor]);

  return !loading ? (

    <div className="feed-scroll-container h-full overflow-y-scroll no scrollbar px-1 py-10 pb-24 xl:pr-5 flex items-start justify-center xl:gap-8 xl:pb-10">
    {showReels && (
      <ReelsViewer
        reels={Feed.filter((post) => post.post_type === "video" && post.image_urls?.[0])}
        onClose={() => setShowReels(false)}
      />
    )}
    <button
      type="button"
      onClick={() => setShowReels(true)}
      disabled={!Feed.some((post) => post.post_type === "video" && post.image_urls?.[0])}
      aria-label="Open reels"
      className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Video className="size-5" />
      Reels
    </button>
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur-md xl:hidden" aria-label="Main navigation">
      {menuItemsData.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `flex min-w-14 flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}`}
          aria-label={label}
        >
          <Icon className="size-5" />
          <span>{label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/create-post"
        className="flex min-w-14 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-gray-500 transition hover:text-gray-900"
        aria-label="Create post"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
          <Plus className="size-4" />
        </span>
        <span>Create</span>
      </NavLink>
    </nav>
    {/* Stories and postlist */}
    <div>
     <Stories />
      <div className="p-4 space-y-6">
        {error && <p className="p-4 text-sm text-red-600">{error}</p>}
        {!error && Feed.filter((post) => post.post_type !== "video").map((post)=>(
          <PostCard key={post._id} post={post}/>
        ))}
        {!error && Feed.filter((post) => post.post_type !== "video").length === 0 && (
          <p className="p-4 text-sm text-slate-500">No posts yet. Be the first to share something.</p>
        )}
        {isLoadingMore && <p className="p-4 text-center text-sm text-slate-500">Loading more posts...</p>}
        {!hasMore && Feed.length > 0 && <p className="p-4 text-center text-sm text-slate-500">You are all caught up.</p>}
      </div>
    </div>
          {/* Right sideBar */}
          
          <div className="max-xl:hidden sticky top-0" >
          <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
            <h3 className="text-slate-800 font-semibold">Sponcered</h3>
          <img src={assets.sponsored_img} alt="" className="w-75 h-50 rounded-md" />
          <p className='text-slate-600'>Email Marketing</p>
          <p className='text-slate-600'>Learn more</p>
          </div>
          <RecentMessages />
          </div>
    </div>
  ) : <Loading />
};

export default Feed;