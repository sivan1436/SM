import Message from "../Models/Messages.js";
import User from "../Models/User.js";

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

		return res.json({ success: true, user });
	} catch (error) {
		return res.status(400).json({
			success: false,
			message: "Invalid user id",
		});
	}
}
