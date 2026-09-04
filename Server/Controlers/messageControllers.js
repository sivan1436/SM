import Message from "../Models/Messages.js";
import User from "../Models/User.js";

export async function getMessages(req, res) {
	try {
		const email = req.query.email?.trim().toLowerCase();

		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		const currentUser = await User.findOne({ email }).select("connections");

		if (!currentUser) {
			return res.status(404).json({ message: "User not found" });
		}

		const [connections, messages] = await Promise.all([
			User.find({ _id: { $in: currentUser.connections } }).select(
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
		return res.status(500).json({ message: "Unable to load messages" });
	}
}
