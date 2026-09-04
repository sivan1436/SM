import User from "../Models/User.js";
import mongoose from "mongoose";

export async function Findusers(req, res) {
    try {
        const { username } = req.body;

        const users = await User.find({
            username: { $regex: username, $options: "i" }
        });

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Users could not be retrieved from the database",
            error: error.message
        });
    }
}

export async function EditUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const { full_name, username, bio, location } = req.body;

    // Make sure the logged-in user owns this profile
    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this profile",
      });
    }

    // Check user exists
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update only the fields that were provided
    if (full_name !== undefined) user.full_name = full_name;
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (req.files?.profile_picture?.[0]) {
      user.profile_picture = `${req.protocol}://${req.get("host")}/uploads/${req.files.profile_picture[0].filename}`;
    }
    if (req.files?.cover_photo?.[0]) {
      user.cover_photo = `${req.protocol}://${req.get("host")}/uploads/${req.files.cover_photo[0].filename}`;
    }

    const updatedUser = await user.save();
    const safeUser = updatedUser.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Edit user error:", error);

    return res.status(500).json({
      success: false,
      message: "Profile could not be updated",
      error: error.message,
    });
  }
}
