//Create Payslip

import Employee from "../models/Employee.js";
import Payslip from "../models/Payslip.js";

//POST /api/payslips
export const createPayslip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } =
      req.body;

    if (!employeeId || !month || !year || !basicSalary) {
      return res.status(400).json({ error: "Warning Fields" });
    }
    const netSalary =
      Number(basicSalary) + (allowances || 0) - Number(deductions || 0);

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
    return res.status(500).json({ error: "Failed Server" });
  }
};

//Get Payslip
//GET /api/payslips
export const getPayslip = async (params) => {
  try {
    const session = req.session;
    const isAdmin = session.role === "ADMIN";
    if (isAdmin) {
      const payslips = await Payslip.find()
        .populate("employeeId")
        .sort({ createdAt: -1 });
      const data = payslips.map((p) => {
        const obj = p.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          employee: obj.employeeId,
          employeeId: obj.employeeId?._id?.toString(),
        };
      });
      return res.json({ data });
    } else {
      const employee = await Employee.findOne({
        userId: session.userId,
      });
      if (!employee) return res.status(404).json({ error: "Not found" });

      const payslips = await Payslip.find({ employeeId: employee._id }).sort({
        createdAt: -1,
      });
      return res.json({ data: payslips });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed Server" });
  }
};

//Get Payslip By Id
//GET /api/payslips/:id
export const getPayslipById = async (params) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate("employeeId")
      .lean();

    if (!payslip) return res.status(404).json({ error: "Data is Not Found" });

    const result = {
      ...payslip,
      id: payslip._id.toString(),
    };

    return res.json({ result });
  } catch (error) {
    return res.status(500).json({ error: "Failed Server Error" });
  }
};
