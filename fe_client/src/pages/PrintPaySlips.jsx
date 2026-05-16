import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { format } from "date-fns";
import axios from "axios";

// ✅ Ambil base URL dengan fallback yang benar
const BASE_URL =
  (import.meta.env.VITE_BASE_URL || "http://localhost:5000").replace(
    /\/+$/,
    "",
  ) + "/api";

const PrintPaySlips = () => {
  const { id } = useParams();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenRef = useRef(localStorage.getItem("token"));

  useEffect(() => {
    const token = tokenRef.current;

    if (!token) {
      setError("Session tidak ditemukan. Tutup tab ini dan login ulang.");
      setLoading(false);
      return;
    }

    // ✅ Log untuk debug
    console.log("Print API URL:", `${BASE_URL}/payslips/${id}`);
    console.log("Token exists:", !!token);

    axios
      .get(`${BASE_URL}/payslips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      })
      .then((res) => {
        const data = res.data?.data ?? res.data?.result ?? res.data;
        setPayslip(data);
      })
      .catch((err) => {
        console.error("Print payslip error:", err);
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          (err.code === "ECONNABORTED"
            ? "Request timeout, coba lagi."
            : null) ||
          (err.message === "Network Error"
            ? `Network Error — pastikan backend aktif. URL: ${BASE_URL}`
            : err.message) ||
          "Gagal memuat payslip.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;

  if (error)
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-rose-500 font-medium mb-2">{error}</p>
        {/* ✅ Tampilkan URL yang dipakai untuk debug */}
        <p className="text-xs text-slate-400 mb-4">
          Endpoint: {BASE_URL}/payslips/{id}
        </p>
        <button className="btn-primary" onClick={() => window.close()}>
          Tutup Tab
        </button>
      </div>
    );

  if (!payslip)
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-slate-500">Payslip tidak ditemukan.</p>
      </div>
    );

  const periodDate =
    payslip.year && payslip.month
      ? new Date(payslip.year, payslip.month - 1)
      : null;

  const employee = payslip.employee ?? payslip.employeeId;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white animate-fade-in">
      <div className="text-center border-b border-b-slate-200 pb-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          PAYSLIP DATA EMPLOYEE
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {periodDate ? format(periodDate, "MMMM yyyy") : "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Employee Name
          </p>
          <p className="font-semibold text-slate-900">
            {employee?.firstName} {employee?.lastName}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Position
          </p>
          <p className="font-semibold text-slate-900">
            {employee?.position ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Email Address
          </p>
          <p className="font-semibold text-slate-900">
            {employee?.email ?? employee?.userId?.email ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            Period
          </p>
          <p className="font-semibold text-slate-900">
            {periodDate ? format(periodDate, "MMMM yyyy") : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left py-4 px-4 text-xs text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-right py-4 px-4 text-xs text-slate-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="py-3 px-4 text-slate-700">Basic Salary</td>
              <td className="text-right py-3 px-4 text-slate-900 font-medium">
                ${payslip.basicSalary?.toLocaleString() ?? "0"}
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-3 px-4 text-slate-700">Allowances</td>
              <td className="text-right py-3 px-4 text-emerald-600 font-medium">
                +${payslip.allowances?.toLocaleString() ?? "0"}
              </td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-3 px-4 text-slate-700">Deductions</td>
              <td className="text-right py-3 px-4 text-rose-500 font-medium">
                -${payslip.deductions?.toLocaleString() ?? "0"}
              </td>
            </tr>
            <tr className="border-t-2 border-slate-300 bg-slate-50">
              <td className="py-4 px-4 font-bold text-slate-900">Net Salary</td>
              <td className="text-right py-3 px-4 font-bold text-slate-900">
                ${payslip.netSalary?.toLocaleString() ?? "0"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button
          className="btn-primary print:hidden"
          onClick={() => window.print()}
        >
          Print Payslip
        </button>
      </div>
    </div>
  );
};

export default PrintPaySlips;
