import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "8.8.4.4"]);


dotenv.config();

async function ConnectDB() {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/Scrink`);
        console.log("DB has connected");
    }
    catch(error) {
        console.log(error.message);
    }
};

export default ConnectDB;
