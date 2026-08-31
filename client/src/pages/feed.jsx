import react, { useState } from "react";
import { useEffect } from "react";
import { dummyPostsData } from "../assets/assets";
import Loading from "../Components/loading";
import Stories from "../Components/Storieswalt";

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
        List of post
      </div>
    </div>
          {/* Right sideBar */}
          
          <div >
          <div>
            <h1>Sponcered</h1>
          </div>
          <h1>Recent Messages</h1>
          </div>
    </div>
  ) : <Loading />
};

export default Feed;