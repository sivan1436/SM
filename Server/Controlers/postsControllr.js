import Post from "../Models/Posts.js";
import mongoose from "mongoose";

export async function getFeeds(_req, res) {
    try {
        const posts = await Post.find()
            .populate("user", "full_name username profile_picture is_verified")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, posts });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Posts could not be retrieved",
            error: error.message,
        });
    }
}

export async function createPost(req, res) {
    try {
        const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
        const files = req.files || [];

        if (!content && files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Add some text or at least one image or video",
            });
        }

        const imageUrls = files.map(
            (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
        );
        const hasVideo = files.some((file) => file.mimetype.startsWith("video/"));
        const post = await Post.create({
            user: req.user.id,
            content,
            image_urls: imageUrls,
            post_type: hasVideo ? "video" : files.length ? (content ? "text_with_image" : "image") : "text",
        });

        const populatedPost = await Post.findById(post._id).populate(
            "user",
            "full_name username profile_picture is_verified"
        );

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: populatedPost,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }

        return res.status(500).json({
            success: false,
            message: "Post could not be created",
            error: error.message,
        });
    }
}