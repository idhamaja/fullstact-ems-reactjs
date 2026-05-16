import Employee from "../models/Employee.js";
import Payslip from "../models/Payslip.js";

// POST /api/payslips
export const createPayslip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } =
      req.body;

    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const netSalary =
      Number(basicSalary) + Number(allowances || 0) - Number(deductions || 0);

    const payslip = await Payslip.create({
      employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: Number(basicSalary),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      netSalary,
    });

    return res.json({ success: true, data: payslip });
  } catch (error) {
    console.error("createPayslip error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/payslips
export const getPayslip = async (req, res) => {
  try {
    // ✅ Robust role check: handle berbagai kemungkinan struktur req.user
    const role = req.user?.role || req.user?.Role || req.user?.userRole || "";

    const isAdmin = role.toString().toUpperCase() === "ADMIN";

    console.log("getPayslip → req.user:", req.user, "| isAdmin:", isAdmin);

    if (isAdmin) {
      const payslips = await Payslip.find()
        .populate("employeeId", "firstName lastName position department")
        .sort({ createdAt: -1 });

      const data = payslips.map((p) => {
        const obj = p.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId, // hasil populate
          employeeId: obj.employeeId?._id?.toString(),
        };
      });

      return res.json({ success: true, data });
    }

    // ── Non-admin: cari employee berdasarkan userId ──
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user id not found" });
    }

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      // ✅ Employee record belum ada untuk user ini — kembalikan array kosong
      // daripada throw 404 supaya UI tidak error
      return res.json({ success: true, data: [] });
    }

    const payslips = await Payslip.find({ employeeId: employee._id }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, data: payslips });
  } catch (error) {
    console.error("getPayslip error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// GET /api/payslips/:id
export const getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate({
        path: "employeeId",
        select: "firstName lastName position department userId email",
        populate: {
          path: "userId", // ✅ join ke User untuk ambil email
          select: "email",
        },
      })
      .lean();

    if (!payslip) {
      return res.status(404).json({ error: "Payslip not found" });
    }

    const emp = payslip.employeeId;

    return res.json({
      success: true,
      data: {
        ...payslip,
        id: payslip._id.toString(),
        employee: {
          ...emp,
          // ✅ ambil email dari Employee langsung, atau fallback dari User
          email: emp?.email ?? emp?.userId?.email ?? "—",
        },
      },
    });
  } catch (error) {
    console.error("getPayslipById error:", error);
    return res.status(500).json({ error: error.message });
  }
};
