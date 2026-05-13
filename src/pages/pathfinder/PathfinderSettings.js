import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import { profile, auth, getApiErrorMessage } from "../../services/api";
import { useUser } from "../../context/UserContext";

const PathfinderSettings = () => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const loadedBaseDetailsIdRef = useRef(null);
  const loadedProfileIdRef = useRef(null);

  useEffect(() => {
    document.title = "Pathfinder Settings - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    other_name: "",
    title: "",
    about: "",
    work_experience: "",
    languages: "",
    gmail: "",
    contact_email: "",
    address: "",
    state: "",
    country: "",
    phone_number: "",
    website: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
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
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          other_name: data.other_name || "",
          title: data.title || "",
          about: data.about || "",
          work_experience: data.work_experience || "",
          languages: data.languages || "",
          gmail: data.gmail || "",
          contact_email: base.contact_email || "",
          address: base.address || "",
          state: base.state || "",
          country: base.country || "",
          phone_number: base.phone_number || "",
          website: base.website || "",
          bio: base.bio || "",
        }));
      }
    } catch (err) {
      console.error("Error loading pathfinder profile:", err);
    }

    try {
      const picData = await profile.pictureGet();
      if (picData && picData.profile_pic) {
        setProfilePhotoUrl(picData.profile_pic);
      }
    } catch (_) {}

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    const old_password = (formData.currentPassword || "").trim();
    const new_password = (formData.newPassword || "").trim();
    const confirm_password = (formData.confirmNewPassword || "").trim();
    if (!old_password || !new_password || !confirm_password) {
      setToast({
        isOpen: true,
        message: "Enter current password, new password, and confirmation.",
        type: "error",
      });
      return;
    }
    if (new_password !== confirm_password) {
      setToast({ isOpen: true, message: "New passwords do not match.", type: "error" });
      return;
    }
    try {
      await auth.changePassword({ old_password, new_password, confirm_password });
      setFormData((p) => ({ ...p, currentPassword: "", newPassword: "", confirmNewPassword: "" }));
      setToast({ isOpen: true, message: "Password updated.", type: "success" });
    } catch (err) {
      setToast({
        isOpen: true,
        message: getApiErrorMessage(err) || "Could not change password.",
        type: "error",
      });
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModal({ isOpen: true });
  };

  const confirmDeleteAccount = async () => {
    setDeleteModal({ isOpen: false });
    try {
      await auth.deleteAccount();
      await logout();
      setToast({ isOpen: true, message: "Your account has been deleted.", type: "success" });
      navigate("/login", { replace: true });
    } catch (err) {
      setToast({
        isOpen: true,
        message: err.message || "Could not delete account. Try again or contact support.",
        type: "error",
      });
    }
  };

  const displayName = [formData.first_name, formData.last_name].filter(Boolean).join(" ").toUpperCase() || "PATHFINDER";

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-14 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />

      <div className="pt-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
              Pathfinder Settings
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Manage your account settings, profile information, and preferences
            </p>
          </div>

          {/* Profile summary (read-only) */}
          <div className="mb-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-purple-100 flex items-center justify-center">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#6A00B1] font-bold text-xl">{displayName.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg leading-tight">{displayName}</p>
                {formData.title && <p className="text-gray-600 text-sm">{formData.title}</p>}
              </div>
              <Link
                to="/profile"
                className="ml-auto text-[#6A00B1] text-sm font-semibold hover:underline"
              >
                Edit profile
              </Link>
            </div>

          </div>

          {/* Change password */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Change Password</h2>
            <p className="text-gray-600 text-sm mb-3">Change the password you use to sign in with email.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              className="mt-4 bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5A0091]"
            >
              Update password
            </button>
          </div>

          {/* Set password (Google sign-in) */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-[#45005A] mb-2">Password</h2>
            <p className="text-gray-700 text-sm md:text-base mb-3">
              Signed in with Google? Add a password so you can sign in with email too.
            </p>
            <Link
              to="/set-password"
              className="inline-block text-[#6A00B1] font-semibold text-sm hover:underline mb-8"
            >
              Set password
            </Link>
          </div>

          {/* Delete account */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-4">Delete Account</h2>
            <p className="text-gray-700 text-sm md:text-base mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-red-700 transition-colors"
            >
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

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })}
      />
    </div>
  );
};

export default PathfinderSettings;
