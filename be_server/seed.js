import mongoose from "mongoose";
import bcrypt from "bcrypt";
import "dotenv/config";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "EMPLOYEE"], default: "EMPLOYEE" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected!");

    // Cek apakah admin sudah ada
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@example.com" });

    if (existing) {
      console.log("Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("✅ Admin created successfully!");
    console.log("Email   :", process.env.ADMIN_EMAIL || "admin@example.com");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder error:", error.message);
    process.exit(1);
  }
};

seedAdmin();