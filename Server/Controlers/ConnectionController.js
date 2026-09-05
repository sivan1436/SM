import mongoose from "mongoose";
import User from "../Models/User.js";

export async function FollowUser(req, res) {
	try {
		const currentUserId = req.user.id;
		const { userId: targetUserId } = req.params;

		if (!mongoose.isValidObjectId(targetUserId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid user id",
			});
		}

		if (currentUserId === targetUserId) {
			return res.status(400).json({
				success: false,
				message: "You cannot follow yourself",
			});
		}

		const [existingCurrentUser, existingTargetUser] = await Promise.all([
			User.findById(currentUserId).select("_id"),
			User.findById(targetUserId).select("_id"),
		]);

		if (!existingCurrentUser || !existingTargetUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		const [currentUser, targetUser] = await Promise.all([
			User.findByIdAndUpdate(
				currentUserId,
				{ $addToSet: { following: targetUserId } },
				{ new: true, runValidators: true }
			).select("-password"),
			User.findByIdAndUpdate(
				targetUserId,
				{ $addToSet: { followers: currentUserId } },
				{ new: true, runValidators: true }
			).select("-password"),
		]);

		return res.status(200).json({
			success: true,
			message: "User followed successfully",
			currentUser,
			user: targetUser,
		});
	} catch (error) {
		console.error("Follow user error:", error);
		return res.status(500).json({
			success: false,
			message: "User could not be followed",
		});
	}
}
