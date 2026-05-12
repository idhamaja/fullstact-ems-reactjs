import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Connected to MongoDB Boss!!"),
    );
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error(
      "Error connecting to MongoDB Boss!! What should we do??:",
      error.message,
    );
  }
};

export default connectDB;
