import { useEffect, useState } from "react";
import assets from "../assets/assets";
import Loading from "../Components/loading";
import Stories from "../Components/StoriesBar";
import PostCard from "../Components/Postcard";
import RecentMessages from "../Components/RecentMessages";

function Feed() {
  const [Feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchFeeds() {
    try {
      setError("");
      const response = await fetch("/api/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Posts could not be loaded");
      }

      setFeed(data.posts);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialFetch = window.setTimeout(fetchFeeds, 0);
    window.addEventListener("focus", fetchFeeds);
    return () => {
      window.clearTimeout(initialFetch);
      window.removeEventListener("focus", fetchFeeds);
    };
  }, []);

  return !loading ? (

    <div className="h-full overflow-y-scroll no scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
    {/* Stories and postlist */}
    <div>
     <Stories />
      <div className="p-4 space-y-6">
        {error && <p className="p-4 text-sm text-red-600">{error}</p>}
        {!error && Feed.map((post)=>(
          <PostCard key={post._id} post={post}/>
        ))}
        {!error && Feed.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No posts yet. Be the first to share something.</p>
        )}
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