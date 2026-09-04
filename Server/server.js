import express from "express";
import ConnectDB from "./Config/DB.js";
import dotenv from "dotenv";
import cors from "cors";
import messageRoutes from "./Routes/messageRoutes.js";
import authRoutes from "./Routes/authRoutes.js"
import userRoutes from "./Routes/userRoutes.js";
import path from "path";

await dotenv.config();
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}
const PORT = process.env.PORT || 3000;
const app = express();
await ConnectDB();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/messages", messageRoutes);
app.use("/api/users",userRoutes)

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth/",authRoutes)

app.use((error, _req, res, _next) => {
  if (error?.code === "LIMIT_FILE_SIZE" || error?.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: error.message === "Only image files are allowed"
        ? error.message
        : "Images must be 5 MB or smaller",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Request could not be processed",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
