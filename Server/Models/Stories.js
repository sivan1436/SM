import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    media_url: {
      type: String,
      default: "",
    },

    media_type: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },

    background_color: {
      type: String,
      default: "#4f46e5",
    },
  },
  {
    timestamps: true,
  }
);

storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const Story = mongoose.model("Story", storySchema);

export default Story;
