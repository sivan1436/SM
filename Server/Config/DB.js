import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "8.8.4.4"]);


dotenv.config({ quiet: true });

async function ConnectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required");
    }

    const mongoUrl = new URL(process.env.MONGO_URI);
   
    await mongoose.connect(mongoUrl.toString());
    console.log("DB has connected");
};

export default ConnectDB;
