import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import PasswordRequirements, { isPasswordValid } from "../../components/common/PasswordRequirements";
import { profile, auth, getApiErrorMessage } from "../../services/api";
import { useUser } from "../../context/UserContext";

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

const PathfinderSettings = () => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const loadedBaseDetailsIdRef = useRef(null);
  const loadedProfileIdRef = useRef(null);

  useEffect(() => { document.title = "Pathfinder Settings - AfriVate"; }, []);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", other_name: "", title: "", about: "", work_experience: "",
    languages: "", gmail: "", contact_email: "", address: "", state: "", country: "",
    phone_number: "", website: "", bio: "", currentPassword: "", newPassword: "", confirmNewPassword: "",
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profile.pathfinderGet();
      if (data) {
        const base = data.base_details || {};
        if (data.id != null) loadedProfileIdRef.current = data.id;
        if (base.id != null) loadedBaseDetailsIdRef.current = base.id;
        setFormData((prev) => ({
          ...prev,
          first_name: data.first_name || "", last_name: data.last_name || "",
          other_name: data.other_name || "", title: data.title || "",
          about: data.about || "", work_experience: data.work_experience || "",
          languages: data.languages || "", gmail: data.gmail || "",
          contact_email: base.contact_email || "", address: base.address || "",
          state: base.state || "", country: base.country || "",
          phone_number: base.phone_number || "", website: base.website || "",
          bio: base.bio || "",
        }));
      }
    } catch (err) { console.error("Error loading pathfinder profile:", err); }
    try {
      const picData = await profile.pictureGet();
      if (picData && picData.profile_pic) setProfilePhotoUrl(picData.profile_pic);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    const old_password = (formData.currentPassword || "").trim();
    const new_password = (formData.newPassword || "").trim();
    const confirm_password = (formData.confirmNewPassword || "").trim();
    if (!old_password || !new_password || !confirm_password) {
      setToast({ isOpen: true, message: "Enter current password, new password, and confirmation.", type: "error" }); return;
    }
    if (!isPasswordValid(new_password)) {
      setToast({ isOpen: true, message: "New password doesn't meet all the requirements listed below the field.", type: "error" }); return;
    }
    if (new_password !== confirm_password) {
      setToast({ isOpen: true, message: "New passwords do not match.", type: "error" }); return;
    }
    try {
      await auth.changePassword({ old_password, new_password, confirm_password });
      setFormData((p) => ({ ...p, currentPassword: "", newPassword: "", confirmNewPassword: "" }));
      setToast({ isOpen: true, message: "Password updated.", type: "success" });
    } catch (err) {
      setToast({ isOpen: true, message: getApiErrorMessage(err) || "Could not change password.", type: "error" });
    }
  };

  const handleDeleteAccount = () => setDeleteModal({ isOpen: true });

  const confirmDeleteAccount = async () => {
    setDeleteModal({ isOpen: false });
    try {
      await auth.deleteAccount();
      await logout();
      setToast({ isOpen: true, message: "Your account has been deleted.", type: "success" });
      navigate("/login", { replace: true });
    } catch (err) {
      setToast({ isOpen: true, message: err.message || "Could not delete account. Try again or contact support.", type: "error" });
    }
  };

  const displayName = [formData.first_name, formData.last_name].filter(Boolean).join(" ") || "Pathfinder";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <NavBar />
        <div className="pt-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <NavBar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
            <p className="text-purple-200 text-sm">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-4">
          {/* Profile summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-purple-100 flex items-center justify-center shrink-0">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#8D4087] font-bold text-xl">{displayName.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{displayName}</p>
              {formData.title && <p className="text-sm text-gray-500">{formData.title}</p>}
            </div>
            <Link to="/profile" className="text-[#8D4087] text-sm font-semibold hover:underline shrink-0">
              Edit profile
            </Link>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Security & Privacy</h2>
            <p className="text-sm text-gray-400 mb-5">Change the password you use to sign in.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelCls}>Current Password</label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder="Current password" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="New password" className={inputCls} />
                <PasswordRequirements password={formData.newPassword} />
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleInputChange} placeholder="Confirm new password" className={inputCls} />
              </div>
            </div>
            <button onClick={handleChangePassword} className="bg-[#651F5F] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#4a1647] transition-colors">
              Update password
            </button>
          </div>

          {/* Set password for Google users */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Legacy Authentication</h2>
            <p className="text-sm text-gray-500 mb-4">Signed in with Google? Add a password so you can sign in with email too.</p>
            <div className="border border-dashed border-[#8D4087]/40 rounded-xl p-4 bg-purple-50/50">
              <Link to="/set-password" className="text-[#8D4087] font-semibold text-sm hover:underline">
                Set integration password →
              </Link>
            </div>
          </div>

          {/* Delete account */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-red-600 mb-1">Delete Account</h2>
            <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount}
              className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        type="danger"
      />
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default PathfinderSettings;
