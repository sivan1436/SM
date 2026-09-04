import React, { useState } from "react";
import { dummyConnectionsData } from "../assets/assets.js";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import UserCard from "../Components/UserCard.jsx";
import Loading from "../Components/loading.jsx";
import axios from "axios";

function Discover() {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState(dummyConnectionsData);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    if (e.key !== "Enter") return;

    const searchValue = input.trim();

    if (!searchValue) {
      setUsers(dummyConnectionsData);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:4000/api/users/search",
        {
          username: searchValue,
        }
      );

      if (data.success) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>

          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2
                text-slate-400 w-5 h-5"
              />

              <input
                type="text"
                placeholder="Search people by username"
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && <Loading height="60vh" />}

        {/* Users */}
        {!loading && (
          <div className="flex flex-wrap gap-6">
            {users.map((user) => (
              <Link
                to={`/profile/${user._id}`}
                key={user._id}
              >
                <UserCard user={user} />
              </Link>
            ))}
          </div>
        )}

        {/* No users */}
        {!loading && users.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Discover;
