import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";
import apiClient, { opportunities, applications, getApiErrorMessage } from "../../services/api";
import { parseDescription } from "../../utils/descriptionUtils";

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";
const textareaCls = inputCls + " resize-none";

const ApplyApplication = () => {
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [formData, setFormData] = useState({ name: "", email: "", aboutMe: "", motivation: "" });
  const [cvFile, setCvFile] = useState(null);
  const [profileCvUrl, setProfileCvUrl] = useState(null);
  const [profileCvName, setProfileCvName] = useState(null);
  const [uploadingProfileCv, setUploadingProfileCv] = useState(false);
  const [customAnswers, setCustomAnswers] = useState({});
  const [customQuestions, setCustomQuestions] = useState([]);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const job = location.state?.job;
    const app = location.state?.existingApplication;
    const editMode = location.state?.isEdit;
    if (app) {
      setExistingApplication(app);
      setIsEditMode(!!editMode);
      const parseCoverLetter = (text) => {
        if (!text || typeof text !== "string") return {};
        const out = {};
        const headings = ["Contact details:", "About me:", "Why I am applying:", "Additional questions and answers:"];
        const normalized = text.replace(/\r\n/g, "\n");
        const indices = {};
        headings.forEach((h) => { const idx = normalized.indexOf(h); if (idx !== -1) indices[h] = idx; });
        const sorted = Object.keys(indices).sort((a, b) => indices[a] - indices[b]);
        const sections = {};
        for (let i = 0; i < sorted.length; i++) {
          const h = sorted[i];
          const start = indices[h] + h.length;
          const end = i + 1 < sorted.length ? indices[sorted[i + 1]] : normalized.length;
          sections[h] = normalized.slice(start, end).trim();
        }
        if (sections["Contact details:"]) {
          sections["Contact details:"].split("\n").forEach((ln) => {
            const mName = ln.match(/^Full name:\s*(.+)$/i);
            const mEmail = ln.match(/^Email:\s*(.+)$/i);
            if (mName) out.name = mName[1].trim();
            if (mEmail) out.email = mEmail[1].trim();
          });
        }
        if (sections["About me:"]) out.aboutMe = sections["About me:"];
        if (sections["Why I am applying:"]) out.motivation = sections["Why I am applying:"];
        if (sections["Additional questions and answers:"]) {
          const qaRegex = /Q:\s*(.+)\nA:\s*([\s\S]*?)(?=\n\nQ:|$)/g;
          const qas = {};
          [...sections["Additional questions and answers:"].matchAll(qaRegex)].forEach((m) => { qas[m[1].trim()] = m[2].trim(); });
          out.qaByText = qas;
        }
        return out;
      };
      const parsed = parseCoverLetter(app.cover_letter || "");
      setFormData((p) => ({ ...p, name: parsed.name || p.name, email: parsed.email || p.email, aboutMe: parsed.aboutMe || p.aboutMe, motivation: parsed.motivation || app.cover_letter || p.motivation }));
    }
    if (job) {
      setOpportunity({ id: job.id, title: job.title, company: job.company, location: job.location });
      const rawDesc = job._raw?.description || job.description || "";
      if (rawDesc) {
        const { customQuestions: qs } = parseDescription(rawDesc);
        setCustomQuestions(Array.isArray(qs) ? qs : []);
      }
    } else if (!job && opportunityId) {
      opportunities.get(opportunityId).then((data) => {
        const { customQuestions: qs } = parseDescription(data.description || "");
        setCustomQuestions(Array.isArray(qs) ? qs : []);
        setOpportunity({ id: data.id, title: data.title, company: data.created_by_name || "Organization", location: "Remote" });
      }).catch(() => {
        setOpportunity({ id: opportunityId, title: "Volunteer Opportunity", company: "Organization", location: "Remote" });
      });
    }
    apiClient.profile.pathfinderGet().then(async (prof) => {
      if (prof) {
        const fullName = [prof.first_name, prof.last_name].filter(Boolean).join(" ");
        if (fullName) setFormData((p) => ({ ...p, name: p.name || fullName }));
        const email = prof.base_details?.contact_email || prof.email;
        if (email) setFormData((p) => ({ ...p, email: p.email || email }));
      }
      try {
        const credList = await apiClient.profile.credentialsList();
        const arr = Array.isArray(credList) ? credList : credList?.results || [];
        const cvCred = arr.find((c) => (c.document_name || c.name || "").toLowerCase().includes("cv"));
        if (cvCred?.document) { setProfileCvUrl(cvCred.document); setProfileCvName(cvCred.document_name || "CV"); }
      } catch {}
    }).catch(() => {});
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId]);

  useEffect(() => { document.title = isEditMode ? "View Application - AfriVate" : "Apply - AfriVate"; }, [isEditMode]);

  useEffect(() => {
    if (!location.state?.isEdit || customQuestions.length === 0) return;
    const job = location.state?.job;
    if (!job) return;
    const rawDesc = job._raw?.description || job.description || "";
    const parsed = parseDescription(rawDesc);
    const parsedQ = parsed.qaByText || {};
    const mapped = {};
    customQuestions.forEach((q) => { if (parsedQ[q.question]) mapped[q.id] = parsedQ[q.question]; });
    if (Object.keys(mapped).length) setCustomAnswers(mapped);
  }, [customQuestions, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const uploadProfileCv = async (file) => {
    if (!file) return;
    setUploadingProfileCv(true);
    try {
      const credList = await apiClient.profile.credentialsList();
      const existing = Array.isArray(credList) ? credList : credList?.results || [];
      for (const cred of existing) {
        if ((cred.document_name || cred.name || "").toLowerCase().includes("cv")) {
          try { await apiClient.profile.credentialsDelete(cred.id); } catch {}
        }
      }
      const fd = new FormData();
      fd.append("document_name", "CV");
      fd.append("document", file);
      await apiClient.profile.credentialsCreate(fd);
      const newList = await apiClient.profile.credentialsList();
      const arr = Array.isArray(newList) ? newList : newList?.results || [];
      const newCv = arr.find((c) => (c.document_name || c.name || "").toLowerCase().includes("cv"));
      if (newCv?.document) { setProfileCvUrl(newCv.document); setProfileCvName(newCv.document_name || "CV"); }
      setCvFile(null);
    } catch (err) {
      console.error("CV upload failed", err);
    } finally {
      setUploadingProfileCv(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cvFile) { try { await uploadProfileCv(cvFile); } catch {} }
    if (!formData.name.trim() || !formData.email.trim()) {
      setToast({ isOpen: true, message: "Please enter your name and email.", type: "error" }); return;
    }
    if (!formData.motivation.trim()) {
      setToast({ isOpen: true, message: "Please explain why you're applying.", type: "error" }); return;
    }
    setSubmitting(true);
    const lines = [];
    if (formData.name.trim() || formData.email.trim()) {
      lines.push("Contact details:");
      if (formData.name.trim()) lines.push(`Full name: ${formData.name.trim()}`);
      if (formData.email.trim()) lines.push(`Email: ${formData.email.trim()}`);
      lines.push("");
    }
    if (formData.aboutMe.trim()) { lines.push("About me:"); lines.push(formData.aboutMe.trim()); lines.push(""); }
    if (formData.motivation.trim()) { lines.push("Why I am applying:"); lines.push(formData.motivation.trim()); lines.push(""); }
    if (customQuestions.length > 0) {
      lines.push("Additional questions and answers:");
      customQuestions.forEach((q) => {
        lines.push(`Q: ${q.question}`);
        lines.push(`A: ${(customAnswers[q.id] || "").trim() || "(no answer provided)"}`);
        lines.push("");
      });
    }
    const coverLetter = lines.join("\n").trim() || formData.motivation || "";
    const applicationData = { opportunity: parseInt(opportunityId), cover_letter: coverLetter };
    try {
      if (existingApplication?.id) {
        await applications.patch(existingApplication.id, applicationData);
        setToast({ isOpen: true, message: "Application updated successfully!", type: "success" });
      } else {
        await applications.create(applicationData);
        setToast({ isOpen: true, message: "Application submitted successfully!", type: "success" });
      }
      setTimeout(() => navigate("/my-applications", { state: { from: location.state?.from || "/dashboard" } }), 1500);
    } catch (error) {
      setToast({ isOpen: true, message: getApiErrorMessage(error) || "Failed to submit application.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

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
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? "View & Edit Application" : "Apply for this opportunity"}
            </h1>
            {opportunity && (
              <p className="text-purple-200 text-sm mt-0.5">
                {opportunity.title} at {opportunity.company}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {/* Your Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5">👤 Your details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Please provide your full name" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="example@domain.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">About You</label>
                <textarea name="aboutMe" value={formData.aboutMe} onChange={handleChange} rows={4}
                  placeholder="Share a brief overview of your professional experience..."
                  className={textareaCls} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">What makes you an ideal candidate?</label>
                <textarea name="motivation" value={formData.motivation} onChange={handleChange} rows={4}
                  placeholder="Explain your motivation for applying to this role..."
                  className={textareaCls} />
              </div>
            </div>
          </div>

          {/* CV / Résumé */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">📄 CV / Résumé</h2>
            {!cvFile && !profileCvUrl ? (
              <label className="block border-2 border-dashed border-purple-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#8D4087] transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 text-2xl">📄</div>
                <p className="font-semibold text-gray-700 mb-1">Upload your file or drag it here</p>
                <p className="text-xs text-gray-400">Accepted formats: PDF, DOCX (max 10MB)</p>
                <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef}
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            ) : (
              <div>
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#8D4087] transition-colors mb-3">
                  <p className="text-xs text-gray-400 mb-1">Upload a different file</p>
                  <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef}
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
                {(cvFile || profileCvUrl) && (
                  <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[#8D4087] text-xl">📋</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {cvFile ? cvFile.name : profileCvName || "CV"}
                        </p>
                        {cvFile && <p className="text-xs text-gray-400">{(cvFile.size / (1024 * 1024)).toFixed(1)} MB</p>}
                      </div>
                    </div>
                    <button type="button" onClick={() => { setCvFile(null); if (!profileCvUrl) setProfileCvUrl(null); }}
                      className="text-gray-400 hover:text-red-500 text-lg">✕</button>
                  </div>
                )}
                {cvFile && (
                  <button type="button" onClick={() => uploadProfileCv(cvFile)} disabled={uploadingProfileCv}
                    className="mt-2 text-[#8D4087] text-xs font-semibold hover:underline disabled:opacity-50">
                    {uploadingProfileCv ? "Uploading..." : "Save as profile CV"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Additional Questions */}
          {customQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5">📝 Additional questions</h2>
              <div className="space-y-4">
                {customQuestions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm text-gray-600 mb-1.5">{q.question}</label>
                    <textarea value={customAnswers[q.id] || ""}
                      onChange={(e) => setCustomAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                      rows={3} placeholder="Your answer..." className={textareaCls} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pb-4">
            <button type="button" onClick={() => navigate(-1)}
              className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#651F5F] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#4a1647] transition-colors disabled:opacity-50">
              {submitting ? "Submitting..." : isEditMode ? "Update application" : "Submit application"}
            </button>
          </div>
        </form>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default ApplyApplication;
