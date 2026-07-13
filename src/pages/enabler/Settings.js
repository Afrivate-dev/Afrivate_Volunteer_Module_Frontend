import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Lock, User, FileText, Trash2, Upload } from "lucide-react";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import PasswordRequirements, { isPasswordValid } from "../../components/common/PasswordRequirements";
import { profile, auth, getApiErrorMessage } from "../../services/api";
import { useUser } from "../../context/UserContext";
import { normalizeWebsiteForStorage } from "../../utils/websiteUrl";
import { syncSocialLinksRestApi, socialLinksHaveRestIds } from "../../utils/syncSocialLinks";

const INDUSTRIES = [
  "Technology & Innovation","Education & Training","Healthcare","Finance & Fintech",
  "Agriculture","Creative & Media","Non-profit & NGO","Government","Other",
];

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const initialSocialLinksRef = useRef([]);

  useEffect(() => { document.title = "Enabler Settings - AfriVate"; }, []);

  const [formData, setFormData] = useState({
    name: "", employees: "", role: "", contact_email: "", address: "", state: "",
    country: "", bio: "", phone_number: "", website: "", industry: "",
    currentPassword: "", newPassword: "", confirmNewPassword: "",
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [baseDetailsId, setBaseDetailsId] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
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
          name: data.name || "", employees: String(data.employees ?? ""), role: data.role || "",
          contact_email: base.contact_email || "", address: base.address || "",
          state: base.state || "", country: base.country || "",
          bio: base.bio || "", phone_number: base.phone_number || "", website: base.website || "",
        }));
        const sl = Array.isArray(data.social_links) ? data.social_links : [];
        setSocialLinks(sl);
        initialSocialLinksRef.current = JSON.parse(JSON.stringify(sl));
      }
    } catch {}
    try {
      const picData = await profile.pictureGet();
      if (picData?.profile_pic) setProfilePhotoUrl(picData.profile_pic);
    } catch {}
    try {
      const credList = await profile.credentialsList();
      setCredentials(Array.isArray(credList) ? credList : credList?.results || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoUrl(reader.result);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData(); fd.append("profile_pic", file);
      await profile.picturePatch(fd);
      setToast({ isOpen: true, message: "Profile picture updated!", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Failed to upload picture.", type: "error" });
    }
  };

  const handleSave = async () => {
    const { name, contact_email, address, state, country } = formData;
    if (!name.trim() || !contact_email.trim() || !address.trim() || !state.trim() || !country.trim()) {
      setToast({ isOpen: true, message: "Name, email, address, state and country are required.", type: "error" });
      return;
    }
    try {
      const employeesNum = formData.employees.trim() === "" ? null : parseInt(formData.employees, 10);
      const base_details = {
        bio: formData.bio.trim(), contact_email: contact_email.trim(),
        phone_number: formData.phone_number.trim(), address: address.trim(),
        state: state.trim(), country: country.trim(),
        website: normalizeWebsiteForStorage(formData.website),
      };
      if (baseDetailsId != null) base_details.id = baseDetailsId;
      const filteredLinks = socialLinks
        .map((l) => ({ id: l.id, platform_name: (l.platform_name || "").trim(), platform_url: (l.platform_url || "").trim() }))
        .filter((l) => l.platform_name || l.platform_url);
      const useRest = socialLinksHaveRestIds(initialSocialLinksRef.current) || socialLinksHaveRestIds(filteredLinks);
      const updateData = { name: name.trim(), employees: Number.isNaN(employeesNum) ? null : employeesNum, role: formData.role.trim() || null, base_details };
      if (!useRest) updateData.social_links = filteredLinks.map(({ platform_name, platform_url }) => ({ platform_name, platform_url }));
      await profile.enablerPatch(updateData);
      if (useRest) await syncSocialLinksRestApi(initialSocialLinksRef.current, filteredLinks);
      const fresh = await profile.enablerGet();
      const newSl = Array.isArray(fresh.social_links) ? fresh.social_links : [];
      setSocialLinks(newSl);
      initialSocialLinksRef.current = JSON.parse(JSON.stringify(newSl));
      setToast({ isOpen: true, message: "Changes saved successfully!", type: "success" });
    } catch (err) {
      setToast({ isOpen: true, message: getApiErrorMessage(err) || "Failed to save.", type: "error" });
    }
  };

  const handleChangePassword = async () => {
    const old_password = formData.currentPassword.trim();
    const new_password = formData.newPassword.trim();
    const confirm_password = formData.confirmNewPassword.trim();
    if (!old_password || !new_password || !confirm_password) {
      setToast({ isOpen: true, message: "All password fields are required.", type: "error" }); return;
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

  const handleDocumentUpload = async () => {
    if (!documentFile) return;
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      const name = documentName.trim() || documentFile.name.replace(/\.[^/.]+$/, "") || "Company Document";
      fd.append("document_name", name);
      fd.append("document", documentFile);
      await profile.credentialsCreate(fd);
      const credList = await profile.credentialsList();
      setCredentials(Array.isArray(credList) ? credList : credList?.results || []);
      setDocumentFile(null);
      setDocumentName("");
      if (documentInputRef.current) documentInputRef.current.value = "";
      setToast({ isOpen: true, message: "Document uploaded.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Failed to upload document.", type: "error" });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteCredential = async (id) => {
    try {
      await profile.credentialsDelete(id);
      setCredentials((prev) => prev.filter((c) => c.id !== id));
      setToast({ isOpen: true, message: "Document removed.", type: "success" });
    } catch {
      setToast({ isOpen: true, message: "Failed to remove document.", type: "error" });
    }
  };

  const confirmDeleteAccount = async () => {
    setDeleteModal({ isOpen: false });
    try {
      await auth.deleteAccount();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setToast({ isOpen: true, message: err.message || "Could not delete account.", type: "error" });
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";
  const cardCls = "bg-white rounded-2xl border border-gray-100 shadow-sm p-6";

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
          className="px-4 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-purple-200 text-sm mt-1">Manage your profile, password, and account.</p>
          </div>
          <button onClick={handleSave}
            className="border border-white text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:text-[#651F5F] transition-colors flex items-center gap-2">
            Save changes
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

          {/* Organization Profile */}
          <div className={cardCls}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {profilePhotoUrl
                    ? <img src={profilePhotoUrl} alt="Logo" className="w-full h-full object-cover" />
                    : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#8D4087] rounded-full flex items-center justify-center text-white">
                  <Camera size={12} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Organization Profile</h2>
                <p className="text-xs text-gray-400">Update your company details and visibility.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Company Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Afrivate Global Solutions" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Industry</label>
                <div className="relative">
                  <select name="industry" value={formData.industry} onChange={handleInputChange}
                    className={inputCls + " appearance-none pr-8"}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-gray-500 mb-1.5">Short Biography</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3}
                placeholder="Empowering African talent through meaningful career paths..."
                className={inputCls + " resize-none"} />
            </div>
          </div>

          {/* Security & Privacy */}
          <div className={cardCls}>
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4"><Lock size={16} className="text-[#8D4087]" /> Security &amp; Privacy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Current Password</label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange}
                  placeholder="••••••••" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">New Password</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange}
                  placeholder="••••••••" className={inputCls} />
                <PasswordRequirements password={formData.newPassword} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Confirm New Password</label>
                <input type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleInputChange}
                  placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            <button type="button" onClick={handleChangePassword}
              className="mt-4 text-[#8D4087] text-sm font-semibold hover:underline">
              Update password →
            </button>
          </div>

          {/* Legacy Authentication */}
          <div className="border-2 border-dashed border-purple-200 rounded-2xl p-4 flex items-center justify-between bg-purple-50/40">
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#8D4087]" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Legacy Authentication</p>
                <p className="text-xs text-gray-500">Need to set a dedicated password for third-party integrations?</p>
              </div>
            </div>
            <button onClick={() => navigate("/set-password")}
              className="text-[#8D4087] text-sm font-semibold hover:underline whitespace-nowrap">
              Set integration password
            </button>
          </div>

          {/* Organization Documents */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><FileText size={16} className="text-[#8D4087]" /> Organization Documents</h2>
              <label className="border border-[#8D4087] text-[#8D4087] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-50 flex items-center gap-1.5">
                <Upload size={13} /> Upload new
                <input ref={documentInputRef} type="file" accept=".pdf,.png,.jpeg,.jpg,.webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setDocumentFile(f);
                    setDocumentName(f ? f.name.replace(/\.[^/.]+$/, "") : "");
                  }} className="hidden" />
              </label>
            </div>
            {documentFile && (
              <div className="mb-4 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2 break-all">File: {documentFile.name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input type="text" value={documentName} onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Document name (e.g. Business Registration)"
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#8D4087] focus:border-[#8D4087]" />
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={handleDocumentUpload} disabled={uploadingDoc}
                      className="bg-[#8D4087] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#651F5F] disabled:opacity-50">
                      {uploadingDoc ? "Uploading..." : "Upload"}
                    </button>
                    <button onClick={() => { setDocumentFile(null); setDocumentName(""); if (documentInputRef.current) documentInputRef.current.value = ""; }}
                      className="text-gray-400 hover:text-gray-600 text-sm px-2">✕</button>
                  </div>
                </div>
              </div>
            )}
            {credentials.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {credentials.map((cred) => {
                  return (
                    <div key={cred.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0"><FileText size={18} className="text-[#8D4087]" /></div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{cred.document_name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {cred.is_verified
                          ? <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Verified</span>
                          : <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">Pending review</span>}
                        <button onClick={() => handleDeleteCredential(cred.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Account */}
          <div className={cardCls}>
            <h2 className="font-bold text-red-600 mb-1">Delete Account Permanently</h2>
            <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={() => setDeleteModal({ isOpen: true })}
              className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
              <Trash2 size={15} /> Delete Account
            </button>
          </div>

        </div>
      </div>

      <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDeleteAccount} title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete Account" type="danger" />

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default Settings;
