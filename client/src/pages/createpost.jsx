import { useState } from "react";
import { Image, X } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function CreatePost() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);

          if (video.duration <= 30) {
            setImages((prev) => [...prev, file]);
          } else {
            alert("Videos must be 30 seconds or less");
          }
        };

        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image/")) {
        setImages((prev) => [...prev, file]);
      }
    });

    e.target.value = "";
  };

  async function handleSubmit() {
    if (loading) return;

    if (!content.trim() && images.length === 0) {
      throw new Error("Add some text or media before posting");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      images.forEach((image) => formData.append("media", image));

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Post could not be uploaded");
      }

      setContent("");
      setImages([]);
      navigate("/feed");
    } finally {
      setLoading(false);
    }
  }

  const handlePost = () => {
    if (loading) return;

    toast.promise(handleSubmit(), {
      loading: "Uploading...",
      success: "Post has been uploaded",
      error: (error) => error.message || "Post has not uploaded, try again",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Post
          </h1>

          <p className="text-slate-600">
            Share your thoughts with the world
          </p>
        </div>

        {/* form */}
        <div className="max-w-xl bg-white p-4 sm:p-6 sm:pb-3 rounded-xl shadow-md space-y-4">

          {/* user */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt=""
              className="w-12 h-12 rounded-full shadow"
            />

            <div>
              <h1 className="font-semibold">
                {user?.full_name || "Your profile"}
              </h1>

              <p className="text-sm text-gray-500">
                @{user?.username || "user"}
              </p>
            </div>
          </div>

          {/* text area */}
          <textarea
            className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400"
            placeholder="what's happening"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* images / videos */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((image, i) => {
                const previewUrl = URL.createObjectURL(image);

                return (
                  <div key={i} className="relative group">

                    {image.type.startsWith("video/") ? (
                      <video
                        src={previewUrl}
                        className="h-20 w-28 rounded-md object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt=""
                        className="h-20 rounded-md object-cover"
                      />
                    )}

                    <div
                      onClick={() =>
                        setImages(
                          images.filter(
                            (_, index) => index !== i
                          )
                        )
                      }
                      className="absolute hidden group-hover:flex justify-center
                      items-center inset-0 bg-black/40 rounded-md cursor-pointer"
                    >
                      <X className="w-6 h-6 text-white" />
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300">

            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500
              hover:text-gray-700 transition cursor-pointer"
            >
              <Image className="size-6" />
            </label>

            <input
              type="file"
              id="images"
              accept="image/*,video/*"
              hidden
              multiple
              onChange={handleFileChange}
            />

            <button
              disabled={loading}
              onClick={handlePost}
              className="text-sm bg-gradient-to-r from-indigo-500
              to-purple-600 hover:from-indigo-600 hover:to-purple-700
              active:scale-95 transition text-white font-medium px-8 py-2
              rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Post"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default CreatePost;
