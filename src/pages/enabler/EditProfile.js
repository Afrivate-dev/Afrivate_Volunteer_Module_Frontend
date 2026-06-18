import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { useUser } from "../../context/UserContext";
import Toast from "../../components/common/Toast";
import { profile, getApiErrorMessage } from "../../services/api";
import { normalizeWebsiteForStorage } from "../../utils/websiteUrl";
import { syncSocialLinksRestApi, socialLinksHaveRestIds } from "../../utils/syncSocialLinks";

const COUNTRIES = ["Nigeria","Kenya","Ghana","South Africa","Tanzania","Uganda","Ethiopia","Rwanda","Senegal","Other"];

const EditProfile = () => {
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const fileInputRef = useRef(null);
  const initialSocialLinksRef = useRef([]);
  const [formData, setFormData] = useState({
    name: "", employees: "", role: "",
    contact_email: "", address: "", state: "", country: "",
    phone_number: "", website: "", bio: "",
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
          name: data.name || "", employees: data.employees || "", role: data.role || "",
          contact_email: base.contact_email || "", address: base.address || "",
          state: base.state || "", country: base.country || "",
          phone_number: base.phone_number || "", website: base.website || "", bio: base.bio || "",
        });
        setProfilePhotoUrl(base.profile_pic || "");
        const sl = Array.isArray(data.social_links) ? data.social_links : [];
        setSocialLinks(sl);
        initialSocialLinksRef.current = JSON.parse(JSON.stringify(sl));
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

  const addSocialLink = () => setSocialLinks((prev) => [...prev, { platform_name: "", platform_url: "" }]);
  const removeSocialLink = (i) => setSocialLinks((prev) => prev.filter((_, idx) => idx !== i));
  const updateSocialLink = (i, field, value) => setSocialLinks((prev) => {
    const next = [...prev];
    next[i] = { ...next[i], [field]: value };
    return next;
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const filteredLinks = socialLinks
        .map((l) => ({ id: l.id, platform_name: (l.platform_name || "").trim(), platform_url: (l.platform_url || "").trim() }))
        .filter((l) => l.platform_name || l.platform_url);
      const useRest = socialLinksHaveRestIds(initialSocialLinksRef.current) || socialLinksHaveRestIds(filteredLinks);
      const payload = {
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
      };
      if (!useRest) payload.social_links = filteredLinks.map(({ platform_name, platform_url }) => ({ platform_name, platform_url }));
      await profile.enablerPatch(payload);
      if (useRest) await syncSocialLinksRestApi(initialSocialLinksRef.current, filteredLinks);
      const fresh = await profile.enablerGet();
      const newSl = Array.isArray(fresh.social_links) ? fresh.social_links : [];
      setSocialLinks(newSl);
      initialSocialLinksRef.current = JSON.parse(JSON.stringify(newSl));
      await refetchUser();
      setToast({ isOpen: true, message: "Profile updated successfully!", type: "success" });
      setTimeout(() => navigate("/enabler/profile"), 1200);
    } catch (err) {
      const rawMsg = getApiErrorMessage(err) || err.message || "";
      const msg = (rawMsg.toLowerCase().includes("website") || rawMsg.toLowerCase().includes("enter a valid url"))
        ? "Please enter a valid website URL (e.g. https://yourwebsite.com) or leave it blank"
        : rawMsg || "Failed to save profile. Please try again.";
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />

      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}
          className="px-8 py-8 flex items-center gap-4">
          <button onClick={() => navigate("/enabler/profile")}
            className="text-white hover:text-purple-200 transition-colors text-xl">←</button>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {profilePhotoUrl
                    ? <img src={profilePhotoUrl} alt="Logo" className="w-full h-full object-cover" />
                    : <span className="text-3xl">🏢</span>}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-[#8D4087] rounded-full flex items-center justify-center text-white text-xs hover:bg-[#651F5F]">
                  📷
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Company Logo</p>
                <p className="text-xs text-gray-400">Suggested size: 400×400px. PNG or JPG format.</p>
              </div>
            </div>

            {/* Company Name + Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Company Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="Innovative Solutions Group" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Your Position</label>
                <input name="role" value={formData.role} onChange={handleInputChange}
                  placeholder="Chief Executive Officer" className={inputCls} />
              </div>
            </div>

            {/* About Me */}
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">About Me</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4}
                placeholder="A concise overview of your organization and its objectives..."
                className={inputCls + " resize-none"} />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange}
                  placeholder="info@company.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Contact Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567" className={inputCls} />
              </div>
            </div>

            {/* Location + Website */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Location</label>
                <div className="relative">
                  <select name="country" value={formData.country} onChange={handleInputChange}
                    className={inputCls + " appearance-none pr-8"}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Official Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleInputChange}
                  placeholder="https://www.company.com" className={inputCls} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">Address</label>
              <input name="address" value={formData.address} onChange={handleInputChange}
                placeholder="456 Creative Lane, Suite 300" className={inputCls} />
            </div>

            <hr className="border-gray-100" />

            {/* Social Media Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Social Media Links</h3>
              <div className="space-y-2">
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">🔗</span>
                    <input value={link.platform_url || ""} onChange={(e) => updateSocialLink(i, "platform_url", e.target.value)}
                      placeholder={link.platform_name || "LinkedIn Profile"}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8D4087]" />
                    <button type="button" onClick={() => removeSocialLink(i)}
                      className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSocialLink}
                className="mt-3 text-[#8D4087] text-sm font-semibold hover:underline flex items-center gap-1">
                + Insert link
              </button>
            </div>

            <hr className="border-gray-100" />

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button type="button" onClick={() => navigate("/enabler/profile")}
                className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                Discard changes
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="px-8 py-3 rounded-xl bg-[#8D4087] text-white font-semibold text-sm hover:bg-[#651F5F] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Update profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default EditProfile;
