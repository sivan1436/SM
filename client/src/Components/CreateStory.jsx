import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast"
function StoryModel({ setShowModel, fetchStories }) {
  const bgColor = [
    "#4f46e5",
    "#7c3aed",
    "rgb(69, 59, 81)",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const [mode, setMode] = useState("text");
  const [bg, setBg] = useState(bgColor[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  function handleMedia(e) {
    const file = e.target.files?.[0];

    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMode("media");
    }
  }

  async function handleCreateStory() {
    // Add your story creation logic here

    await fetchStories();
    setShowModel(false);
  }

  return (
    <div className="fixed inset-0 z-[110] min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowModel(false)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>

          <h1 className="text-lg font-semibold">Create Story</h1>

          <span className="w-10"></span>
        </div>

        {/* Preview Area */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: bg }}
        >
          {/* Text Story */}
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your Mind?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}

          {/* Media Story */}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-cover"
              />
            ))}
        </div>

        {/* Background Color Buttons */}
        <div className="flex mt-4 gap-2">
          {bgColor.map((color) => (
            <button
              key={color}
              type="button"
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBg(color)}
            />
          ))}
        </div>

        {/* Text / Media Selection */}
        <div className="flex gap-2 mt-4">
          {/* Text Button */}
          <button
            type="button"
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "text"
                ? "bg-white text-black"
                : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} />
            Text
          </button>

          {/* Photo / Video Button */}
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media"
                ? "bg-white text-black"
                : "bg-zinc-800"
            }`}
          >
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMedia}
            />

            <Upload size={18} />
            Photo/Video
          </label>
        </div>
        <button onClick={()=>toast.promise(handleCreateStory(),{loading : 'saving...',success : <p>Story Added</p>,error : e=><p>{e.message}</p>,})} className="flex item-center justify-center gap-2 text-white
        py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600
        hoer:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer">
            <Sparkle size ={18} /> Create Story
        </button>
      </div>
    </div>
  );
}

export default StoryModel;