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
  const [errors, setErrors] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [selectedCredId, setSelectedCredId] = useState(null);
  const [savingToProfile, setSavingToProfile] = useState(false);
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
        // Prefill About You from the profile so applicants don't retype it —
        // they can still tailor it to this specific role.
        const about = prof.about || prof.base_details?.bio;
        if (about) setFormData((p) => ({ ...p, aboutMe: p.aboutMe || about }));
      }
      try {
        const credList = await apiClient.profile.credentialsList();
        const arr = Array.isArray(credList) ? credList : credList?.results || [];
        setCredentials(arr);
        // Pre-select the document that looks like a CV/résumé, if any.
        const cvCred = arr.find((c) => /(cv|resume|résumé|curriculum)/i.test(c.document_name || c.name || ""));
        if (cvCred) setSelectedCredId(cvCred.id);
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
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // Optionally save the freshly picked file into the profile's documents so
  // it can be reused for future applications. Non-destructive: existing
  // documents are left alone.
  const saveFileToProfile = async (file) => {
    if (!file) return;
    setSavingToProfile(true);
    try {
      const fd = new FormData();
      fd.append("document_name", file.name.replace(/\.[^/.]+$/, "") || "CV");
      fd.append("document", file);
      await apiClient.profile.credentialsCreate(fd);
      const newList = await apiClient.profile.credentialsList();
      const arr = Array.isArray(newList) ? newList : newList?.results || [];
      setCredentials(arr);
      setToast({ isOpen: true, message: "Saved to your profile documents.", type: "success" });
    } catch (err) {
      setToast({ isOpen: true, message: "Could not save to profile.", type: "error" });
    } finally {
      setSavingToProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Field-level validation — highlight the exact field and scroll to it.
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your full name.";
    if (!formData.email.trim()) newErrors.email = "Please enter your email address.";
    if (!formData.motivation.trim()) newErrors.motivation = "Please fill this in — explain why you're applying.";
    setErrors(newErrors);
    const firstError = ["name", "email", "motivation"].find((k) => newErrors[k]);
    if (firstError) {
      document.getElementById(`apply-field-${firstError}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
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
    // Attach the resume: a newly picked file goes up as multipart; a selected
    // profile document is linked by its credential id (profile_resume).
    let applicationData;
    if (cvFile) {
      const fd = new FormData();
      fd.append("opportunity", String(parseInt(opportunityId)));
      fd.append("cover_letter", coverLetter);
      fd.append("resume", cvFile);
      applicationData = fd;
    } else {
      applicationData = { opportunity: parseInt(opportunityId), cover_letter: coverLetter };
      if (selectedCredId != null) applicationData.profile_resume = selectedCredId;
    }
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
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8 flex items-center gap-4">
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
            <h2 className="font-bold text-gray-900 mb-5">Your details</h2>
            <div className="space-y-4">
              <div id="apply-field-name">
                <label className="block text-sm text-gray-600 mb-1.5">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="Please provide your full name"
                  className={inputCls + (errors.name ? " border-red-400 ring-1 ring-red-300" : "")} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div id="apply-field-email">
                <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="example@domain.com"
                  className={inputCls + (errors.email ? " border-red-400 ring-1 ring-red-300" : "")} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-0.5">About You</label>
                <p className="text-xs text-gray-400 mb-1.5">Prefilled from your profile — feel free to tailor it to this role.</p>
                <textarea name="aboutMe" value={formData.aboutMe} onChange={handleChange} rows={4}
                  placeholder="Share a brief overview of your professional experience..."
                  className={textareaCls} />
              </div>
              <div id="apply-field-motivation">
                <label className="block text-sm text-gray-600 mb-0.5">What makes you an ideal candidate? <span className="text-red-400">*</span></label>
                <p className="text-xs text-gray-400 mb-1.5">Specific to this opportunity — tell them why you're a great fit.</p>
                <textarea name="motivation" value={formData.motivation} onChange={handleChange} rows={4}
                  placeholder="Explain your motivation for applying to this role..."
                  className={textareaCls + (errors.motivation ? " border-red-400 ring-1 ring-red-300" : "")} />
                {errors.motivation && <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>}
              </div>
            </div>
          </div>

          {/* CV / Résumé */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">CV / Résumé</h2>

            {/* Documents already on the profile — pick one to attach */}
            {credentials.length > 0 && !cvFile && (
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-400">Attach a document from your profile:</p>
                {credentials.map((cred) => (
                  <label key={cred.id}
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                      selectedCredId === cred.id ? "border-[#8D4087] bg-purple-50" : "border-gray-200 hover:border-purple-200"
                    }`}>
                    <input type="radio" name="profileCred" checked={selectedCredId === cred.id}
                      onChange={() => setSelectedCredId(cred.id)} className="accent-[#8D4087] shrink-0" />
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="text-sm font-semibold text-gray-800 truncate">{cred.document_name || "Document"}</span>
                  </label>
                ))}
                {selectedCredId != null && (
                  <button type="button" onClick={() => setSelectedCredId(null)}
                    className="text-xs text-gray-400 hover:text-gray-600">Clear selection</button>
                )}
              </div>
            )}

            {cvFile ? (
              <div>
                <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="1.5"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M4 6h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{cvFile.name}</p>
                      <p className="text-xs text-gray-400">{(cvFile.size / (1024 * 1024)).toFixed(1)} MB — will be attached to this application</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setCvFile(null)}
                    className="text-gray-400 hover:text-red-500 text-lg shrink-0">✕</button>
                </div>
                <button type="button" onClick={() => saveFileToProfile(cvFile)} disabled={savingToProfile}
                  className="mt-2 text-[#8D4087] text-xs font-semibold hover:underline disabled:opacity-50">
                  {savingToProfile ? "Saving..." : "Also save to my profile documents"}
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-purple-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#8D4087] transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8D4087" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                <p className="font-semibold text-gray-700 mb-1">
                  {credentials.length > 0 ? "Or upload a new file" : "Upload your file or drag it here"}
                </p>
                <p className="text-xs text-gray-400">Accepted formats: PDF, DOCX (max 10MB)</p>
                <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef}
                  onChange={(e) => { const f = e.target.files?.[0] || null; setCvFile(f); if (f) setSelectedCredId(null); }} className="hidden" />
              </label>
            )}
          </div>

          {/* Additional Questions */}
          {customQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5">Additional questions</h2>
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
