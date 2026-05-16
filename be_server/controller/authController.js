import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role_type } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials Boss!!" });
    }

    if (role_type === "admin" && user.role !== "ADMIN") {
      return res.status(401).json({ error: "Not authorized as Admin" });
    }

    if (role_type === "employee" && user.role !== "EMPLOYEE") {
      return res.status(401).json({ error: "Not authorized as Employee" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials Boss!!" });
    }

    const payLoad = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ user: payLoad, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/auth/session
export const getSession = async (req, res) => {
  // ✅ FIX: req.session → req.user (sudah di-attach oleh middleware protect)
  return res.json({ user: req.user });
};

// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    // ✅ FIX: req.session → req.user
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    // ✅ FIX: session.userId → userId dari req.user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
