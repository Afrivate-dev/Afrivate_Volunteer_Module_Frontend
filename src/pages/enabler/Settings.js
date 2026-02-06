import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import * as api from "../../services/api";

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "Enabler Settings - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    currentPassword: "",
    newPassword: "",
    bio: "",
    website: "",
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.profile.enablerGet();
      const base = data.base_details || {};
      setFormData((prev) => ({
        ...prev,
        fullName: data.name ?? prev.fullName,
        email: base.contact_email ?? prev.email,
        phoneNumber: base.phone_number ?? prev.phoneNumber,
        location: base.address ?? base.country ?? prev.location,
        bio: base.bio ?? prev.bio,
        website: base.website ?? prev.website,
      }));
      setProfilePhotoUrl(base.profile_pic || "");
      setCompanyName((data.name || "").toUpperCase());
      return;
    } catch (_) {}
    try {
      const saved = localStorage.getItem("enablerProfile");
      if (saved) {
        const profile = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          fullName: profile.name ?? prev.fullName,
          email: profile.email ?? prev.email,
          phoneNumber: profile.phoneNumber ?? prev.phoneNumber,
          location: profile.address ?? prev.location,
          bio: profile.bio ?? prev.bio,
          website: profile.website ?? prev.website,
        }));
        setProfilePhotoUrl(profile.profilePictureDataUrl || "");
        setCompanyName((profile.name || "").toUpperCase());
      }
    } catch (e) {
      console.error("Error loading enabler profile:", e);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (fieldName) => {
    setEditingField(fieldName);
    setTempValues(prev => ({
      ...prev,
      [fieldName]: formData[fieldName]
    }));
  };

  const handleSaveField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: tempValues[fieldName] || prev[fieldName]
    }));
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const existing = JSON.parse(localStorage.getItem("enablerProfile") || "{}");
      const updated = {
        ...existing,
        name: formData.fullName.trim() || existing.name,
        email: formData.email.trim() || existing.email,
        phoneNumber: formData.phoneNumber.trim() || existing.phoneNumber,
        address: formData.location.trim() || existing.address,
        website: formData.website.trim() || existing.website,
        bio: formData.bio.trim() || existing.bio,
        profilePictureDataUrl: profilePhotoUrl || existing.profilePictureDataUrl,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("enablerProfile", JSON.stringify(updated));
      setCompanyName((updated.name || "TECH INNOVATORS").toUpperCase());

      try {
        await api.profile.enablerPatch({
          name: formData.fullName.trim() || existing.name,
          base_details: {
            bio: formData.bio.trim() || "",
            contact_email: formData.email.trim() || "",
            phone_number: formData.phoneNumber.trim() || "",
            website: formData.website.trim() || "",
            address: formData.location.trim() || "",
          },
        });
      } catch (_) {}

      setToast({ isOpen: true, message: "Changes saved successfully!", type: "success" });
    } catch (e) {
      setToast({ isOpen: true, message: "Failed to save. Try again.", type: "error" });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleDeleteAccount = () => {
    setDeleteModal({ isOpen: true });
  };

  const confirmDeleteAccount = () => {
    // Delete account logic here
    setToast({ isOpen: true, message: "Account deletion requested", type: "info" });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
              Enabler Settings
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Manage your account settings, profile information, and preferences
            </p>
          </div>

          {/* Action Buttons - Top Right (Desktop) / Bottom (Mobile) */}
          <div className="hidden md:flex justify-end gap-3 mb-6">
            <button
              onClick={handleCancel}
              className="border-2 border-[#6A00B1] text-[#6A00B1] px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-purple-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors"
            >
              Save Changes
            </button>
          </div>

          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden flex-shrink-0">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa fa-building text-2xl text-gray-400"></i>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#6A00B1] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Edit Photo
              </button>
            </div>

            {/* Company Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                {companyName}
              </h1>
              
              {/* Edit Bio */}
              <div>
                {editingField === 'bio' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="bio"
                      value={tempValues.bio !== undefined ? tempValues.bio : formData.bio}
                      onChange={(e) => setTempValues(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Edit Bio"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('bio')}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      <i className="fa fa-check text-sm"></i>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <i className="fa fa-times text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-sm md:text-base">
                      {formData.bio || "Edit Bio"}
                    </span>
                    <button
                      onClick={() => handleEditClick('bio')}
                      className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                    >
                      <i className="fa fa-pencil text-sm"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                {editingField === 'website' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="website"
                      value={tempValues.website !== undefined ? tempValues.website : formData.website}
                      onChange={(e) => setTempValues(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Website"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('website')}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      <i className="fa fa-check text-sm"></i>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <i className="fa fa-times text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-sm md:text-base">
                      {formData.website || "Website"}
                    </span>
                    <button
                      onClick={() => handleEditClick('website')}
                      className="text-[#6A00B1] hover:text-[#5A0091] transition-colors"
                    >
                      <i className="fa fa-pencil text-sm"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              Change Password
            </h2>
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
            </div>
          </div>

          {/* Document Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
              Document
            </h2>
            <p className="text-gray-600 text-sm md:text-base mb-4">
              Add your Company's Document (CAC, Affidavit, etc)
            </p>
            <button className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors flex items-center gap-2">
              <i className="fa fa-plus text-sm"></i>
              Add Document
            </button>
          </div>

          {/* Delete Account Section */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-4">
              Delete Account
            </h2>
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

          {/* Action Buttons - Bottom (Mobile Only) */}
          <div className="flex md:hidden flex-col gap-3 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="border-2 border-[#6A00B1] text-[#6A00B1] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors w-full"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5A0091] transition-colors w-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account"
        type="danger"
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })}
      />
    </div>
  );
};

export default Settings;
