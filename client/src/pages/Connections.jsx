import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck } from "lucide-react";

function Connections() {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [currentTabs, setCurrentTabs] = useState("Followers");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const userId = storedUser?._id || storedUser?.id;
        const token = localStorage.getItem("token");

        if (!userId || !token) {
          setFollowers([]);
          setFollowing([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/messages/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to load connections");
        }

        setFollowers(data.user?.followers || []);
        setFollowing(data.user?.following || []);
      } catch (error) {
        console.error("Failed to load connections:", error);
        setFollowers([]);
        setFollowing([]);
      } finally {
        setLoading(false);
      }
    };

    loadConnections();
  }, []);

  const dataArrays = useMemo(
    () => [
      { label: "Followers", value: followers, icon: Users },
      { label: "Following", value: following, icon: UserCheck },
    ],
    [followers, following]
  );

  const currentData = dataArrays.find((item) => item.label === currentTabs) || dataArrays[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
          <p className="text-slate-600">See the people you follow and who follows you.</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-6">
          {dataArrays.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center gap-1 border h-24 w-40 border-gray-200 bg-white shadow rounded-md"
              >
                <Icon className="w-5 h-5 text-slate-500" />
                <b className="text-lg">{item.value.length}</b>
                <p className="text-slate-600">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm">
          {dataArrays.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                onClick={() => setCurrentTabs(tab.label)}
                className={`cursor-pointer flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  currentTabs === tab.label ? "bg-slate-900 text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="ml-1">{tab.label}</span>
                <span className="ml-2">{tab.value.length}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-6 mt-6">
          {loading ? (
            <div className="w-full p-6 bg-white rounded-md shadow text-slate-500">Loading connections...</div>
          ) : currentData?.value?.length ? (
            currentData.value.map((user) => (
              <div key={user._id || user.id} className="w-full max-w-sm flex gap-4 p-5 bg-white shadow rounded-md">
                <img
                  src={user.profile_picture || "https://via.placeholder.com/48"}
                  alt={user.full_name || "User"}
                  className="rounded-full w-12 h-12 object-cover shadow-md"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700">{user.full_name || "User"}</p>
                  <p className="text-slate-500">@{user.username || "username"}</p>

                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${user._id || user.id}`)}
                    className="mt-4 w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="mt-6 p-6 bg-white rounded-md shadow w-full text-slate-500 text-center">
              No {currentTabs.toLowerCase()} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Connections;
