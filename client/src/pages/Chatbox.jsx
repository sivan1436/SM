import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  const location = useLocation();

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [olderCursor, setOlderCursor] = useState(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const [sharedPost, setSharedPost] = useState(
    location.state?.sharedPost || null
  );

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER + INITIAL MESSAGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadChat() {
      try {
        setLoadError("");

        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [userResponse, messagesResponse] =
          await Promise.all([
            fetch(`/api/messages/users/${userId}`, {
              headers,
            }),

            fetch(`/api/messages/${userId}?limit=30`, {
              headers,
            }),
          ]);

        const userData = await userResponse.json();
        const messagesData = await messagesResponse.json();

        if (cancelled) return;

        if (!userResponse.ok || !userData.success) {
          throw new Error(
            userData.message || "Unable to load user"
          );
        }

        if (!messagesResponse.ok) {
          throw new Error(
            messagesData.message ||
              "Unable to load messages"
          );
        }

        setUser(userData.user);

        setMessages(
          (messagesData.messages || []).sort(
            (a, b) =>
              new Date(a.createdAt) -
              new Date(b.createdAt)
          )
        );

        setOlderCursor(messagesData.nextCursor);
        setHasOlderMessages(messagesData.hasMore);
      } catch (error) {
        if (!cancelled) {
          console.error("Load chat error:", error);
          setLoadError(error.message);
        }
      }
    }

    loadChat();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | MARK MESSAGES AS SEEN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function markMessagesSeen() {
      try {
        const token = localStorage.getItem("token");

        await fetch(`/api/messages/${userId}/seen`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error(
          "Mark messages seen error:",
          error
        );
      }
    }

    if (userId) {
      markMessagesSeen();
    }
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC MESSAGE POLLING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function refreshMessages() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `/api/messages/${userId}?limit=30`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || cancelled) return;

        const incomingMessages = data.messages || [];

        setMessages((currentMessages) => {
          const messageMap = new Map();

          currentMessages.forEach((message) => {
            messageMap.set(
              String(message._id),
              message
            );
          });

          incomingMessages.forEach((message) => {
            messageMap.set(
              String(message._id),
              message
            );
          });

          return Array.from(messageMap.values()).sort(
            (a, b) =>
              new Date(a.createdAt) -
              new Date(b.createdAt)
          );
        });

        setOlderCursor(data.nextCursor);
        setHasOlderMessages(data.hasMore);
      } catch (error) {
        console.error(
          "Message refresh error:",
          error
        );
      }
    }

    const interval = setInterval(
      refreshMessages,
      2500
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | LOAD OLDER MESSAGES
  |--------------------------------------------------------------------------
  */

  async function loadOlderMessages() {
    if (
      !olderCursor ||
      !hasOlderMessages ||
      isLoadingOlder
    ) {
      return;
    }

    setIsLoadingOlder(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/messages/${userId}?limit=30&cursor=${encodeURIComponent(
          olderCursor
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load older messages"
        );
      }

      setMessages((currentMessages) => {
        const existing = new Set(
          currentMessages.map((message) =>
            String(message._id)
          )
        );

        const olderMessages = (
          data.messages || []
        ).filter(
          (message) =>
            !existing.has(String(message._id))
        );

        return [
          ...olderMessages,
          ...currentMessages,
        ];
      });

      setOlderCursor(data.nextCursor);
      setHasOlderMessages(data.hasMore);
    } catch (error) {
      console.error(
        "Load older messages error:",
        error
      );

      setSendError(error.message);
    } finally {
      setIsLoadingOlder(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FILE SELECTION
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );

    setImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    e.target.value = "";
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE MEDIA
  |--------------------------------------------------------------------------
  */

  const removeImage = (index) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RECORD AUDIO
  |--------------------------------------------------------------------------
  */

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
          audioChunksRef.current.push(
            event.data
          );
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

        stream
          .getTracks()
          .forEach((track) => track.stop());

        audioStreamRef.current = null;
      };

      recorder.start();

      setIsRecording(true);
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      alert(
        "Microphone permission is required to record voice messages."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STOP RECORDING
  |--------------------------------------------------------------------------
  */

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE AUDIO
  |--------------------------------------------------------------------------
  */

  const removeAudio = () => {
    setAudio(null);
  };

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  async function sendMessage() {
    if (
      !text.trim() &&
      images.length === 0 &&
      !audio &&
      !sharedPost
    ) {
      return;
    }

    if (isSending) return;

    setIsSending(true);
    setSendError("");

    try {
      const formData = new FormData();

      formData.append(
        "text",
        text.trim()
      );

      images.forEach((file) => {
        formData.append("media", file);
      });

      if (audio) {
        formData.append(
          "media",
          audio,
          "voice-message.webm"
        );
      }

      if (sharedPost) {
        formData.append(
          "shared_post_id",
          sharedPost._id
        );
      }

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `/api/messages/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to send message"
        );
      }

      /*
       * Add newly created messages without duplicates.
       */
      setMessages((currentMessages) => {
        const messageMap = new Map();

        currentMessages.forEach((message) => {
          messageMap.set(
            String(message._id),
            message
          );
        });

        (data.messages || []).forEach(
          (message) => {
            messageMap.set(
              String(message._id),
              message
            );
          }
        );

        return Array.from(
          messageMap.values()
        ).sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );
      });

      setText("");
      setImages([]);
      setAudio(null);
      setSharedPost(null);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SCROLL TO LATEST MESSAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
  |--------------------------------------------------------------------------
  | CLEANUP MICROPHONE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CLEANUP AUDIO / VIDEO PREVIEWS
  |--------------------------------------------------------------------------
  */

  const getPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  if (loadError) {
    return (
      <div className="p-6 text-red-500">
        {loadError}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#efeae2]">

      {/* =========================================================
          USER HEADER
      ========================================================= */}

      <div
        onClick={() =>
          navigate(
            `/profile/${user._id}`
          )
        }
        className="
          flex items-center gap-2
          p-2 md:px-10 xl:pl-42
          bg-white border-b border-gray-300
          cursor-pointer
          hover:bg-gray-50
          transition
        "
      >
        <img
          src={user.profile_picture}
          alt=""
          className="size-8 rounded-full object-cover"
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

      {/* =========================================================
          MESSAGES
      ========================================================= */}

      <div
        ref={messagesContainerRef}
        className="
          p-5 md:px-10
          flex-1
          overflow-y-scroll
        "
        onScroll={(event) => {
          if (
            event.currentTarget.scrollTop <
            120
          ) {
            loadOlderMessages();
          }
        }}
      >
        {isLoadingOlder && (
          <p className="mb-3 text-center text-xs text-slate-500">
            Loading older messages...
          </p>
        )}

        <div className="space-y-3 max-w-4xl mx-auto">

          {messages
            .slice()
            .sort(
              (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
            )
            .map((message) => {

              /*
               * If message.to_user_id is current chat user,
               * then current user sent the message.
               */
              const isSent =
                String(
                  message.to_user_id
                ) === String(user._id);

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isSent
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`
                      relative
                      max-w-sm
                      px-3 py-2
                      rounded-lg
                      shadow-sm
                      ${
                        isSent
                          ? "bg-[#d9fdd3] rounded-br-none"
                          : "bg-white rounded-bl-none"
                      }
                    `}
                  >

                    {/* =================================================
                        SHARED POST
                    ================================================= */}

                    {message.message_type ===
                      "shared_post" &&
                      message.shared_post && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/feed?post=${message.shared_post._id}`
                            )
                          }
                          className="
                            mb-1
                            block
                            w-full
                            overflow-hidden
                            rounded-lg
                            bg-slate-50
                            text-left
                            hover:bg-slate-100
                          "
                        >
                          {message.shared_post
                            .image_urls?.[0] && (
                            <img
                              src={
                                message
                                  .shared_post
                                  .image_urls[0]
                              }
                              alt="Shared post"
                              className="
                                h-32
                                w-full
                                object-cover
                              "
                            />
                          )}

                          <span className="block p-2 text-sm text-slate-700">
                            {message.shared_post
                              .content ||
                              "Shared a post with you"}
                          </span>
                        </button>
                      )}

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    {message.message_type ===
                      "image" && (
                      <img
                        src={message.media_url}
                        alt=""
                        className="
                          max-w-full
                          rounded-lg
                          mb-1
                        "
                      />
                    )}

                    {/* =================================================
                        VIDEO
                    ================================================= */}

                    {message.message_type ===
                      "video" && (
                      <video
                        src={message.media_url}
                        controls
                        preload="metadata"
                        className="
                          max-w-full
                          rounded-lg
                          mb-1
                        "
                      />
                    )}

                    {/* =================================================
                        AUDIO
                    ================================================= */}

                    {message.message_type ===
                      "audio" && (
                      <audio
                        src={message.media_url}
                        controls
                        className="max-w-full"
                      />
                    )}

                    {/* =================================================
                        TEXT
                    ================================================= */}

                    {message.text && (
                      <p className="text-sm text-slate-800 break-words">
                        {message.text}
                      </p>
                    )}

                    {/* =================================================
                        SENT MESSAGE STATUS
                    ================================================= */}

                    {isSent && (
                      <div
                        className="
                          flex
                          items-center
                          justify-end
                          gap-1
                          mt-1
                        "
                      >

                        <span
                          className="
                            text-[10px]
                            text-gray-500
                          "
                        >
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

                        {/* 
                          Message exists in database = delivered.

                          seen false = gray check

                          seen true = blue double check
                        */}

                        {message.seen ? (
                          <CheckCheck
                            className="
                              w-4 h-4
                              text-[#53bdeb]
                            "
                          />
                        ) : (
                          <Check
                            className="
                              w-4 h-4
                              text-gray-500
                            "
                          />
                        )}
                      </div>
                    )}

                    {/* =================================================
                        RECEIVED MESSAGE TIME
                    ================================================= */}

                    {!isSent && (
                      <div
                        className="
                          text-[10px]
                          text-gray-500
                          text-right
                          mt-1
                        "
                      >
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

      {/* =========================================================
          INPUT AREA
      ========================================================= */}

      <div className="p-4 bg-[#efeae2]">

        <div className="w-full max-w-xl mx-auto">

          {/* =======================================================
              SELECTED IMAGES / VIDEOS
          ======================================================= */}

          {images.length > 0 && (
            <div
              className="
                flex
                flex-wrap
                gap-2
                mb-2
                p-2
              "
            >
              {images.map(
                (file, index) => {

                  const previewUrl =
                    getPreviewUrl(file);

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
                          className="
                            w-24
                            h-24
                            object-cover
                            rounded-lg
                            border
                          "
                        />
                      ) : (
                        <img
                          src={previewUrl}
                          alt=""
                          className="
                            w-24
                            h-24
                            object-cover
                            rounded-lg
                            border
                          "
                        />
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="
                          absolute
                          -top-2
                          -right-2
                          flex
                          items-center
                          justify-center
                          w-6
                          h-6
                          rounded-full
                          bg-gray-700
                          text-white
                          hover:bg-red-500
                          cursor-pointer
                        "
                      >
                        <X className="size-4" />
                      </button>

                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* =======================================================
              AUDIO PREVIEW
          ======================================================= */}

          {audio && (
            <div
              className="
                relative
                flex
                items-center
                gap-2
                mb-2
                p-2
                w-fit
                bg-white
                rounded-lg
                shadow
              "
            >
              <audio
                src={URL.createObjectURL(
                  audio
                )}
                controls
              />

              <button
                type="button"
                onClick={removeAudio}
                className="
                  flex
                  items-center
                  justify-center
                  w-7
                  h-7
                  rounded-full
                  bg-gray-700
                  text-white
                  hover:bg-red-500
                  cursor-pointer
                "
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* =======================================================
              RECORDING INDICATOR
          ======================================================= */}

          {isRecording && (
            <div
              className="
                flex
                items-center
                gap-2
                mb-2
                px-3
                py-2
                w-fit
                bg-red-50
                text-red-500
                rounded-lg
              "
            >
              <span
                className="
                  w-2
                  h-2
                  bg-red-500
                  rounded-full
                  animate-pulse
                "
              />

              <span className="text-sm font-medium">
                Recording...
              </span>
            </div>
          )}

          {/* =======================================================
              INPUT BOX
          ======================================================= */}

          <div
            className="
              flex
              items-center
              gap-3
              px-4
              py-2
              bg-white
              border
              border-gray-200
              shadow-sm
              rounded-full
            "
          >

            {/* Image / Video */}

            <label
              htmlFor="images"
              className="cursor-pointer"
            >
              <ImageIcon
                className="
                  size-6
                  text-gray-500
                  hover:text-gray-700
                "
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
              className="
                flex-1
                outline-none
                text-slate-700
                min-w-0
              "
              placeholder={
                isRecording
                  ? "Recording..."
                  : "Type a message..."
              }
              disabled={
                isRecording ||
                isSending
              }
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            {/* =====================================================
                MICROPHONE
            ===================================================== */}

            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="
                  p-2
                  rounded-full
                  bg-red-500
                  text-white
                  hover:bg-red-600
                  active:scale-90
                  transition
                  cursor-pointer
                "
              >
                <Square className="size-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={isSending}
                className="
                  p-2
                  rounded-full
                  text-gray-500
                  hover:bg-gray-100
                  active:scale-90
                  transition
                  cursor-pointer
                  disabled:opacity-40
                "
              >
                <Mic className="size-5" />
              </button>
            )}

            {/* =====================================================
                SEND
            ===================================================== */}

            <button
              type="button"
              onClick={sendMessage}
              disabled={
                isRecording ||
                isSending
              }
              className="
                p-2
                rounded-full
                text-gray-700
                hover:bg-gray-100
                hover:text-black
                active:scale-90
                transition
                cursor-pointer
                disabled:opacity-40
              "
            >
              <SendHorizonal className="size-5" />
            </button>

          </div>

          {/* Send error */}

          {sendError && (
            <p className="mt-2 text-sm text-red-500">
              {sendError}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default ChatBox;
