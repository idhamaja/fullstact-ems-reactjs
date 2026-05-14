import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined. Check your environment variables.",
      );
    }

    // Cek jika sudah connected (penting untuk serverless!)
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected.");
      return;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // timeout 10 detik
      bufferCommands: false, // jangan buffer kalau belum connect
    });

    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    // JANGAN process.exit(1) di serverless — lempar error saja
    throw new Error("Failed to connect to MongoDB: " + error.message);
  }
};

export default connectDB;
