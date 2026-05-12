import { format } from "date-fns";
import { Download } from "lucide-react";
import React from "react";

const PayslipsList = ({ payslips, isAdmin }) => {
  return (
    <div className="w-full mt-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Payslip List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-44">
                    Employee
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-56">
                  Basic Salary
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {payslips.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-6 py-20 text-center text-slate-400 text-base"
                  >
                    No payslips found
                  </td>
                </tr>
              ) : (
                payslips.map((pSlip) => (
                  <tr
                    key={pSlip._id || pSlip.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150"
                  >
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-slate-800 font-medium whitespace-nowrap">
                        {pSlip.employee?.firstName} {pSlip.employee?.lastName}
                      </td>
                    )}

                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {format(
                        new Date(pSlip.year, pSlip.month - 1),
                        "MMMM yyyy",
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-700">
                        ${pSlip.basicSalary?.toLocaleString() ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm">
                        ${pSlip.netSalary?.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all duration-150 ring-1 ring-blue-200"
                        onClick={() =>
                          window.open(
                            `/print/payslips/${pSlip._id || pSlip.id}`,
                          )
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>

                    {isAdmin && (
                      <td className="px-6 py-4">
                        {pSlip.status === "PENDING" && (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  pSlip._id || pSlip.id,
                                  "APPROVED",
                                )
                              }
                              disabled={!!processing}
                              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all disabled:opacity-50"
                            >
                              {processing === (pSlip._id || pSlip.id) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  pSlip._id || pSlip.id,
                                  "REJECTED",
                                )
                              }
                              disabled={!!processing}
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all disabled:opacity-50"
                            >
                              {processing === (pSlip._id || pSlip.id) ? (
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

export default PayslipsList;
