import { Loader2Icon, LogInIcon, LogOutIcon } from "lucide-react";
import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const CheckinButton = ({ todaysRecord, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleAttendance = async () => {
    setLoading(true);
    try {
      await api.post("/attendance");
      onAction();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message);
    }
    setLoading(false);
  };

  if (todaysRecord?.checkOut) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Work Day Completed</h3>
        <p className="text-slate-500 text-sm mt-1">
          Great Job! See You Tomorrow
        </p>
      </div>
    );
  }

  // ✅ Fix: cek checkIn bukan isCheckedIn (field ini tidak ada di schema)
  const isCheckedIn = !!todaysRecord?.checkIn;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col z-1">
      <button
        className={`w-full max-w-xs flex justify-between items-center gap-8 p-4 rounded-xl bg-linear-to-br text-white ${isCheckedIn ? "from-slate-700" : "from-indigo-600 to-indigo-700"}`}
        onClick={handleAttendance}
        disabled={loading}
      >
        {loading ? (
          <Loader2Icon className="size-7 animate-spin" />
        ) : isCheckedIn ? (
          <LogOutIcon className="size-7" />
        ) : (
          <LogInIcon className="size-7" />
        )}

        <div className="relative flex flex-col items-center text-center">
          <h2 className="text-lg font-medium mb-1">
            {loading ? "Processing..." : isCheckedIn ? "Clock-Out" : "Clock-In"}
          </h2>
          <p className="text-xs opacity-80">
            {isCheckedIn ? "Click to end your shift" : "Start Your Work Today!"}
          </p>
        </div>
      </button>
    </div>
  );
};

export default CheckinButton;
