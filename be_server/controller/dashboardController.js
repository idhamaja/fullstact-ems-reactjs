import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import LeaveApplication from "../models/LeaveApplication.js";
import Payslip from "../models/Payslip.js";
import { DEPARTMENTS } from "../constant/departments.js";

export const getDashboardEMS = async (req, res) => {
  try {
    const { role, userId } = req.session; // ✅ tetap req.session sesuai middleware

    if (role === "ADMIN") {
      const [totalEmployees, todayAttendance, pendingLeaves] =
        await Promise.all([
          Employee.countDocuments({ isDeleted: { $ne: true } }),
          Attendance.countDocuments({
            date: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          }),
          LeaveApplication.countDocuments({ status: "PENDING" }),
        ]);

      return res.json({
        role: "ADMIN",
        totalEmployees,
        totalDepartments: DEPARTMENTS.length,
        todayAttendance, // ✅ fix: nama field sesuai frontend
        pendingLeaves,
      });
    } else {
      const employee = await Employee.findOne({ userId }).lean();
      if (!employee)
        return res.status(404).json({ error: "Employee is not Found!!" });

      const today = new Date();

      const [currentMonthAttendance, pendingLeaves, latestPayslip] =
        await Promise.all([
          Attendance.countDocuments({
            // ✅ fix: Attentande → Attendance
            employeeId: employee._id,
            date: {
              $gte: new Date(today.getFullYear(), today.getMonth(), 1),
              $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
            },
          }),
          LeaveApplication.countDocuments({
            // ✅ fix: pisah dari countDocuments sebelumnya
            employeeId: employee._id,
            status: "PENDING",
          }),
          Payslip.findOne({ employeeId: employee._id })
            .sort({ createdAt: -1 })
            .lean(),
        ]);

      return res.json({
        role: "EMPLOYEE",
        employee: { ...employee, id: employee._id.toString() },
        currentMonthAttendance,
        pendingLeaves,
        latestPayslip: latestPayslip
          ? { ...latestPayslip, id: latestPayslip._id.toString() }
          : null,
      });
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ error: "Failed Server" });
  }
};
