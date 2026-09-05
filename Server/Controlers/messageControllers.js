import Message from "../Models/Messages.js";
import User from "../Models/User.js";
import Post from "../Models/Posts.js";
import mongoose from "mongoose";

export async function getMessages(req, res) {
	try {
		const currentUser = await User.findById(req.user.id).select(
			"followers following connections"
		);

		if (!currentUser) {
			return res.status(404).json({ message: "User not found" });
		}

		const contactIds = [
			...new Set([
				...currentUser.followers.map(String),
				...currentUser.following.map(String),
				...currentUser.connections.map(String),
			]),
		];

		const [connections, messages] = await Promise.all([
			User.find({ _id: { $in: contactIds } }).select(
				"full_name username profile_picture"
			),
			Message.find({
				$or: [{ from_user_id: currentUser._id }, { to_user_id: currentUser._id }],
			})
				.sort({ createdAt: -1 })
				.select("from_user_id to_user_id text message_type createdAt seen"),
		]);

		const latestMessages = new Map();

		messages.forEach((message) => {
			const otherUserId = message.from_user_id.equals(currentUser._id)
				? message.to_user_id.toString()
				: message.from_user_id.toString();

			if (!latestMessages.has(otherUserId)) {
				latestMessages.set(otherUserId, message);
			}
		});

		return res.json(
			connections.map((connection) => ({
				user: connection,
				lastMessage: latestMessages.get(connection._id.toString()) || null,
			}))
		);
	} catch (error) {
		console.error("Get messages error:", error);
		return res.status(500).json({ message: "Unable to load messages" });
	}
}

export async function getUserById(req, res) {
	try {
		const user = await User.findById(req.params.userId).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const posts = await Post.find({ user: user._id })
			.populate([
				{ path: "user", select: "full_name username profile_picture is_verified" },
				{
					path: "comments.user",
					select: "full_name username profile_picture is_verified",
				},
			])
			.sort({ createdAt: -1 });

		return res.json({ success: true, user, posts });
	} catch (error) {
		return res.status(400).json({
			success: false,
			message: "Invalid user id",
		});
	}
}

export async function getConversation(req, res) {
	try {
		const { userId } = req.params;

		if (!mongoose.isValidObjectId(userId)) {
			return res.status(400).json({ message: "Invalid user id" });
		}

		const otherUser = await User.exists({ _id: userId });
		if (!otherUser) {
			return res.status(404).json({ message: "User not found" });
		}

		const messages = await Message.find({
			$or: [
				{ from_user_id: req.user.id, to_user_id: userId },
				{ from_user_id: userId, to_user_id: req.user.id },
			],
		}).sort({ createdAt: 1 });

		return res.json(messages);
	} catch (error) {
		console.error("Get conversation error:", error);
		return res.status(500).json({ message: "Unable to load conversation" });
	}
}

export async function sendMessage(req, res) {
	try {
		const { userId } = req.params;
		const text = req.body.text?.trim() || "";

		if (!mongoose.isValidObjectId(userId)) {
			return res.status(400).json({ message: "Invalid user id" });
		}

		if (String(req.user.id) === String(userId)) {
			return res.status(400).json({ message: "You cannot message yourself" });
		}

		const recipient = await User.exists({ _id: userId });
		if (!recipient) {
			return res.status(404).json({ message: "User not found" });
		}

		const uploadedFiles = req.files || [];
		if (!text && uploadedFiles.length === 0) {
			return res.status(400).json({ message: "Message cannot be empty" });
		}

		const messages = [];
		if (text) {
			messages.push({
				from_user_id: req.user.id,
				to_user_id: userId,
				text,
				message_type: "text",
			});
		}

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
				media_url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
			});
		}

		const createdMessages = await Message.insertMany(messages);
		return res.status(201).json({
			success: true,
			messages: createdMessages,
		});
	} catch (error) {
		console.error("Send message error:", error);
		return res.status(500).json({ message: "Unable to send message" });
	}
}
