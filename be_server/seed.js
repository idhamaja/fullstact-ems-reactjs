import "dotenv/config";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

const TemporaryPassword = "admin123";

async function registerAdmin() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    if (!ADMIN_EMAIL) {
      console.error("❌ Missing ADMIN_EMAIL env variable");
      process.exit(1);
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(TemporaryPassword, 10);

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      // ✅ Update saja, jangan create baru
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        role: "ADMIN",
      });
      console.log("✅ Admin password reset successfully!");
    } else {
      await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
      });
      console.log("✅ Admin user created!");
    }

    console.log("\nEmail   :", ADMIN_EMAIL);
    console.log("Password:", TemporaryPassword);
    console.log("\nChange the password after login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

registerAdmin();
