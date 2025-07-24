import mongoose from "mongoose";

const connect = async () => {
    try {
        mongoose.set("strictQuery", true);
        mongoose.connect(process.env.MONGODB_URI);
        
    } catch (error) {
        console.log("Error: ", e.message);
    }
}

export default {connect};