import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import PayslipsList from "../components/PayslipsComponents/PayslipsList";
import GeneratePayslipForm from "../components/PayslipsComponents/GeneratePayslipForm";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";

const PaySlips = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const fetchPayslips = useCallback(async () => {
    try {
      const res = await api.get("/payslips");
      // ✅ handle both { data } dan { data: { data } }
      const result = res.data?.data ?? res.data ?? [];
      setPayslips(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error(error?.response?.data?.error || error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get("/employees")
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setEmployees(list.filter((e) => !e.isDeleted));
      })
      .catch(() => {});
  }, [isAdmin]);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Payslip Page</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Generate and Manage Employee Payslips"
              : "Your Payslips History"}
          </p>
        </div>
        {isAdmin && (
          <GeneratePayslipForm
            employees={employees}
            onSuccess={fetchPayslips}
          />
        )}
      </div>

      <PayslipsList payslips={payslips} isAdmin={isAdmin} />
    </div>
  );
};

export default PaySlips;
