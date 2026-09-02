import { PenBox, Verified } from "lucide-react";
import React from "react";

function UserProfileInfo({user,posts,profileId,setShowEdit}){



    return(
<div className="relative py-4 px-4 md:px-8 bg-white">
   <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16
        rounded-full">
            <img src={user.profile_picture} className="absolute rounded-full z-2" alt="" />
        </div>
        <div className="w-full pt-16 md:pt-0 md:pl-36">
           <div className="flex flex-col md:flex-row items-start justify-between">
             <div >
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                <Verified className="w-6 h-6 text-blue-600"/>
                </div>
                <p className="text-gray-600">{user.username ? `@${user.username}` : 'Add Username'}</p>
             </div>
             {/* if user is not viewing others profile that means he is opening his profile
             so we will give edit button */}
             {!profileId && 
             <button onClick={()=>setShowEdit(true)}
             className="flex items-center gap-2 border border-gray-300 
             hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors
             mt-4 md:mt-0  cursor-pointer">
                <PenBox className="w-4 h-4"/>
                </button>}
           </div>
           <p className="text-gray-700 text-sm max-w-md mt-4">{user.bio}</p>
           <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm
           text-gray-500 mt-4"></div>
        </div>    
   </div>
</div>
    );
};

export default UserProfileInfo;