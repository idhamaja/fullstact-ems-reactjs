import { useCallback, useEffect, useState } from "react";
import { dummyEmployeeData, dummyPayslipData } from "../assets/assets";
import Loading from "../components/Loading";
import PayslipsList from "../components/PayslipsComponents/PayslipsList";
import GeneratePayslipForm from "../components/PayslipsComponents/GeneratePayslipForm";

const PaySlips = () => {
  const [payslips, setPlayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = true;

  const fetchPayslips = useCallback(async () => {
    setPlayslips(dummyPayslipData);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  useEffect(() => {
    if (isAdmin) setEmployees(dummyEmployeeData);
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

      <PayslipsList payslips={payslips} isAdmin={isAdmin}  />
    </div>
  );
};

export default PaySlips;
