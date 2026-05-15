import { CalendarDays, FileText, Loader2, Paperclip, Send, X } from "lucide-react";
import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const ApplyLeavesModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "SICK",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [evidenceFile, setEvidenceFile] = useState(null);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setEvidenceFile(e.target.files[0] || null);
  };

  const resetForm = () => {
    setForm({ type: "SICK", startDate: "", endDate: "", reason: "" });
    setEvidenceFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    setLoading(true);
    try {
      // Use FormData to support optional evidence file upload
      const payload = new FormData();
      payload.append("type", form.type);
      payload.append("startDate", form.startDate);
      payload.append("endDate", form.endDate);
      payload.append("reason", form.reason.trim());
      if (evidenceFile) {
        payload.append("evidence", evidenceFile);
      }

      await api.post("/leave", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Leave application submitted successfully!");
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message || "Failed to submit leave.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .leave-input {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          color: #1e293b;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          appearance: none;
        }

        .leave-input:focus {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .leave-input::placeholder {
          color: #94a3b8;
        }

        .leave-file-label {
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          background: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
          width: 100%;
        }

        .leave-file-label:hover {
          border-color: #6366f1;
          background: #eef2ff;
          color: #4f46e5;
        }

        .leave-btn-primary {
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #4338ca 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 4px 15px rgba(99, 102, 241, 0.45),
            0 1px 3px rgba(0,0,0,0.12),
            inset 0 1px 0 rgba(255,255,255,0.15);
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .leave-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
          pointer-events: none;
        }

        .leave-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 8px 24px rgba(99, 102, 241, 0.55),
            0 2px 6px rgba(0,0,0,0.14),
            inset 0 1px 0 rgba(255,255,255,0.18);
          filter: brightness(1.06);
        }

        .leave-btn-primary:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow:
            0 2px 8px rgba(99, 102, 241, 0.4),
            0 1px 2px rgba(0,0,0,0.1);
          filter: brightness(0.97);
          transition-duration: 0.07s;
        }

        .leave-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .leave-btn-secondary {
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          background: #fff;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }

        .leave-btn-secondary:hover {
          transform: translateY(-2px);
          background: #f8fafc;
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.09);
        }

        .leave-btn-secondary:active {
          transform: translateY(0px);
          background: #f1f5f9;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
          transition-duration: 0.07s;
        }
      `}</style>

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Apply For Leave
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Submit Your Leave Request For Approval
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* LEAVE TYPE */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Leave Type
            </label>
            <select
              name="type"
              required
              value={form.type}
              onChange={handleChange}
              className="leave-input"
            >
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="ANNUAL">Annual Leave</option>
            </select>
          </div>

          {/* DURATION */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              Duration
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-slate-400 mb-1">From</span>
                <input
                  type="date"
                  name="startDate"
                  required
                  min={minDate}
                  value={form.startDate}
                  onChange={handleChange}
                  className="leave-input"
                />
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">To</span>
                <input
                  type="date"
                  name="endDate"
                  required
                  // endDate minimum = startDate jika sudah dipilih, else minDate
                  min={form.startDate || minDate}
                  value={form.endDate}
                  onChange={handleChange}
                  className="leave-input"
                />
              </div>
            </div>
          </div>

          {/* REASON */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Reason
            </label>
            <textarea
              name="reason"
              required
              rows={3}
              value={form.reason}
              onChange={handleChange}
              className="leave-input resize-none"
              placeholder="Briefly describe why you need this leave..."
            />
          </div>

          {/* EVIDENCE UPLOAD (opsional) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Paperclip className="w-4 h-4 text-slate-400" />
              Supporting Document{" "}
              <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <label className="leave-file-label">
              <Paperclip className="w-4 h-4" />
              {evidenceFile
                ? evidenceFile.name
                : "Click to attach a file (PDF, JPG, PNG)"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="leave-btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="leave-btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeavesModal;
