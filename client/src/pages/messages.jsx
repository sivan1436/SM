import React from "react";
import { dummyConnectionsData, dummyMessagesData } from "../assets/assets";
import { useNavigate } from "react-router-dom";

function Messages() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        {/* title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            messages
          </h1>

          <p className="text-slate-600">
            connect with your loved people
          </p>
        </div>

        {/* connected users */}
        <div className="flex flex-col gap-3">
          {dummyConnectionsData.map((user) => {

            const lastMessage = dummyMessagesData
              .filter(
                (message) =>
                  message.sender_id === user._id ||
                  message.receiver_id === user._id
              )
              .sort(
                (a, b) =>
                  new Date(b.createdAt) - new Date(a.createdAt)
              )[0];

            return (
              <div
                key={user._id}
                onClick={() => navigate(`/messages/${user._id}`)}
                className="max-w-xl flex items-center gap-4 p-4
                bg-white shadow rounded-md cursor-pointer
                hover:bg-slate-50 transition"
              >

                {/* Profile Picture */}
                <img
                  src={user.profile_picture}
                  alt=""
                  className="rounded-full size-12"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700">
                    {user.full_name}
                  </p>

                  <p className="text-sm text-slate-500">
                    @{user.username}
                  </p>

                  {/* Last Message */}
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {lastMessage?.text || "No messages yet"}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Messages;
