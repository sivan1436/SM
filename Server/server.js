import express from "express";
import ConnectDB from "./Config/DB.js";
import dotenv from "dotenv";
import cors from "cors";
import messageRoutes from "./Routes/messageRoutes.js";
import authRoutes from "./Routes/authRoutes.js"

await dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
await ConnectDB();
app.use(express.json());
app.use(cors());
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth/",authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
