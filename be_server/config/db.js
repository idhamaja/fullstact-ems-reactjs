import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    // Validasi agar error lebih jelas
    if (!uri) {
      throw new Error("MONGODB_URI is not defined. Check your .env file.");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected Boss Let's Go!!!");
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
