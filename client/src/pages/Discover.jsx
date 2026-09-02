import React, { useState } from "react";
import { dummyConnectionsData } from "../assets/assets.js";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import UserCard from "../Components/UserCard.jsx";
import Loading from "../Components/loading.jsx";

function Discover() {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState(dummyConnectionsData);
  const [loading, setLoading] = useState(false);

  function handleSearch(e) {
    if (e.key === "Enter") {
      setUsers([]);
      setLoading(true);

      setTimeout(() => {
        const searchValue = input.toLowerCase().trim();

        if (!searchValue) {
          setUsers(dummyConnectionsData);
        } else {
          const filteredUsers = dummyConnectionsData.filter((user) => {
            const firstName = user.first_name || "";
            const lastName = user.last_name || "";
            const username = user.username || "";
            const bio = user.bio || "";
            const location = user.location || "";

            const userData = `
              ${firstName}
              ${lastName}
              ${username}
              ${bio}
              ${location}
            `.toLowerCase();

            return userData.includes(searchValue);
          });

          setUsers(filteredUsers);
        }

        setLoading(false);
      }, 1000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900
          mb-2">Discover People</h1>

          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transformation -translate-y-1/2
              text-slate-400 w-5 h-5" />

              <input
                type="text"
                placeholder="Search the people by name ,username,bio,or location"
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

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

        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
}

export default Discover;
