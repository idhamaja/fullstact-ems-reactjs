import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["SICK", "CASUAL", "ANNUAL"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    // Base64 data URI dari file bukti (opsional), disimpan langsung di MongoDB
    // Format: "data:<mimetype>;base64,<data>" — max ~5MB setelah Base64 encoding
    evidenceData: { type: String, default: null },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

const LeaveApplication =
  mongoose.models.LeaveApplication ||
  mongoose.model("LeaveApplication", leaveApplicationSchema);

export default LeaveApplication;
