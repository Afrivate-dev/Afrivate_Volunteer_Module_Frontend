import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { profile } from "../../services/api";

const EnablerProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });

  useEffect(() => {
    document.title = "Profile - AfriVate";
    loadProfile();
    loadCredentials();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profile.enablerGet();
      setProfileData(data);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = async () => {
    try {
      const data = await profile.credentialsList();
      setCredentials(data || []);
    } catch {}
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const documentName = prompt("Enter document name (e.g., Business Registration, Tax Certificate):");
    if (!documentName) { e.target.value = ""; return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document_name", documentName);
      formData.append("document", file);
      await profile.credentialsCreate(formData);
      setToast({ isOpen: true, message: "Document uploaded successfully!", type: "success" });
      await loadCredentials();
    } catch (err) {
      setToast({ isOpen: true, message: err.message || "Failed to upload document.", type: "error" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 text-center px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadProfile} className="text-[#8D4087] hover:underline">Try Again</button>
        </div>
      </div>
    );
  }

  const base = profileData?.base_details || {};
  const socialLinks = profileData?.social_links || [];

  const docIcons = ["", "", "", ""];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />

      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}
          className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {base.profile_pic ? (
                <img src={base.profile_pic} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profileData?.name || "Your Organization"}</h1>
              <p className="text-purple-200 text-sm mt-1">{base.bio || "Pioneering digital transformation."}</p>
            </div>
            <button
              onClick={() => navigate("/enabler/edit-profile")}
              className="border border-white text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white hover:text-[#651F5F] transition-colors flex items-center gap-2"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Reach Out */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">Reach Out</h2>
              <div className="space-y-3">
                {base.contact_email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                    <div>
                      <p className="text-xs text-gray-400">Email Address</p>
                      <p className="text-sm text-gray-800">{base.contact_email}</p>
                    </div>
                  </div>
                )}
                {base.phone_number && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.45 2 2 0 0 1 3.57 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
                    <div>
                      <p className="text-xs text-gray-400">Phone Number</p>
                      <p className="text-sm text-gray-800">{base.phone_number}</p>
                    </div>
                  </div>
                )}
                {base.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a href={base.website} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-[#8D4087] hover:underline">
                        {base.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Company */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">About the Company</h2>
              <div className="space-y-3">
                {(base.address || base.state) && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Headquarters</p>
                    <p className="text-sm text-gray-800">
                      {[base.address, base.state, base.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
                {profileData?.employees && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Team Size</p>
                    <p className="text-sm text-gray-800">{profileData.employees} Employees</p>
                  </div>
                )}
              </div>
            </div>

            {/* Connect With Us */}
            {socialLinks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3">Connect With Us</h2>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link, i) => (
                    <a key={i} href={link.platform_url} target="_blank" rel="noopener noreferrer"
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-purple-100 hover:text-[#8D4087] transition-colors">
                      {link.platform_name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Corporate Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">Corporate Documents</h2>
                <label className="bg-[#8D4087] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#651F5F] transition-colors flex items-center gap-1.5">
                  {uploading ? "Uploading..." : "Upload Documents"}
                  <input type="file" accept=".pdf,.png,.jpeg,.jpg,.webp" onChange={handleDocumentUpload}
                    disabled={uploading} className="hidden" />
                </label>
              </div>

              {credentials.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No documents uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {credentials.map((cred, i) => (
                    <div key={cred.id || i}
                      className="border border-gray-100 rounded-xl p-3 flex items-center justify-between bg-purple-50/30 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-lg">
                          {docIcons[i % docIcons.length]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{cred.document_name}</p>
                          {cred.uploaded_at && (
                            <p className="text-xs text-gray-400">
                              {new Date(cred.uploaded_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>
                      </div>
                      {cred.document && (
                        <a href={cred.document} target="_blank" rel="noopener noreferrer"
                          className="text-gray-400 hover:text-[#8D4087] text-lg">⬇️</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Score */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }}>
              <h2 className="text-white font-bold mb-1">Performance Score</h2>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-white">
                  {profileData?.performance_score || "—"}
                </span>
                <span className="text-purple-200 text-lg">/100</span>
              </div>
              <p className="text-purple-200 text-sm">
                {profileData?.performance_score
                  ? "Ranked among the top enablers in the region for project success."
                  : "Complete your profile and post opportunities to build your score."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default EnablerProfile;
