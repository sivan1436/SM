import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ImageIcon,
  SendHorizonal,
  X,
  Mic,
  Square,
  Check,
  CheckCheck,
} from "lucide-react";

function ChatBox() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  useEffect(() => {
    async function loadChat() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [userResponse, messagesResponse] = await Promise.all([
          fetch(`/api/messages/users/${userId}`, { headers }),
          fetch(`/api/messages/${userId}`, { headers }),
        ]);
        const userData = await userResponse.json();
        const messagesData = await messagesResponse.json();

        if (!userResponse.ok || !userData.success) {
          throw new Error(userData.message || "Unable to load user");
        }

        if (!messagesResponse.ok) {
          throw new Error(messagesData.message || "Unable to load messages");
        }

        setUser(userData.user);
        setMessages(messagesData);
      } catch (error) {
        setLoadError(error.message);
      }
    }

    loadChat();
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

    e.target.value = "";
  };

  // Remove image/video
  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // Start recording
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

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Remove audio
  const removeAudio = () => {
    setAudio(null);
  };

  // Send message
  async function sendMessage() {
    if (
      !text.trim() &&
      images.length === 0 &&
      !audio
    ) {
      return;
    }

    setIsSending(true);
    setSendError("");

    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      images.forEach((file) => formData.append("media", file));
      if (audio) formData.append("media", audio, "voice-message.webm");

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/messages/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send message");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        ...data.messages,
      ]);
      setText("");
      setImages([]);
      setAudio(null);
    } catch (error) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  }

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Cleanup microphone
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
    loadError ? (
      <div className="p-6 text-red-500">{loadError}</div>
    ) : user && (
      <div className="flex flex-col h-screen bg-[#efeae2]">

        {/* User Header */}
        <div
          onClick={() =>
            navigate(`/profile/${user._id}`)
          }
          className="flex items-center gap-2 p-2 md:px-10 xl:pl-42
          bg-white border-b border-gray-300
          cursor-pointer hover:bg-gray-50 transition"
        >
          <img
            src={user.profile_picture}
            alt=""
            className="size-8 rounded-full"
          />

          <div>
            <p className="font-medium text-slate-800">
              {user.full_name}
            </p>

            <p className="text-sm text-gray-500">
              @{user.username}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 md:px-10 flex-1 overflow-y-scroll">
          <div className="space-y-3 max-w-4xl mx-auto">

            {messages
              .toSorted(
                (a, b) =>
                  new Date(a.createdAt) -
                  new Date(b.createdAt)
              )
              .map((message, index) => {

                const isSent =
                  message.to_user_id === user._id;

                return (
                  <div
                    key={index}
                    className={`flex ${
                      isSent
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`relative max-w-sm px-3 py-2
                      rounded-lg shadow-sm ${
                        isSent
                          ? "bg-[#d9fdd3] rounded-br-none"
                          : "bg-white rounded-bl-none"
                      }`}
                    >

                      {/* Image */}
                      {message.message_type ===
                        "image" && (
                        <img
                          src={message.media_url}
                          alt=""
                          className="max-w-full rounded-lg mb-1"
                        />
                      )}

                      {/* Video */}
                      {message.message_type ===
                        "video" && (
                        <video
                          src={message.media_url}
                          controls
                          className="max-w-full rounded-lg mb-1"
                        />
                      )}

                      {/* Audio */}
                      {message.message_type ===
                        "audio" && (
                        <audio
                          src={message.media_url}
                          controls
                          className="max-w-full"
                        />
                      )}

                      {/* Text */}
                      {message.text && (
                        <p className="text-sm text-slate-800">
                          {message.text}
                        </p>
                      )}

                      {/* Message Time + Read Status */}
                      {isSent && (
                        <div
                          className="flex items-center
                          justify-end gap-1 mt-1"
                        >

                          <span className="text-[10px]
                          text-gray-500">
                            {message.createdAt
                              ? new Date(
                                  message.createdAt
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </span>

                          {/* WhatsApp-style ticks */}
                          {message.seen ? (
                            <CheckCheck
                              className="w-4 h-4
                              text-[#53bdeb]"
                            />
                          ) : (
                            <Check
                              className="w-4 h-4
                              text-gray-500"
                            />
                          )}

                        </div>
                      )}

                      {/* Time for received message */}
                      {!isSent && (
                        <div className="text-[10px]
                        text-gray-500 text-right mt-1">
                          {message.createdAt
                            ? new Date(
                                message.createdAt
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            <div ref={messagesEndRef} />

          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#efeae2]">
          <div className="w-full max-w-xl mx-auto">

            {/* Selected Images/Videos */}
            {images.length > 0 && (
              <div
                className="flex flex-wrap gap-2
                mb-2 p-2"
              >
                {images.map((file, index) => {

                  const previewUrl =
                    URL.createObjectURL(file);

                  return (
                    <div
                      key={index}
                      className="relative"
                    >

                      {file.type.startsWith(
                        "video/"
                      ) ? (
                        <video
                          src={previewUrl}
                          controls
                          className="w-24 h-24
                          object-cover rounded-lg
                          border"
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt=""
                          className="w-24 h-24
                          object-cover rounded-lg
                          border"
                        />
                      )}

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute
                        -top-2 -right-2
                        flex items-center
                        justify-center
                        w-6 h-6 rounded-full
                        bg-gray-700 text-white
                        hover:bg-red-500
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
              <div
                className="relative flex items-center
                gap-2 mb-2 p-2 w-fit
                bg-white rounded-lg shadow"
              >

                <audio
                  src={URL.createObjectURL(audio)}
                  controls
                />

                <button
                  type="button"
                  onClick={removeAudio}
                  className="flex items-center
                  justify-center w-7 h-7
                  rounded-full bg-gray-700
                  text-white hover:bg-red-500
                  cursor-pointer"
                >
                  <X className="size-4" />
                </button>

              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div
                className="flex items-center gap-2
                mb-2 px-3 py-2 w-fit
                bg-red-50 text-red-500 rounded-lg"
              >
                <span
                  className="w-2 h-2 bg-red-500
                  rounded-full animate-pulse"
                />

                <span className="text-sm font-medium">
                  Recording...
                </span>
              </div>
            )}

            {/* Input Box */}
            <div
              className="flex items-center gap-3
              px-4 py-2 bg-white
              border border-gray-200
              shadow-sm rounded-full"
            >

              {/* Image / Video */}
              <label
                htmlFor="images"
                className="cursor-pointer"
              >
                <ImageIcon
                  className="size-6
                  text-gray-500
                  hover:text-gray-700"
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

              {/* Text */}
              <input
                type="text"
                className="flex-1 outline-none
                text-slate-700"
                placeholder={
                  isRecording
                    ? "Recording..."
                    : "Type a message..."
                }
                disabled={isRecording || isSending}
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              {/* Mic */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-2 rounded-full
                  bg-red-500 text-white
                  hover:bg-red-600
                  active:scale-90 transition
                  cursor-pointer"
                >
                  <Square className="size-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 rounded-full
                  text-gray-500
                  hover:bg-gray-100
                  active:scale-90 transition
                  cursor-pointer"
                >
                  <Mic className="size-5" />
                </button>
              )}

              {/* Send */}
              <button
                type="button"
                onClick={sendMessage}
                disabled={isRecording || isSending}
                className="p-2 rounded-full
                text-gray-700
                hover:bg-gray-100
                hover:text-black
                active:scale-90
                transition cursor-pointer
                disabled:opacity-40"
              >
                <SendHorizonal className="size-5" />
              </button>

            </div>

            {sendError && (
              <p className="mt-2 text-sm text-red-500">{sendError}</p>
            )}

          </div>
        </div>

      </div>
    )
  );
}

export default ChatBox;
