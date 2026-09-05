import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      default: "",
      maxlength: 5000,
    },

    image_urls: [
      {
        type: String,
      },
    ],

    post_type: {
      type: String,
      enum: [
        "text",
        "image",
        "text_with_image",
        "video",
      ],
      default: "text",
    },

    likes_count: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
      },
    ],

    shares_count: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
