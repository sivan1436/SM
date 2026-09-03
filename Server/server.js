import express from "express";
import ConnectDB from "./Config/DB.js";
import dotenv from "dotenv";
import cors from "cors";

await dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
await ConnectDB();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
