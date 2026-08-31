import React from "react";
import { Routes, Route } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import Feed from "./pages/feed.jsx";
import Discover from "./pages/Discover.jsx";
import Login from "./pages/login.jsx";
import Profile from "./pages/profile.jsx";
import Messages from "./pages/messages.jsx";
import ChatBox from "./pages/Chatbox.jsx";
import Connections from "./pages/Connections.jsx";
import CreatePost from "./pages/createpost.jsx";
import Layout from "./pages/layout.jsx";

const App = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Layout /> : <Login />}>
        <Route index element={<Feed />} />
        <Route path="feed" element={<Feed />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:userId" element={<ChatBox />} />
        <Route path="connections" element={<Connections />} />
        <Route path="profile/:profileId" element={<Profile />} />
        <Route path="create-post" element={<CreatePost />} />
      </Route>
    </Routes>
  );
};

export default App;