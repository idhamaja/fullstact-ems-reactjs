import { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading";
import CheckinButton from "../components/AttendanceComponents/CheckinButton";
import AttendanceStats from "../components/AttendanceComponents/AttendanceStats";
import AttendanceHistory from "../components/AttendanceComponents/AttendanceHistory";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/attendance");
      const json = res.data;
      setHistory(json.data || []);
      if (json.employee?.isDeleted) setIsDeleted(true);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loading />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ Fix: field dari MongoDB adalah 'date' (lowercase), bukan 'Date'
  const todaysRecord = history.find((r) => {
    const recordDate = new Date(r.date); // lowercase 'date'
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime(); // bandingkan timestamp, lebih aman
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">
          Track your work hours and daily check-ins
        </p>
      </div>

      {isDeleted ? (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <p>
            You can no longer clock in or clock out because your employee
            records have been marked as deleted
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <CheckinButton todaysRecord={todaysRecord} onAction={fetchData} />
        </div>
      )}

      <AttendanceStats history={history} />
      <AttendanceHistory history={history} />
    </div>
  );
};

export default Attendance;
