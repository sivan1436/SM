import react from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/sidebar.jsx";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { dummyUserData } from "../assets/assets.js";
import Loading from "../Components/loading.jsx";

const Layout = () => {
  const [SideBarOpen,setSideBarOpen] = useState(false);
  const user = dummyUserData
  return user ?(
    <div className = "w-full flex h-screen">

      <Sidebar sideBarOpen={SideBarOpen} setSideBarOpen={setSideBarOpen}/>
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>
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