import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import * as api from "../../services/api";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    email: "",
    state: "",
    phoneNumber: "",
    address: "",
    website: "",
    employees: "",
    role: "",
    bio: "",
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  const loadProfile = useCallback(async () => {
    try {
      const data = await api.profile.enablerGet();
      const base = data.base_details || {};
      setFormData({
        name: data.name ?? "",
        country: base.country ?? "",
        email: base.contact_email ?? "",
        state: base.state ?? "",
        phoneNumber: base.phone_number ?? "",
        address: base.address ?? "",
        website: base.website ?? "",
        employees: base.employees ?? "",
        role: base.role ?? "",
        bio: base.bio ?? "",
      });
      setProfilePhotoUrl(base.profile_pic || "");
      return;
    } catch (_) {}
    try {
      const saved = localStorage.getItem("enablerProfile");
      if (saved) {
        const profile = JSON.parse(saved);
        setFormData({
          name: profile.name ?? "",
          country: profile.country ?? "",
          email: profile.email ?? "",
          state: profile.state ?? "",
          phoneNumber: profile.phoneNumber ?? "",
          address: profile.address ?? "",
          website: profile.website ?? "",
          employees: profile.employees ?? "",
          role: profile.role ?? "",
          bio: profile.bio ?? "",
        });
        setProfilePhotoUrl(profile.profilePictureDataUrl || "");
      }
    } catch (e) {
      console.error("Error loading enabler profile:", e);
    }
  }, []);

  useEffect(() => {
    document.title = "Edit Profile - AfriVate";
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        ...formData,
        profilePictureDataUrl: profilePhotoUrl || existing.profilePictureDataUrl,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("enablerProfile", JSON.stringify(updated));

      try {
        const base_details = {
          bio: formData.bio || "",
          country: formData.country || "",
          contact_email: formData.email || "",
          phone_number: formData.phoneNumber || "",
          website: formData.website || "",
          address: formData.address || "",
          state: formData.state || "",
          city: "",
        };
        await api.profile.enablerUpdate({
          name: formData.name || "Enabler",
          base_details,
          social_links: [],
        });
      } catch (_) {}

      setToast({ isOpen: true, message: "Profile updated successfully!", type: "success" });
      setTimeout(() => navigate("/enabler/profile"), 1200);
    } catch (e) {
      setToast({ isOpen: true, message: "Failed to save. Try again.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/enabler/profile")}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Edit Profile</h1>
          <p className="text-gray-600 mb-6">Update your company and contact details.</p>

          <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200 shadow-sm space-y-6">
            {/* Profile picture */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden flex-shrink-0">
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa fa-building text-2xl text-gray-400"></i>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#6A00B1] text-sm font-semibold hover:underline"
              >
                Change photo
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Company or your name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Short bio"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm bg-white"
                >
                  <option value="">Select country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ghana">Ghana</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Tanzania">Tanzania</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Website"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                <input
                  type="text"
                  name="employees"
                  value={formData.employees}
                  onChange={handleInputChange}
                  placeholder="e.g. 10-50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g. Programme Manager"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/enabler/profile")}
                className="border-2 border-[#6A00B1] text-[#6A00B1] px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Save profile
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })}
      />
    </div>
  );
};

export default EditProfile;
