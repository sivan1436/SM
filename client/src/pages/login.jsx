import React from "react";
import assets from "../assets/assets.js";
import { Star } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <img
        src={assets.bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 50 / 50 Column Layout */}
      <div className="relative z-10 min-h-screen grid grid-cols-1 md:grid-cols-2">

        {/* Left Side - 50% */}
        <div className="flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">

          {/* Logo */}
          <img
            src={assets.logo}
            alt="Logo"
            className="h-12 object-contain"
          />

          {/* Users / Rating */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <img
                src={assets.group_users}
                alt="Users"
                className="h-8 md:h-10"
              />

              <div>
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <Star
                        key={index}
                        className="size-5 text-transparent fill-amber-500"
                      />
                    ))}
                </div>

                <p className="text-white">
                  Used by 12k+ users
                </p>
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl md:pb-2 font-bold
              bg-gradient-to-r from-indigo-950 to-indigo-800
              bg-clip-text text-transparent"
            >
              more than just friends truely connect
            </h1>

            <p
              className="text-xl md:text-3xl text-indigo-900
              max-w-72 md:max-w-md"
            >
              connect with global community on Scrink
            </p>
          </div>

          <span className="md:h-10"></span>
        </div>

        {/* Right Side - 50% */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          {/* Login content will go here */}
        </div>

      </div>
    </div>
  );
};

export default Login;
