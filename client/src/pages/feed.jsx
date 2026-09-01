import react, { useState } from "react";
import { useEffect } from "react";
import assets, { dummyPostsData } from "../assets/assets";
import Loading from "../Components/loading";
import Stories from "../Components/StoriesBar";
import PostCard from "../Components/Postcard";

function Feed() {
  const [Feed,setFeed] = useState([])
  const [loading,setloading] = useState(true)
  
  function fetchFeeds(){
    setFeed(dummyPostsData)
    setloading(false)
  }
  useEffect(()=>{
    fetchFeeds()
  },[])
  return !loading ? (

    <div className="h-full overflow-y-scroll no scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
    {/* Stories and postlist */}
    <div>
     <Stories />
      <div className="p-4 space-y-6">
        {Feed.map((post)=>(
          <PostCard key={post._id} post={post}/>
        ))}
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
          <h1>Recent Messages</h1>
          </div>
    </div>
  ) : <Loading />
};

export default Feed;