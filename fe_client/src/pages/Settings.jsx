import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { Lock } from "lucide-react";
import ProfileForm from "../components/ProfileForm";
import ChangePasswordModal from "../components/ChangePasswordModal";
import api from "../api/axios";
import toast from "react-hot-toast";

const Settings = () => {
  const [profileSettings, setProfileSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfileSettings = async () => {
    try {
      const res = await api.get("/profile");
      // ✅ FIX: handle berbagai struktur response
      const profile = res.data?.data ?? res.data;
      if (profile) setProfileSettings(profile);
    } catch (error) {
      // ✅ FIX: optional chaining agar tidak crash jika response undefined
      toast.error(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch profile",
      );
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchProfileSettings();
  }, []);

  if (loadingSettings) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage Your Account and Preferences</p>
      </div>

      {profileSettings && (
        <ProfileForm
          initialData={profileSettings}
          onSuccess={fetchProfileSettings}
        />
      )}

      <div className="card max-w-md p-6 flex items-center justify-between gap-4">
        {/* ✅ FIX: pindahkan teks ke luar icon div */}
        <div className="flex items-center gap-3 flex-1">
          <Lock className="w-5 h-5 text-slate-600 shrink-0" />
          <div>
            <p className="font-medium text-slate-900">Password</p>
            <p className="text-sm text-slate-500">
              Update Your Account Password
            </p>
          </div>
        </div>
        <button
          className="btn-secondary text-sm shrink-0"
          onClick={() => setShowPasswordModal(true)}
        >
          Change
        </button>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Settings;
