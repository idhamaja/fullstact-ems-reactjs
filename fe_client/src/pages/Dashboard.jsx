import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import EmployeeDashboard from "../components/EmployeeDashboard";
import AdminDashboard from "../components/AdminDashboard";
import api from "../api/axios";
import toast from "react-hot-toast";

// Default fallback data agar dashboard tetap tampil meski API gagal
const defaultAdminData = {
  role: "ADMIN",
  totalEmployees: 0,
  totalDepartments: 0,
  todayAttendance: 0,
  pendingLeaves: 0,
};

const defaultEmployeeData = {
  role: "EMPLOYEE",
  totalAttendance: 0,
  pendingLeaves: 0,
  approvedLeaves: 0,
  rejectedLeaves: 0,
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => {
        // Merge data dari API dengan default fallback supaya tidak ada nilai undefined
        const role = res.data?.role ?? "ADMIN";
        const fallback =
          role === "ADMIN" ? defaultAdminData : defaultEmployeeData;
        setData({ ...fallback, ...res.data });
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || err?.message);
        // Tetap tampilkan dashboard dengan data 0 meski API gagal
        // Gunakan defaultAdminData sebagai fallback (atau sesuaikan dengan role dari local storage / context)
        setData(defaultAdminData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  // data dijamin tidak null karena sudah di-set fallback di catch
  if (data.role === "ADMIN") {
    return <AdminDashboard data={data} />;
  } else {
    return <EmployeeDashboard data={data} />;
  }
};

export default Dashboard;
