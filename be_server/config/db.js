import mongoose from "mongoose";

let isConnected = false; // cache connection status

const connectDB = async () => {
  if (isConnected) {
    return; // sudah connected, skip
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected!");
  } catch (error) {
    isConnected = false;
    throw new Error("MongoDB connection failed: " + error.message);
  }
};

export default connectDB;