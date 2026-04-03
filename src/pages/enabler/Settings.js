import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import { profile } from "../../services/api";
import { normalizeWebsiteForStorage } from "../../utils/websiteUrl";

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "Enabler Settings - AfriVate";
  }, []);

  // Form fields match API: name, employees, role, base_details (contact_email, address, state, country), social_links
  const [formData, setFormData] = useState({
    name: "",
    employees: "",
    role: "",
    contact_email: "",
    address: "",
    state: "",
    country: "",
    bio: "",
    phone_number: "",
    website: "",
    currentPassword: "",
    newPassword: "",
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [baseDetailsId, setBaseDetailsId] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState(null);
  const documentInputRef = useRef(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await profile.enablerGet();
      if (data) {
        const base = data.base_details || {};
        if (base.id != null) setBaseDetailsId(base.id);
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          employees: data.employees != null && data.employees !== "" ? String(data.employees) : "",
          role: data.role || "",
          contact_email: base.contact_email || "",
          address: base.address || "",
          state: base.state || "",
          country: base.country || "",
          bio: base.bio || "",
          phone_number: base.phone_number || "",
          website: base.website || "",
        }));
        setSocialLinks(Array.isArray(data.social_links) ? data.social_links : []);
      }
    } catch (err) {
      console.error("Error loading enabler profile:", err);
    }
    
    try {
      const picData = await profile.pictureGet();
      if (picData && picData.profile_pic) {
        setProfilePhotoUrl(picData.profile_pic);
      }
    } catch (picErr) {
      console.log("No profile picture yet");
    }

    try {
      const credList = await profile.credentialsList();
      const credsArray = Array.isArray(credList) ? credList : credList?.results || [];
      setCredentials(credsArray);
    } catch (_) {}
    
    setLoading(false);
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

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform_name: "", platform_url: "" }]);
  };

  const updateSocialLink = (index, field, value) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { platform_name: "", platform_url: "" };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSocialLink = (index) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoUrl(reader.result);
    reader.readAsDataURL(file);
    
    // Upload to server
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("profile_pic", file);
      await profile.picturePatch(formDataToSend);
      setToast({ isOpen: true, message: "Profile picture updated!", type: "success" });
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setToast({ isOpen: true, message: "Failed to upload picture. Try again.", type: "error" });
    }
  };

  const handleSave = async () => {
    try {
      const name = formData.name.trim();
      const contact_email = formData.contact_email.trim();
      const address = formData.address.trim();
      const state = formData.state.trim();
      const country = formData.country.trim();
      if (!name || !contact_email || !address || !state || !country) {
        setToast({ isOpen: true, message: "Name, email, address, state and country are required.", type: "error" });
        return;
      }
      const employeesNum = formData.employees.trim() === "" ? null : parseInt(formData.employees, 10);
      // API expects base_details with: bio, contact_email, phone_number, address, state, country, website
      const base_details = {
        bio: (formData.bio || "").trim() || "",
        contact_email,
        phone_number: (formData.phone_number || "").trim() || "",
        address,
        state,
        country,
        website: normalizeWebsiteForStorage(formData.website),
      };
      if (baseDetailsId != null) base_details.id = baseDetailsId;
      const updateData = {
        name,
        employees: Number.isNaN(employeesNum) ? null : employeesNum,
        role: formData.role.trim() || null,
        base_details,
        social_links: socialLinks
          .map((l) => ({ platform_name: (l.platform_name || "").trim(), platform_url: (l.platform_url || "").trim() }))
          .filter((l) => l.platform_name || l.platform_url),
      };
      await profile.enablerUpdate(updateData);
      setToast({ isOpen: true, message: "Changes saved successfully!", type: "success" });
    } catch (err) {
      console.error("Error saving profile:", err);
      setToast({ isOpen: true, message: err.message || "Failed to save. Try again.", type: "error" });
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile) return;
    setUploadingDoc(true);
    setDocUploadError(null);
    try {
      const fd = new FormData();
      fd.append("document_name", documentFile.name || "Company Document");
      fd.append("document", documentFile);
      await profile.credentialsCreate(fd);
      const credList = await profile.credentialsList();
      const credsArray = Array.isArray(credList) ? credList : credList?.results || [];
      setCredentials(credsArray);
      setDocumentFile(null);
      if (documentInputRef.current) documentInputRef.current.value = "";
      setToast({ isOpen: true, message: "Document uploaded successfully.", type: "success" });
    } catch (err) {
      setDocUploadError(err.message || "Failed to upload document.");
      setToast({ isOpen: true, message: "Failed to upload document. Try again.", type: "error" });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteCredential = async (id) => {
    try {
      await profile.credentialsDelete(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      setToast({ isOpen: true, message: "Document removed.", type: "success" });
    } catch (err) {
      setToast({ isOpen: true, message: "Failed to remove document.", type: "error" });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleDeleteAccount = () => {
    setDeleteModal({ isOpen: true });
  };

  const confirmDeleteAccount = () => {
    setToast({ isOpen: true, message: "Account deletion requested", type: "info" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
              Enabler Settings
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Manage your account settings, profile information, and preferences
            </p>
          </div>

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

            <div className="flex flex-col md:flex-row gap-6 mb-8">
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

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
                {formData.name ? formData.name.toUpperCase() : "ENABLER"}
              </h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Organization profile</h2>
            <p className="text-gray-600 text-sm mb-4">
              Complete your organization details below. Name, contact email, address, state and country are required.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Organization name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Tech Solutions Ltd"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Employees</label>
                <input
                  type="number"
                  name="employees"
                  value={formData.employees}
                  onChange={handleInputChange}
                  placeholder="e.g. 50"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g. CEO"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Contact email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="admin@company.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="456 Corporate Way"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="e.g. Accra"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g. Ghana"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Phone number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+234..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Short bio</label>
                <input
                  type="text"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Short bio"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] text-gray-700"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-black mb-2">Social links</h3>
              <p className="text-gray-600 text-sm mb-2">Add platform name and URL (e.g. Website, https://company.com)</p>
              {socialLinks.map((link, index) => (
                <div key={index} className="flex flex-wrap gap-2 items-center mb-2">
                  <input
                    type="text"
                    value={link.platform_name || ""}
                    onChange={(e) => updateSocialLink(index, "platform_name", e.target.value)}
                    placeholder="Platform (e.g. Website)"
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
                  />
                  <input
                    type="url"
                    value={link.platform_url || ""}
                    onChange={(e) => updateSocialLink(index, "platform_url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove"
                  >
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                className="text-[#6A00B1] font-semibold text-sm hover:underline flex items-center gap-1"
              >
                <i className="fa fa-plus"></i> Add social link
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Change Password</h2>
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

          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4">Document</h2>
            <p className="text-gray-600 text-sm md:text-base mb-4">
              Add your company documents (e.g. CAC, Affidavit). You can upload PDF or images.
            </p>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.png,.jpeg,.jpg,.jfif,.webp"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg text-sm md:text-base font-semibold hover:bg-[#5A0091] transition-colors flex items-center gap-2"
              >
                <i className="fa fa-plus text-sm"></i>
                Choose Document
              </button>
              {documentFile && (
                <>
                  <span className="text-sm text-gray-600">{documentFile.name}</span>
                  <button
                    type="button"
                    onClick={handleDocumentUpload}
                    disabled={uploadingDoc}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploadingDoc ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDocumentFile(null); if (documentInputRef.current) documentInputRef.current.value = ""; }}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            {docUploadError && <p className="text-red-500 text-sm mb-2">{docUploadError}</p>}
            {credentials.length > 0 && (
              <ul className="space-y-2">
                {credentials.map((cred) => (
                  <li key={cred.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <span className="text-sm text-gray-700">{cred.document_name || cred.name || "Document"}</span>
                    <div className="flex items-center gap-2">
                      {cred.document && (
                        <a href={cred.document} target="_blank" rel="noopener noreferrer" className="text-[#6A00B1] text-sm hover:underline">View</a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteCredential(cred.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

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

export default Settings;
