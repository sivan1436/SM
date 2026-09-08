import Message from "../Models/Messages.js";
import User from "../Models/User.js";
import Post from "../Models/Posts.js";
import mongoose from "mongoose";
import { emitMessage } from "../utils/socket.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {
  cursorFilter,
  decodeCursor,
  paginatedResult,
  parseLimit,
} from "../utils/pagination.js";

/*
|--------------------------------------------------------------------------
| GET CONVERSATIONS
|--------------------------------------------------------------------------
*/
export async function getMessages(req, res) {
  try {
    const currentUser = await User.findById(req.user.id).select(
      "followers following connections"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const contactIds = [
      ...new Set([
        ...currentUser.followers.map(String),
        ...currentUser.following.map(String),
        ...currentUser.connections.map(String),
      ]),
    ].slice(0, 50);

    const [connections, messages] = await Promise.all([
      User.find({
        _id: { $in: contactIds },
      }).select("full_name username profile_picture"),

      Message.find({
        $or: [
          { from_user_id: currentUser._id },
          { to_user_id: currentUser._id },
        ],
      })
        .sort({ createdAt: -1, _id: -1 })
        .limit(500)
        .select(
          "from_user_id to_user_id text message_type createdAt seen"
        )
        .lean(),
    ]);

    const latestMessages = new Map();
    const unseenCounts = new Map();

    messages.forEach((message) => {
      const isFromCurrentUser =
        String(message.from_user_id) === String(currentUser._id);

      const otherUserId = isFromCurrentUser
        ? String(message.to_user_id)
        : String(message.from_user_id);

      // Latest message
      if (!latestMessages.has(otherUserId)) {
        latestMessages.set(otherUserId, message);
      }

      // Count unseen received messages
      if (
        !isFromCurrentUser &&
        message.seen === false
      ) {
        unseenCounts.set(
          otherUserId,
          (unseenCounts.get(otherUserId) || 0) + 1
        );
      }
    });

    const result = connections.map((connection) => {
      const connectionId = String(connection._id);

      return {
        user: connection,
        lastMessage: latestMessages.get(connectionId) || null,
        unseenCount: unseenCounts.get(connectionId) || 0,
      };
    });

    // Conversations with newest message first
    result.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;

      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;

      return dateB - dateA;
    });

    return res.json(result);
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load messages",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET USER
|--------------------------------------------------------------------------
*/
export async function getUserById(req, res) {
  try {
    const limit = parseLimit(req.query.limit);

    const user = await User.findById(req.params.userId).select(
      "full_name username profile_picture cover_photo bio location is_verified followers following connections"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({
      user: user._id,
    })
      .select(
        "user content image_urls post_type likes_count comments shares_count createdAt"
      )
      .populate(
        "user",
        "full_name username profile_picture is_verified"
      )
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .limit(limit)
      .lean();

    const [followers, following] = await Promise.all([
      User.find({
        _id: {
          $in: user.followers.slice(0, limit),
        },
      })
        .select(
          "full_name username profile_picture is_verified bio location"
        )
        .lean(),

      User.find({
        _id: {
          $in: user.following.slice(0, limit),
        },
      })
        .select(
          "full_name username profile_picture is_verified bio location"
        )
        .lean(),
    ]);

    const safeUser = {
      ...user.toObject(),
      followers,
      following,
      followers_count: user.followers.length,
      following_count: user.following.length,
      connections_count: user.connections.length,
    };

    const boundedPosts = posts.map((post) => ({
      ...post,
      likes_count: post.likes_count.length,
      comments_count: post.comments.length,
      shares_count: post.shares_count.length,
      comments: undefined,
    }));

    return res.json({
      success: true,
      user: safeUser,
      posts: boundedPosts,
      hasMorePosts: posts.length === limit,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }
}

/*
|--------------------------------------------------------------------------
| GET CONVERSATION
|--------------------------------------------------------------------------
*/
export async function getConversation(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const otherUser = await User.exists({
      _id: userId,
    });

    if (!otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const limit = parseLimit(req.query.limit);
    const cursor = decodeCursor(req.query.cursor);

    const messages = await Message.find({
      $or: [
        {
          from_user_id: req.user.id,
          to_user_id: userId,
        },
        {
          from_user_id: userId,
          to_user_id: req.user.id,
        },
      ],
      ...cursorFilter(cursor),
    })
      .populate({
        path: "shared_post",
        select: "user content image_urls post_type createdAt",
        populate: {
          path: "user",
          select: "full_name username profile_picture",
        },
      })
      .select(
        "from_user_id to_user_id text message_type media_url shared_post seen createdAt"
      )
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .limit(limit + 1)
      .lean();

    const result = paginatedResult(messages, limit);

    return res.json({
      messages: result.items.reverse(),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error("Get conversation error:", error);

    return res.status(500).json({
      message: "Unable to load conversation",
    });
  }
}

/*
|--------------------------------------------------------------------------
| SEND MESSAGE
|--------------------------------------------------------------------------
*/
export async function sendMessage(req, res) {
  try {
    const { userId } = req.params;

    const text = req.body.text?.trim() || "";
    const sharedPostId =
      req.body.shared_post_id?.trim() || "";

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    if (String(req.user.id) === String(userId)) {
      return res.status(400).json({
        message: "You cannot message yourself",
      });
    }

    const recipient = await User.exists({
      _id: userId,
    });

    if (!recipient) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const uploadedFiles = req.files || [];

    let sharedPost = null;

    if (sharedPostId) {
      if (!mongoose.isValidObjectId(sharedPostId)) {
        return res.status(400).json({
          message: "Invalid shared post",
        });
      }

      sharedPost = await Post.exists({
        _id: sharedPostId,
      });

      if (!sharedPost) {
        return res.status(404).json({
          message: "Shared post not found",
        });
      }
    }

    if (
      !text &&
      !sharedPost &&
      uploadedFiles.length === 0
    ) {
      return res.status(400).json({
        message: "Message cannot be empty",
      });
    }

    const messages = [];

    // Text
    if (text) {
      messages.push({
        from_user_id: req.user.id,
        to_user_id: userId,
        text,
        message_type: "text",
        seen: false,
      });
    }

    // Shared post
    if (sharedPost) {
      messages.push({
        from_user_id: req.user.id,
        to_user_id: userId,
        message_type: "shared_post",
        shared_post: sharedPostId,
        seen: false,
      });
    }

    // Media
    for (const file of uploadedFiles) {
      const messageType = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
        ? "video"
        : "audio";

      messages.push({
        from_user_id: req.user.id,
        to_user_id: userId,
        message_type: messageType,
        media_url: await uploadToCloudinary(file, "scrink/messages"),
        seen: false,
      });
    }

    const createdMessages =
      await Message.insertMany(messages);

    await Message.populate(createdMessages, {
      path: "shared_post",
      populate: {
        path: "user",
        select:
          "full_name username profile_picture is_verified",
      },
    });

    createdMessages.forEach(emitMessage);

    return res.status(201).json({
      success: true,
      messages: createdMessages,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      message: "Unable to send message",
    });
  }
}

/*
|--------------------------------------------------------------------------
| MARK MESSAGES AS SEEN
|--------------------------------------------------------------------------
*/
export async function markMessagesSeen(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const result = await Message.updateMany(
      {
        from_user_id: userId,
        to_user_id: req.user.id,
        seen: false,
      },
      {
        $set: {
          seen: true,
        },
      }
    );

    return res.json({
      success: true,
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark messages seen error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark messages as seen",
    });
  }
}
