import { format } from "date-fns";
import { Check, Loader2, X } from "lucide-react";
import React, { useState } from "react";

const LeavesHistory = ({ leaves, isAdmin, onUpdate }) => {
  const [processing, setProcessing] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    setProcessing(id);
    // await onUpdate?.(id, status);
  };

  return (
    <div className="w-full mt-6">
      {/* Container yang sama lebar dengan card di atas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header Tabel (opsional, bisa dihapus jika tidak diperlukan) */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Leave History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-44">
                    Employee
                  </th>
                )}

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-48">
                  Leave Type
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-56">
                  Dates
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 min-w-[320px]">
                  Reason
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap w-40">
                  Status
                </th>

                {isAdmin && (
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700 whitespace-nowrap w-32">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {leaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 4}
                    className="px-6 py-20 text-center text-slate-400 text-base"
                  >
                    No leave applications found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr 
                    key={leave._id || leave.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {isAdmin && (
                      <td className="px-6 py-5 whitespace-nowrap text-slate-900 font-medium">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </td>
                    )}

                    <td className="px-6 py-5">
                      <span className="inline-flex px-3.5 py-1 text-sm font-medium rounded-full bg-slate-100 text-slate-700">
                        {leave.type}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">
                      {format(new Date(leave.startDate), "dd MMM yyyy")} —{" "}
                      {format(new Date(leave.endDate), "dd MMM yyyy")}
                    </td>

                    <td className="px-6 py-5 text-slate-700 pr-8">
                      {leave.reason}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                          leave.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : leave.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-5">
                        {leave.status === "PENDING" && (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleStatusUpdate(leave._id || leave.id, "APPROVED")}
                              disabled={!!processing}
                              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all disabled:opacity-50"
                            >
                              {processing === (leave._id || leave.id) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleStatusUpdate(leave._id || leave.id, "REJECTED")}
                              disabled={!!processing}
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all disabled:opacity-50"
                            >
                              {processing === (leave._id || leave.id) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesHistory;