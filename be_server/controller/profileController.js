import Employee from "../models/Employee.js";

// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    // ✅ FIX: req.session → req.user
    const { userId, email } = req.user;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      // User adalah Admin — tidak punya data employee
      return res.json({
        firstName: "Admin",
        lastName: "",
        email: email,
        position: "Administrator",
        bio: "",
        isDeleted: false,
      });
    }

    return res.json(employee);
  } catch (error) {
    console.error("[getProfile]", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// POST /api/profile
export const updateProfile = async (req, res) => {
  try {
    // ✅ FIX: req.session → req.user
    const { userId } = req.user;
    const employee = await Employee.findOne({ userId });

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (employee.isDeleted) {
      return res.status(403).json({
        error: "Your account is deactivated. You cannot update your profile",
      });
    }

    const updated = await Employee.findByIdAndUpdate(
      employee._id,
      { bio: req.body.bio },
      { new: true }, // ✅ kembalikan data terbaru
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[updateProfile]", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};
