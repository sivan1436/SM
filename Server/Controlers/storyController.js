import Story from "../Models/Stories.js";
import mongoose from "mongoose";

const storyUserFields = "full_name username profile_picture is_verified";

export async function getStories(req, res) {
	try {
		const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
		await Story.deleteMany({ createdAt: { $lt: expiryDate } });
		const stories = await Story.find({ createdAt: { $gte: expiryDate } })
			.populate("user", storyUserFields)
			.sort({ createdAt: -1 });
		const storiesWithOwnership = stories.map((story) => ({
			...story.toObject(),
			is_owner: String(story.user?._id) === String(req.user.id),
		}));

		return res.json({ success: true, stories: storiesWithOwnership });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Stories could not be retrieved",
			error: error.message,
		});
	}
}

export async function createStory(req, res) {
	try {
		const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
		const backgroundColor = typeof req.body.background_color === "string"
			? req.body.background_color
			: "#4f46e5";
		const file = req.files?.[0];

		if (!content && !file) {
			return res.status(400).json({
				success: false,
				message: "Add some text or an image or video",
			});
		}

		const mediaType = file
			? file.mimetype.startsWith("video/") ? "video" : "image"
			: "text";
		const mediaUrl = file
			? `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
			: "";

		const story = await Story.create({
			user: req.user.id,
			content,
			media_url: mediaUrl,
			media_type: mediaType,
			background_color: backgroundColor,
		});

		const populatedStory = await Story.findById(story._id).populate(
			"user",
			storyUserFields
		);

		return res.status(201).json({
			success: true,
			message: "Story created successfully",
			story: populatedStory,
		});
	} catch (error) {
		if (error instanceof mongoose.Error.ValidationError) {
			return res.status(400).json({ success: false, message: error.message });
		}

		return res.status(500).json({
			success: false,
			message: "Story could not be created",
			error: error.message,
		});
	}
}

export async function deleteStory(req, res) {
	try {
		if (!mongoose.isValidObjectId(req.params.storyId)) {
			return res.status(400).json({ success: false, message: "Invalid story id" });
		}

		const story = await Story.findOneAndDelete({
			_id: req.params.storyId,
			user: req.user.id,
		});

		if (!story) {
			return res.status(404).json({
				success: false,
				message: "Story not found or you cannot delete it",
			});
		}

		return res.json({ success: true, message: "Story deleted successfully" });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Story could not be deleted",
			error: error.message,
		});
	}
}
