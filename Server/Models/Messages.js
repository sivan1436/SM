import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    message_type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },

    media_url: {
      type: String,
      default: "",
    },

    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  from_user_id: 1,
  to_user_id: 1,
  createdAt: -1,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
