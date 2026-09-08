import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Messages() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMessages() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load messages"
          );
        }

        // New/unseen messages first,
        // then newest conversations.
        const sortedConversations = [...data].sort((a, b) => {
          const aSeen = !(
            a.lastMessage?.seen === false &&
            String(a.lastMessage.to_user_id) === String(currentUserId)
          );
          const bSeen = !(
            b.lastMessage?.seen === false &&
            String(b.lastMessage.to_user_id) === String(currentUserId)
          );

          // Unseen first
          if (aSeen !== bSeen) {
            return aSeen ? 1 : -1;
          }

          // Then newest message first
          const aTime = new Date(
            a.lastMessage?.createdAt || 0
          ).getTime();

          const bTime = new Date(
            b.lastMessage?.createdAt || 0
          ).getTime();

          return bTime - aTime;
        });

        setConversations(sortedConversations);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, []);

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Messages
          </h1>

          <p className="text-slate-600">
            Chat with your followers and people you follow
          </p>
        </div>

        {/* Conversations */}
        <div className="flex flex-col gap-3">

          {isLoading && (
            <p className="text-slate-500">
              Loading messages...
            </p>
          )}

          {!isLoading && error && (
            <p className="text-red-500">
              {error}
            </p>
          )}

          {!isLoading &&
            !error &&
            conversations.map(({ user, lastMessage }) => {

              const isUnseen =
                lastMessage &&
                lastMessage.seen === false &&
                String(lastMessage.to_user_id) === String(currentUserId);

              return (
                <div
                  key={user._id}
                  onClick={() =>
                    navigate(`/messages/${user._id}`)
                  }
                  className={`
                    max-w-xl
                    flex
                    items-center
                    gap-4
                    p-4
                    rounded-md
                    cursor-pointer
                    transition
                    ${
                      isUnseen
                        ? "bg-indigo-50 border border-indigo-200 shadow-md"
                        : "bg-white shadow hover:bg-slate-50"
                    }
                  `}
                >

                  {/* Profile Picture */}
                  <div className="relative shrink-0">

                    <img
                      src={user.profile_picture}
                      alt=""
                      className="rounded-full size-12 object-cover"
                    />

                    {/* Unseen indicator */}
                    {isUnseen && (
                      <span
                        className="
                          absolute
                          -top-1
                          -right-1
                          size-3
                          rounded-full
                          bg-indigo-600
                          border-2
                          border-white
                        "
                      />
                    )}

                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between gap-2">

                      <p
                        className={
                          isUnseen
                            ? "font-bold text-slate-900"
                            : "font-medium text-slate-700"
                        }
                      >
                        {user.full_name}
                      </p>

                      {isUnseen && (
                        <span className="
                          text-xs
                          font-semibold
                          text-indigo-600
                        ">
                          New
                        </span>
                      )}

                    </div>

                    <p className="text-sm text-slate-500">
                      @{user.username}
                    </p>

                    {/* Last Message */}
                    <p
                      className={`
                        text-sm
                        truncate
                        mt-1
                        ${
                          isUnseen
                            ? "font-semibold text-slate-700"
                            : "text-gray-500"
                        }
                      `}
                    >
                      {lastMessage?.text ||
                        (lastMessage
                          ? "Media"
                          : "No messages yet")}
                    </p>

                  </div>

                </div>
              );
            })}

          {!isLoading &&
            !error &&
            conversations.length === 0 && (
              <p className="text-slate-500">
                No followers or following users yet.
              </p>
            )}

        </div>
      </div>
    </div>
  );
}

export default Messages;
