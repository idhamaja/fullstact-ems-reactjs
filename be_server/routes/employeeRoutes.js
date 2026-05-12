import { Router } from "express";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../controller/EmployeeController.js";
import { protect, protectAdmin } from "../middleware/auth.js";


const employeeRouter = Router();

employeeRouter.get("/", protect, protectAdmin, getEmployees);
employeeRouter.post("/", protect, protectAdmin, createEmployee);
employeeRouter.put("/:id", protect, protectAdmin, updateEmployee);
employeeRouter.delete("/:id", protect, protectAdmin, deleteEmployee);

export default employeeRouter;
