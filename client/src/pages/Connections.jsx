import React, { useState } from "react";
import {useNavigate}  from "react-router-dom"
import {
  Users,
  UserPlus,
  UserCheck,
  UserRound,
} from "lucide-react";

import {
  dummyConnectionsData as connections,
  dummyFollowersData as followers,
  dummyFollowingData as following,
  dummyPendingConnectionsData as pendingConnections,
} from "../assets/assets";

function Connections() {
  const dataArrays = [
    {
      label: "Followers",
      value: followers,
      icon: Users,
    },
    {
      label: "Following",
      value: following,
      icon: UserCheck,
    },
    {
      label: "Pending",
      value: pendingConnections,
      icon: UserRound,
    },
    {
      label: "Connection",
      value: connections,
      icon: UserPlus,
    },
  ];

  // Default tab
  const [currentTabs, setcurrentTabs] = useState("Followers");

  // Find currently selected tab
  const currentData = dataArrays.find(
    (item) => item.label === currentTabs
  );
 const Navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Connections
          </h1>

          <p className="text-slate-600">
            Talk to your friends and family
          </p>
        </div>

        {/* Counts */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArrays.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center
                gap-1 border h-24 w-40 border-gray-200
                bg-white shadow rounded-md"
              >
                <Icon className="w-5 h-5 text-slate-500" />

                <b className="text-lg">
                  {item.value.length}
                </b>

                <p className="text-slate-600">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div
          className="inline-flex flex-wrap items-center
          border border-gray-200 rounded-md p-1
          bg-white shadow-sm"
        >
          {dataArrays.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.label}
                onClick={() => setcurrentTabs(tab.label)}
                className={`cursor-pointer flex items-center
                px-3 py-2 text-sm rounded-md
                transition-colors ${
                  currentTabs === tab.label
                    ? "bg-slate-900 text-white"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                <Icon className="w-4 h-4" />

                <span className="ml-1">
                  {tab.label}
                </span>

                <span className="ml-2">
                  {tab.value.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Users / Connections */}
        <div className="flex flex-wrap gap-6 mt-6">
          {currentData?.value?.map((user) => (
            <div
              key={user._id}
              className="w-full max-w-88 flex gap-5 p-6
              bg-white shadow rounded-md"
            >
              {/* Profile Image */}
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="rounded-full w-12 h-12
                object-cover shadow-md"
              />

              {/* User Information */}
              <div className="flex-1">
                <p className="font-medium text-slate-700">
                  {user.full_name}
                </p>

                <p className="text-slate-500">
                  @{user.username}
                </p>
                <p className="text-sm text-gray-600">
                  {user.bio.slice(0,30)}...
                  </p>
                  <div className="flex max-sm:flex-col gap-2 mt-4">
                  {
                    <button onClick={()=>Navigate(`/profile/${user._id}`)}
                    className="w-full p-2 text-sm rounded bg-gradient-to-r
                    from-indigo-500 to-purple-600 hover:from-indigo-600
                    hover:to-purple-700 active:scale-95
                    transition text-white cursor-point">
                      View Profile
                    </button>
                  }
                  {
                   currentTabs === 'Following' && (
                    <button 
                    className="w-full p-2 text-sm rounded bg-slate-100
                    hover:bg-slate-200 text-black active:scale-95 transition
                    cursor-pointer">Unfollow

                    </button>
                   )
                  }
                  {
                   currentTabs === 'Pending' && (
                    <button 
                    className="w-full p-2 text-sm rounded bg-slate-100
                    hover:bg-slate-200 text-black active:scale-95 transition
                    cursor-pointer">Accept

                    </button>
                   )
                  }
                    {
                   currentTabs === 'Connection' && (
                    <button onClick={()=>Navigate(`/messages/${user._id}`)}
                    className="w-full p-2 text-sm rounded bg-slate-100
                    hover:bg-slate-200 text-black active:scale-95 transition
                    cursor-pointer">Message

                    </button>
                   )
                  }
                  
                  
                  </div>
              </div>
            </div>
          ))}
        </div>

        {/* No users message */}
        {currentData?.value?.length === 0 && (
          <div className="mt-6 p-6 bg-white rounded-md shadow">
            <p className="text-slate-500 text-center">
              No {currentTabs.toLowerCase()} found.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Connections;
