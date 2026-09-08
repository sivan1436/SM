import react from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/sidebar.jsx";
import { useEffect, useState } from "react";
import { Menu, Plus, Video, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { dummyUserData } from "../assets/assets.js";
import Loading from "../Components/loading.jsx";
import { menuItemsData } from "../assets/assets.js";
import ReelsViewer from "../Components/ReelsViewer.jsx";

const Layout = () => {
  const [SideBarOpen,setSideBarOpen] = useState(false);
  const [reels, setReels] = useState([]);
  const [showReels, setShowReels] = useState(false);
  const navigate = useNavigate();
  const user = dummyUserData

  useEffect(() => {
    let isMounted = true;

    fetch("/api/posts?limit=50", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && data.success) {
          setReels(data.posts.filter((post) => post.post_type === "video" && post.image_urls?.[0]));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return user ?(
    <div className = "w-full flex h-screen">

      <Sidebar sideBarOpen={SideBarOpen} setSideBarOpen={setSideBarOpen}/>
      <div className="relative flex-1 bg-slate-50 pb-16 xl:pb-0">
        <Outlet />
      </div>
      {showReels && <ReelsViewer reels={reels} onClose={() => setShowReels(false)} />}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur-md xl:hidden" aria-label="Main navigation">
        {menuItemsData.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setSideBarOpen(false)}
            className={({ isActive }) => `flex min-w-14 flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"}`}
            aria-label={label}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => reels.length ? setShowReels(true) : navigate("/feed")}
          aria-label="Watch reels"
          className="flex min-w-14 flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!reels.length}
        >
          <Video className="size-5" />
          <span>Reels</span>
        </button>
        <NavLink
          to="/create-post"
          className="flex min-w-14 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-gray-500 transition hover:text-gray-900"
          aria-label="Create post"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
            <Plus className="size-4" />
          </span>
          <span>Create</span>
        </NavLink>
      </nav>
      {
        SideBarOpen ? 
        <X className = "absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow
        w-10 h-10 text-gray-600 sm:hidden" onClick = {()=>setSideBarOpen(false)}/>
        : 
        <Menu className="absolute top-3 p-2 z-100 bg-white rounded-md
        shadow w-10 h-10 text-gray-600 sm:hidden" onClick = {()=>setSideBarOpen(true)}/>
      }
    </div>
  ) : (
    <Loading />
  )

};

export default Layout;