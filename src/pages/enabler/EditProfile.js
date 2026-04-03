import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { profile } from "../../services/api";
import { normalizeWebsiteForStorage } from "../../utils/websiteUrl";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    employees: "",
    role: "",
    // base_details fields
    contact_email: "",
    address: "",
    state: "",
    country: "",
    phone_number: "",
    website: "",
    bio: "",
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profile.enablerGet();
      if (data) {
        const base = data.base_details || {};
        setFormData({
          name: data.name || "",
          employees: data.employees || "",
          role: data.role || "",
          contact_email: base.contact_email || "",
          address: base.address || "",
          state: base.state || "",
          country: base.country || "",
          phone_number: base.phone_number || "",
          website: base.website || "",
          bio: base.bio || "",
        });
        setProfilePhotoUrl(base.profile_pic || "");
        if (Array.isArray(data.social_links)) {
          setSocialLinks(data.social_links);
        }
      }
    } catch (err) {
      console.error("Error loading enabler profile:", err);
    } finally {
      setLoading(false);
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
    setSaving(true);
    try {
      // Build base_details object - send all fields to ensure they're all saved
      const baseDetailsData = {
        contact_email: formData.contact_email || "",
        phone_number: formData.phone_number || "",
        address: formData.address || "",
        state: formData.state || "",
        country: formData.country || "",
        website: normalizeWebsiteForStorage(formData.website),
        bio: formData.bio || "",
      };

      // Build the full profile data
      const profileData = {
        name: formData.name || "Enabler",
        employees: formData.employees || null,
        role: formData.role || null,
        base_details: baseDetailsData,
        social_links: socialLinks,
      };

      console.log("Saving profile with data:", JSON.stringify(profileData, null, 2));

      // Try PATCH first for partial update (more forgiving)
      await profile.enablerPatch(profileData);

      setToast({ isOpen: true, message: "Profile updated successfully!", type: "success" });
      setTimeout(() => navigate("/enabler/profile"), 1200);
    } catch (err) {
      console.error("Error saving profile with PATCH, trying PUT:", err);
      try {
        // Fallback to PUT if PATCH fails
        const profileData = {
          name: formData.name || "Enabler",
          employees: formData.employees || null,
          role: formData.role || null,
          base_details: {
            contact_email: formData.contact_email || "",
            phone_number: formData.phone_number || "",
            address: formData.address || "",
            state: formData.state || "",
            country: formData.country || "",
            website: normalizeWebsiteForStorage(formData.website),
            bio: formData.bio || "",
          },
          social_links: socialLinks,
        };
        await profile.enablerUpdate(profileData);
        setToast({ isOpen: true, message: "Profile updated successfully!", type: "success" });
        setTimeout(() => navigate("/enabler/profile"), 1200);
      } catch (putErr) {
        console.error("Error saving profile with PUT:", putErr);
        setToast({ isOpen: true, message: putErr.message || "Failed to save profile. Please try again.", type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    const platform = prompt("Platform name (e.g., LinkedIn, Twitter):");
    const url = prompt("Platform URL:");
    if (platform && url) {
      setSocialLinks([...socialLinks, { platform_name: platform, platform_url: url }]);
    }
  };

  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

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

            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Company or Organization name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Short description about your organization"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm resize-none"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+234..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm bg-white"
                  required
                >
                  <option value="">Select country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ghana">Ghana</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://company.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
              />
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
                <input
                  type="text"
                  name="employees"
                  value={formData.employees}
                  onChange={handleInputChange}
                  placeholder="e.g. 50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g. CEO, Programme Manager"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700 text-sm"
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Social Links</label>
              {socialLinks.length > 0 && (
                <div className="space-y-2 mb-2">
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{link.platform_name}: {link.platform_url}</span>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addSocialLink}
                className="text-[#6A00B1] text-sm font-semibold hover:underline"
              >
                + Add Social Link
              </button>
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
                disabled={saving}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save profile'}
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
