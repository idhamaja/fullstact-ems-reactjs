import { Loader2, Plus, X } from "lucide-react";
import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const GeneratePayslipForm = ({ employees, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      await api.post("/payslips", data);
      toast.success("Payslip generated successfully!");
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || error?.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen)
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

          .payslip-btn {
            font-family: 'DM Sans', sans-serif;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 13px 22px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #4338ca 100%);
            color: #fff;
            font-size: 14.5px;
            font-weight: 600;
            letter-spacing: 0.01em;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            box-shadow:
              0 4px 15px rgba(99, 102, 241, 0.45),
              0 1px 3px rgba(0,0,0,0.12),
              inset 0 1px 0 rgba(255,255,255,0.15);
            transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
          }

          .payslip-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
            border-radius: inherit;
            pointer-events: none;
          }

          .payslip-btn:hover {
            transform: translateY(-2px);
            box-shadow:
              0 8px 24px rgba(99, 102, 241, 0.55),
              0 2px 6px rgba(0,0,0,0.14),
              inset 0 1px 0 rgba(255,255,255,0.18);
            filter: brightness(1.06);
          }

          .payslip-btn:active {
            transform: translateY(0px);
            box-shadow:
              0 2px 8px rgba(99, 102, 241, 0.4),
              0 1px 2px rgba(0,0,0,0.1);
            filter: brightness(0.97);
            transition-duration: 0.07s;
          }

          .payslip-btn-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            background: rgba(255,255,255,0.18);
            border-radius: 7px;
            flex-shrink: 0;
            transition: background 0.18s ease;
          }

          .payslip-btn:hover .payslip-btn-icon {
            background: rgba(255,255,255,0.26);
          }

          .payslip-btn-label {
            line-height: 1;
          }
        `}</style>

        <button className="payslip-btn" onClick={() => setIsOpen(true)}>
          <span className="payslip-btn-icon">
            <Plus size={14} strokeWidth={2.8} />
          </span>
          <span className="payslip-btn-label">Generate Payslip</span>
        </button>
      </>
    );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Generate Monthly Payslip
          </h3>
          <button
            className="text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* SELECT EMPLOYEE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employee
            </label>
            <select name="employeeId" required>
              {employees.map((e) => (
                <option key={e._id || e.id} value={e._id || e.id}>
                  {e.firstName} {e.lastName} ({e.position})
                </option>
              ))}
            </select>
          </div>

          {/* SELECT MONTH AND YEAR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Month
              </label>
              <select name="month">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option value={m} key={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                defaultValue={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* BASIC SALARY */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Basic Salary
            </label>
            <input
              type="number"
              name="basicSalary"
              required
              placeholder="5000"
            />
          </div>

          {/* ALLOWANCES AND DEDUCTIONS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Allowances
              </label>
              <input
                type="number"
                name="allowances"
                defaultValue="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Deductions
              </label>
              <input
                type="number"
                name="deductions"
                defaultValue="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              className="btn-secondary"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Cancel
            </button>

            <button
              className="btn-primary flex items-center"
              type="submit"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePayslipForm;
