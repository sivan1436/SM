import Post from "../Models/Posts.js";
import mongoose from "mongoose";
import { cursorFilter, decodeCursor, paginatedResult, parseLimit } from "../utils/pagination.js";

const postPopulation = { path: "user", select: "full_name username profile_picture is_verified" };

async function findPopulatedPost(postId) {
    const post = await Post.findById(postId)
        .select("user content image_urls post_type likes_count comments shares_count createdAt")
        .populate(postPopulation)
        .lean();
    if (!post) return null;
    return {
        ...post,
        likes_count: post.likes_count.length,
        comments_count: post.comments.length,
        shares_count: post.shares_count.length,
        comments: undefined,
    };
}

export async function getFeeds(req, res) {
    try {
        const limit = parseLimit(req.query.limit);
        const cursor = decodeCursor(req.query.cursor);
        const posts = await Post.find(cursorFilter(cursor))
            .select("user content image_urls post_type likes_count comments shares_count createdAt")
            .populate(postPopulation)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean();
        const normalizedPosts = posts.map((post) => ({
            ...post,
            liked_by_me: post.likes_count?.some((id) => String(id) === String(req.user.id)) || false,
            likes_count: post.likes_count?.length || 0,
            comments_count: post.comments?.length || 0,
            shares_count: post.shares_count?.length || 0,
            comments: undefined,
        }));
        const result = paginatedResult(normalizedPosts, limit);

        return res.status(200).json({ success: true, posts: result.items, nextCursor: result.nextCursor, hasMore: result.hasMore });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Posts could not be retrieved",
            error: error.message,
        });
    }
}

export async function toggleLike(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.postId)) {
            return res.status(400).json({ success: false, message: "Invalid post id" });
        }

        const post = await Post.findById(req.params.postId).select("likes_count");
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const userId = String(req.user.id);
        const hasLiked = post.likes_count.some((id) => String(id) === userId);
        await Post.updateOne(
            { _id: post._id },
            hasLiked
                ? { $pull: { likes_count: req.user.id } }
                : { $addToSet: { likes_count: req.user.id } }
        );

        const updatedPost = await findPopulatedPost(post._id);
        return res.json({ success: true, liked: !hasLiked, post: updatedPost });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Like could not be updated" });
    }
}

export async function addComment(req, res) {
    try {
        const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
        if (!mongoose.isValidObjectId(req.params.postId)) {
            return res.status(400).json({ success: false, message: "Invalid post id" });
        }
        if (!content) {
            return res.status(400).json({ success: false, message: "Comment cannot be empty" });
        }

        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $push: { comments: { user: req.user.id, content } } },
            { new: true, runValidators: true }
        );
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const updatedPost = await Post.findById(post._id)
            .select("comments")
            .populate("comments.user", "full_name username profile_picture is_verified")
            .lean();
        const comment = updatedPost.comments[updatedPost.comments.length - 1];
        return res.status(201).json({
            success: true,
            comment,
            comments_count: updatedPost.comments.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Comment could not be added" });
    }
}

export async function sharePost(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.postId)) {
            return res.status(400).json({ success: false, message: "Invalid post id" });
        }

        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $addToSet: { shares_count: req.user.id } },
            { new: true }
        );
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        return res.json({ success: true, post: await findPopulatedPost(post._id) });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Share could not be recorded" });
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

export async function getComments(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.postId)) {
            return res.status(400).json({ success: false, message: "Invalid post id" });
        }

        const limit = parseLimit(req.query.limit);
        const post = await Post.findById(req.params.postId)
            .select("comments")
            .populate("comments.user", "full_name username profile_picture is_verified")
            .lean();
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const offset = req.query.cursor
            ? Number.parseInt(Buffer.from(req.query.cursor, "base64url").toString("utf8"), 10) || 0
            : 0;
        const reversedComments = post.comments.slice().reverse();
        const comments = reversedComments.slice(offset, offset + limit);
        return res.json({
            success: true,
            comments,
            nextCursor: offset + comments.length < reversedComments.length
                ? Buffer.from(String(offset + comments.length)).toString("base64url")
                : null,
            hasMore: offset + comments.length < reversedComments.length,
            comments_count: post.comments.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Comments could not be retrieved" });
    }
}