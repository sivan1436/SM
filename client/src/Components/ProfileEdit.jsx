import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Hand, Pencil } from "lucide-react";

function ProfileEdit({ setShowEdit }) {
    const user = dummyUserData;

    const [editform, setEditform] = useState({
        username: user.username,
        bio: user.bio,
        location: user.location,
        profile_picture: user.profile_picture,
        full_name: user.full_name,
        cover_photo: user.cover_photo
    });

    async function handleSaveProfile(e) {
        e.preventDefault();
    }

    return (
        <div className="fixed inset-0 z-110 h-screen overflow-y-scroll bg-black/50">

            <div className="max-w-2xl sm:py-6 mx-auto">

                <div className="bg-white rounded-lg shadow p-6">

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Edit Profile
                    </h1>

                    <form
                        className="space-y-4"
                        onSubmit={handleSaveProfile}
                    >

                        {/* Profile Picture */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Profile Picture
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                id="profile_picture"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files[0];

                                    if (file) {
                                        setEditform({
                                            ...editform,
                                            profile_picture: file
                                        });
                                    }
                                }}
                            />

                            <div className="relative group w-24 h-24">

                                <img
                                    src={
                                        editform.profile_picture instanceof File
                                            ? URL.createObjectURL(
                                                editform.profile_picture
                                            )
                                            : editform.profile_picture
                                    }
                                    className="w-24 h-24 rounded-full object-cover"
                                    alt="Profile"
                                />

                                <label
                                    htmlFor="profile_picture"
                                    className="absolute inset-0 hidden
                                    group-hover:flex items-center justify-center
                                    bg-black/30 rounded-full cursor-pointer"
                                >
                                    <Pencil className="w-5 h-5 text-white" />
                                </label>

                            </div>
                        </div>

                        {/* Cover Photo */}
                        <div className="flex flex-col items-start gap-3">

                            <label
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Cover Photo
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                id="cover_photo"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files[0];

                                    if (file) {
                                        setEditform({
                                            ...editform,
                                            cover_photo: file
                                        });
                                    }
                                }}
                            />

                            <div className="relative group/cover">

                                <img
                                    src={
                                        editform.cover_photo instanceof File
                                            ? URL.createObjectURL(
                                                editform.cover_photo
                                            )
                                            : editform.cover_photo
                                    }
                                    className="w-60 h-40 rounded-lg bg-gradient-to-r
                                    from-indigo-200 via-purple-200 to-pink-200
                                    object-cover mt-2"
                                    alt="Cover"
                                />

                                <label
                                    htmlFor="cover_photo"
                                    className="absolute inset-0 hidden
                                    group-hover/cover:flex
                                    bg-black/20 rounded-lg
                                    items-center justify-center
                                    cursor-pointer"
                                >
                                    <Pencil className="w-5 h-5 text-white" />
                                </label>

                            </div>

                        </div>
                        <div>
                            <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                                <input type="text" 
                                className="w-full p-3 border border-gray-200"
                                onChange={(e)=>setEditform({...editform,full_name :e .target.value})}
                                value={editform.full_name} placeholder="Enter your full name "/>
                            </label>
                        </div>
                        <div>
                            <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">
                                username
                                <input type="text" 
                                className="w-full p-3 border border-gray-200"
                                onChange={(e)=>setEditform({...editform,username :e .target.value})}
                                value={editform.username} placeholder="Enter your username "/>
                            </label>
                        </div>
                        <div>
                            <label htmlFor="" className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                                <input  type=' text' 
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                onChange={(e)=>setEditform({...editform,location : e.target.value})}
                                value={editform.location} placeholder="enter your location" />
                            </label>
                        </div>

                       <div className="flex justify-end space-x-3 pt-6">
                        <button  className="px-4 py-2 border border-gray-300 rounded-lg
                        text-gray-700 hover: bg-gray-50 transition-colors cursor-pointer"
                        onClick={()=>setShowEdit(false)}>
                         Cancel
                        </button>
                           <button onChange={handleSaveProfile()} 
                           className="px-4 py-2 bg-gradient-to-r form-indigo-500
                           to-purple-600 text-white rounded-lg hover:from-indigo-600
                           hover:to-purple-700 transition cursor-pointer" >
                         Save Changes
                        </button>

                       </div>
                     </form>

                </div>

            </div>

        </div>
    );
}

export default ProfileEdit;
