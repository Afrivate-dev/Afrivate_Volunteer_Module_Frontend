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
  const [credentialsLoading, setCredentialsLoading] = useState(true);
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
      console.error("Error loading profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = async () => {
    setCredentialsLoading(true);
    try {
      const data = await profile.credentialsList();
      setCredentials(data || []);
    } catch (err) {
      console.error("Error loading credentials:", err);
      // Don't show error for credentials - they might not exist yet
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const documentName = prompt("Enter document name (e.g., International Passport, Driver's License):");
    if (!documentName) {
      e.target.value = ""; // Reset input
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document_name", documentName);
      formData.append("document", file);

      await profile.credentialsCreate(formData);
      
      setToast({ 
        isOpen: true, 
        message: "Document uploaded successfully!", 
        type: "success" 
      });
      
      // Reload credentials to show the new one
      await loadCredentials();
    } catch (err) {
      console.error("Error uploading document:", err);
      setToast({ 
        isOpen: true, 
        message: err.message || "Failed to upload document. Please try again.", 
        type: "error" 
      });
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-14 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <EnablerNavbar />
        <div className="pt-14 px-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-4 text-[#6A00B1] hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const base = profileData?.base_details || {};

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      
      {/* Main Content */}
      <div className="pt-14 px-4 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-[#6A00B1] rounded-[30px] p-6 md:p-8 text-white mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                {base.profile_pic ? (
                  <img 
                    src={base.profile_pic} 
                    alt={profileData?.name || "Profile"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <i className="fa fa-building text-4xl md:text-5xl text-white/60"></i>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {profileData?.name || "Enabler"}
                </h1>
                {profileData?.role && (
                  <p className="text-white/80 mb-2">{profileData.role}</p>
                )}
                {base.bio && (
                  <p className="text-white/90 text-sm max-w-xl">{base.bio}</p>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => navigate("/enabler/edit-profile")}
                className="bg-white text-[#6A00B1] px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Contact & Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Contact Information */}
            <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-black mb-4">Contact Information</h2>
              <div className="space-y-3">
                {base.contact_email && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-envelope text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.contact_email}</span>
                  </div>
                )}
                {base.phone_number && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-phone text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.phone_number}</span>
                  </div>
                )}
                {base.website && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-globe text-[#6A00B1] w-5"></i>
                    <a 
                      href={base.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#6A00B1] hover:underline"
                    >
                      {base.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-black mb-4">Location</h2>
              <div className="space-y-3">
                {base.address && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-map-marker text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.address}</span>
                  </div>
                )}
                {base.state && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-map text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{base.state}, {base.country}</span>
                  </div>
                )}
                {profileData?.employees && (
                  <div className="flex items-center gap-3">
                    <i className="fa fa-users text-[#6A00B1] w-5"></i>
                    <span className="text-gray-700">{profileData.employees} employees</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          {profileData?.social_links && profileData.social_links.length > 0 && (
            <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-black mb-4">Social Links</h2>
              <div className="flex flex-wrap gap-3">
                {profileData.social_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.platform_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-50 text-[#6A00B1] px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    {link.platform_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Government Credentials / Documents */}
          <div className="bg-white rounded-[30px] p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-black mb-4">Government Credentials / Documents</h2>
            <p className="text-gray-600 text-sm mb-4">
              Upload your IDs and documents for verification (e.g., International Passport, Driver's License)
            </p>
            
            {/* Upload Button */}
            <div className="mb-4">
              <label className="inline-flex items-center px-4 py-2 bg-[#6A00B1] text-white rounded-lg cursor-pointer hover:bg-[#5A0091] transition-colors">
                <i className="fa fa-upload mr-2"></i>
                <span>{uploading ? "Uploading..." : "Add Document"}</span>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpeg,.jpg,.jfif,.webp"
                  onChange={handleDocumentUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Documents List */}
            {credentialsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto"></div>
              </div>
            ) : credentials && credentials.length > 0 ? (
              <div className="space-y-3">
                {credentials.map((cred, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <i className="fa fa-file-text text-[#6A00B1] text-xl"></i>
                      <div>
                        <p className="font-medium text-gray-800">{cred.document_name}</p>
                        {cred.document && (
                          <a 
                            href={cred.document} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-[#6A00B1] hover:underline"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    </div>
                    {cred.uploaded_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(cred.uploaded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
            )}
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

export default EnablerProfile;
