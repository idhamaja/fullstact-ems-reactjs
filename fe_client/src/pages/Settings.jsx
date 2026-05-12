import { useEffect, useState } from "react";
import { dummyProfileData } from "../assets/assets";
import Loading from "../components/Loading";
import { Lock } from "lucide-react";
import ProfileForm from "../components/ProfileForm";
import ChangePasswordModal from "../components/ChangePasswordModal";

const Settings = () => {
  const [profileSettings, setProfileSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfileSettings = async () => {
    setProfileSettings(dummyProfileData);
    setTimeout(() => {
      setLoadingSettings(false);
    }, 1000);
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

      {/* Change Password Trigger */}
      <div className="card max-w-md p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        <div>
          <p className="font-medium text-slate-900">Password</p>
          <p className="text-sm text-slate-500">Update Your Account Password</p>
        </div>
        <button
          className="btn-secondary text-sm"
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
