import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import Toast from "../../components/common/Toast";
import { opportunities } from "../../services/api";
import { combineDescription, parseDescription, createOpportunityLink } from "../../utils/descriptionUtils";

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";
const textareaCls = inputCls + " resize-none";
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

const EditOpportunity = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", keyResponsibilities: "", requirementsBenefits: "",
    aboutCompany: "", applicationInstructions: "", workModel: "Hybrid",
    location: "", timeCommitment: "", opportunityType: "volunteering",
    targetApplicants: "",
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [opportunityFound, setOpportunityFound] = useState(false);

  useEffect(() => {
    document.title = "Edit Opportunity - AfriVate";
    const loadOpportunity = async () => {
      try {
        const data = await opportunities.get(id);
        if (data) {
          setOpportunityFound(true);
          const parsed = parseDescription(data.description || "");
          setFormData({
            title: data.title || "",
            description: parsed.description || "",
            keyResponsibilities: parsed.keyResponsibilities || "",
            requirementsBenefits: parsed.requirementsBenefits || "",
            aboutCompany: parsed.aboutCompany || "",
            applicationInstructions: parsed.applicationInstructions || "",
            workModel: parsed.workModel || "Hybrid",
            location: parsed.location || "",
            timeCommitment: parsed.timeCommitment || "",
            opportunityType: data.opportunity_type || "volunteering",
            targetApplicants: data.target_applicants != null ? String(data.target_applicants) : "",
          });
          try {
            const savedQuestions = sessionStorage.getItem(`opportunity_questions_${id}`);
            if (savedQuestions) setCustomQuestions(JSON.parse(savedQuestions));
          } catch (e) {}
        }
      } catch (err) {
        console.error("Error loading opportunity:", err);
        setOpportunityFound(false);
      } finally {
        setLoading(false);
      }
    };
    loadOpportunity();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomQuestion = () => {
    const q = newQuestion.trim();
    if (q) {
      setCustomQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: q }]);
      setNewQuestion("");
      setShowAddQuestion(false);
    }
  };

  const removeCustomQuestion = (qId) => {
    setCustomQuestions((prev) => prev.filter((x) => x.id !== qId));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setToast({ isOpen: true, message: "Please fill in title and description.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const combinedDesc = combineDescription({
        description: formData.description, keyResponsibilities: formData.keyResponsibilities,
        requirementsBenefits: formData.requirementsBenefits, aboutCompany: formData.aboutCompany,
        applicationInstructions: formData.applicationInstructions, location: formData.location,
        workModel: formData.workModel, timeCommitment: formData.timeCommitment,
        customQuestions: customQuestions,
      });
      const link = createOpportunityLink(formData.title, formData.opportunityType);
      if (!link.startsWith("https://")) throw new Error("Generated opportunity link must use HTTPS. Please contact support.");
      const targetVal = parseInt(formData.targetApplicants, 10);
      await opportunities.update(id, {
        title: formData.title, description: combinedDesc, opportunity_type: formData.opportunityType, link, is_open: true,
        target_applicants: Number.isNaN(targetVal) || targetVal <= 0 ? null : targetVal,
      });
      if (customQuestions.length > 0) sessionStorage.setItem(`opportunity_questions_${id}`, JSON.stringify(customQuestions));
      setToast({ isOpen: true, message: "Opportunity updated successfully!", type: "success" });
      setTimeout(() => navigate(`/enabler/opportunity/${id}`), 1200);
    } catch (err) {
      console.error("Error updating opportunity:", err);
      const body = err?.body;
      let msg = err?.message || "Failed to update opportunity. Please try again.";
      if (body && typeof body === "object") {
        if (typeof body.detail === "string") msg = body.detail;
        else if (Array.isArray(body.detail)) msg = body.detail.join(". ");
        else { const parts = []; for (const [k, v] of Object.entries(body)) { if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`); else if (typeof v === "string") parts.push(`${k}: ${v}`); } if (parts.length) msg = parts.join(". "); }
      }
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#8D4087] border-t-transparent" /></div>
      </div>
    );
  }

  if (!opportunityFound) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 text-center">
          <p className="text-gray-500 mb-4">Opportunity not found.</p>
          <button onClick={() => navigate("/enabler/opportunities-posted")} className="text-[#8D4087] font-semibold hover:underline">Back to opportunities</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(`/enabler/opportunity/${id}`)}
              className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm mb-4 hover:bg-white/30 transition-colors">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Edit Opportunity</h1>
            <p className="text-purple-200 text-sm mt-1">Update the opportunity details below.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">Basic Information</h2>
            <div>
              <label className={labelCls}>Opportunity Type</label>
              <select name="opportunityType" value={formData.opportunityType} onChange={handleInputChange} className={inputCls}>
                <option value="volunteering">Volunteering</option>
                <option value="internship">Internship</option>
                <option value="scholarship">Scholarship</option>
                <option value="job">Job</option>
                <option value="grant">Grant</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Opportunity Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter opportunity title" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter opportunity description" rows={5} className={textareaCls} />
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">Details</h2>
            <div>
              <label className={labelCls}>Key Responsibilities</label>
              <textarea name="keyResponsibilities" value={formData.keyResponsibilities} onChange={handleInputChange} placeholder="Enter key responsibilities" rows={4} className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Requirements & Benefits</label>
              <textarea name="requirementsBenefits" value={formData.requirementsBenefits} onChange={handleInputChange} placeholder="Enter requirements and benefits" rows={4} className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>About the Organization</label>
              <textarea name="aboutCompany" value={formData.aboutCompany} onChange={handleInputChange} placeholder="Tell applicants about your organization" rows={4} className={textareaCls} />
            </div>
            <div>
              <label className={labelCls}>Application Instructions <span className="font-normal text-gray-400">(optional)</span></label>
              <textarea name="applicationInstructions" value={formData.applicationInstructions} onChange={handleInputChange} placeholder="Provide any special instructions for applicants" rows={3} className={textareaCls} />
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">Logistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Work Mode</label>
                <select name="workModel" value={formData.workModel} onChange={handleInputChange} className={inputCls}>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Time Commitment</label>
                <select name="timeCommitment" value={formData.timeCommitment} onChange={handleInputChange} className={inputCls}>
                  <option value="">Select time commitment</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Project-based">Project-based</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Lagos, Nigeria or Remote" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Target Number of Applicants <span className="text-gray-400">(optional)</span></label>
              <input type="number" min="1" name="targetApplicants" value={formData.targetApplicants} onChange={handleInputChange} placeholder="e.g. 40" className={inputCls} />
            </div>
          </div>

          {/* Custom Questions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Custom Application Questions</h2>
            <p className="text-xs text-gray-400 mb-4">Add or remove questions applicants must answer</p>
            <div className="space-y-2 mb-3">
              {customQuestions.map((q, i) => (
                <div key={q.id} className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-700">Q{i + 1}: {q.question}</span>
                  <button onClick={() => removeCustomQuestion(q.id)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                </div>
              ))}
            </div>
            {showAddQuestion ? (
              <div className="border border-dashed border-purple-200 rounded-xl p-4 bg-purple-50/50">
                <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Enter your question for applicants" rows={2} className={textareaCls + " mb-3"} />
                <div className="flex gap-2">
                  <button onClick={addCustomQuestion} disabled={!newQuestion.trim()} className="px-4 py-2 bg-[#8D4087] text-white text-sm rounded-xl font-semibold hover:bg-[#651F5F] disabled:opacity-50">Add</button>
                  <button onClick={() => { setShowAddQuestion(false); setNewQuestion(""); }} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddQuestion(true)} className="text-[#8D4087] font-semibold text-sm hover:underline">+ Add question</button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            <button onClick={() => navigate(`/enabler/opportunity/${id}`)}
              className="flex-1 border border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#651F5F] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#4a1647] transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type} onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default EditOpportunity;
