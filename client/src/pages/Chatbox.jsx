import React, { useEffect, useRef, useState } from "react";
import {
  dummyConnectionsData,
  dummyMessagesData,
} from "../assets/assets";
import { useNavigate, useParams } from "react-router-dom";
import {
  ImageIcon,
  SendHorizonal,
  X,
  Mic,
  Square,
} from "lucide-react";

function ChatBox() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [user, setUser] = useState(null);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  const messages = dummyMessagesData;

  // Find selected user
  useEffect(() => {
    const selectedUser = dummyConnectionsData.find(
      (user) => user._id === userId
    );

    setUser(selectedUser);
  }, [userId]);

  // Select multiple images/videos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );

    setImages((prev) => [...prev, ...validFiles]);

    // Allow selecting the same file again
    e.target.value = "";
  };

  // Remove image/video
  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      audioStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: "audio/webm",
          }
        );

        setAudio(audioBlob);

        // Stop microphone
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        audioStreamRef.current = null;
      };

      recorder.start();

      setIsRecording(true);
    } catch (error) {
      console.error("Microphone error:", error);
      alert(
        "Microphone permission is required to record voice messages."
      );
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Remove recorded audio
  const removeAudio = () => {
    setAudio(null);
  };

  // Send message
  async function sendMessage() {
   
  
  }

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Cleanup microphone when component unmounts
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    user && (
      <div className="flex flex-col h-screen">

        {/* User Header */}
        <div
          onClick={() =>
            navigate(`/profile/${user._id}`)
          }
          className="flex items-center gap-2 p-2 md:px-10 xl:pl-42
          bg-gradient-to-r from-indigo-50 to-purple-50
          border border-gray-300 cursor-pointer
          hover:bg-indigo-100 transition"
        >
          <img
            src={user.profile_picture}
            alt=""
            className="size-8 rounded-full"
          />

          <div>
            <p className="font-medium">
              {user.full_name}
            </p>

            <p className="text-sm text-gray-500 mt-1.5">
              @{user.username}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 md:px-10 flex-1 overflow-y-scroll">
          <div className="space-y-4 max-w-4xl mx-auto">

            {messages
              .toSorted(
                (a, b) =>
                  new Date(a.createdAt) -
                  new Date(b.createdAt)
              )
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.to_user_id !== user._id
                      ? "items-start"
                      : "items-end"
                  }`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white
                    text-slate-700 rounded-lg shadow ${
                      message.to_user_id !== user._id
                        ? "rounded-bl-none"
                        : "rounded-br-none"
                    }`}
                  >

                    {/* Image Message */}
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        className="w-full max-w-sm rounded-lg mb-1"
                        alt=""
                      />
                    )}

                    {/* Video Message */}
                    {message.message_type === "video" && (
                      <video
                        src={message.media_url}
                        controls
                        className="w-full max-w-sm rounded-lg mb-1"
                      />
                    )}

                    {/* Audio Message */}
                    {message.message_type === "audio" && (
                      <audio
                        src={message.media_url}
                        controls
                        className="max-w-full"
                      />
                    )}

                    {/* Text Message */}
                    {message.text && (
                      <p>{message.text}</p>
                    )}

                  </div>
                </div>
              ))}

            <div ref={messagesEndRef} />

          </div>
        </div>

        {/* Input Area */}
        <div className="p-4">
          <div className="w-full max-w-xl mx-auto">

            {/* Selected Media Preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2">

                {images.map((file, index) => {
                  const previewUrl =
                    URL.createObjectURL(file);

                  return (
                    <div
                      key={index}
                      className="relative group"
                    >

                      {/* Video */}
                      {file.type.startsWith("video/") ? (
                        <video
                          src={previewUrl}
                          className="w-24 h-24 object-cover
                          rounded-lg border"
                          controls
                        />
                      ) : (

                        /* Image */
                        <img
                          src={previewUrl}
                          alt="Selected"
                          className="w-24 h-24 object-cover
                          rounded-lg border"
                        />
                      )}

                      {/* Remove Media */}
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute -top-2 -right-2
                        flex items-center justify-center
                        w-6 h-6 rounded-full
                        bg-gray-700 text-white
                        hover:bg-red-500 transition
                        cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>

                    </div>
                  );
                })}

              </div>
            )}

            {/* Audio Preview */}
            {audio && (
              <div className="relative flex items-center
              gap-2 mb-2 p-2 w-fit bg-gray-100
              rounded-lg">

                <audio
                  src={URL.createObjectURL(audio)}
                  controls
                />

                {/* Remove Audio */}
                <button
                  type="button"
                  onClick={removeAudio}
                  className="flex items-center justify-center
                  w-7 h-7 rounded-full
                  bg-gray-700 text-white
                  hover:bg-red-500 transition
                  cursor-pointer"
                >
                  <X className="size-4" />
                </button>

              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="flex items-center gap-2
              mb-2 px-3 py-2 w-fit
              bg-red-50 text-red-500 rounded-lg">

                <span className="w-2 h-2 bg-red-500
                rounded-full animate-pulse" />

                <span className="text-sm font-medium">
                  Recording...
                </span>
              </div>
            )}

            {/* Input Box */}
            <div
              className="flex items-center gap-3 pl-5 p-1.5
              bg-white w-full border border-gray-200
              shadow rounded-full"
            >

              {/* Image / Video Selector */}
              <label
                htmlFor="images"
                className="cursor-pointer"
              >
                <ImageIcon
                  className="size-7 text-gray-400
                  hover:text-gray-600 transition"
                />

                <input
                  type="file"
                  id="images"
                  accept="image/*,video/*"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </label>

              {/* Text Input */}
              <input
                type="text"
                className="flex-1 outline-none
                text-slate-700"
                placeholder={
                  isRecording
                    ? "Recording voice..."
                    : "type a message..."
                }
                disabled={isRecording}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                onChange={(e) =>
                  setText(e.target.value)
                }
                value={text}
              />

              {/* Microphone */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-2 rounded-full
                  bg-red-500 hover:bg-red-600
                  active:scale-90 transition
                  text-white cursor-pointer"
                >
                  <Square className="size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 rounded-full
                  text-gray-500 hover:text-gray-700
                  hover:bg-gray-100
                  active:scale-90 transition
                  cursor-pointer"
                >
                  <Mic className="size-5" />
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={isRecording}
                className="p-2 mr-1 rounded-full
                text-gray-700 hover:text-black
                hover:bg-gray-100
                active:scale-90 transition-all
                cursor-pointer disabled:opacity-40"
              >
                <SendHorizonal className="size-5" />
              </button>

            </div>

          </div>
        </div>

      </div>
    )
  );
}

export default ChatBox;
