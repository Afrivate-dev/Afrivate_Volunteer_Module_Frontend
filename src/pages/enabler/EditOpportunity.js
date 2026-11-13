import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  HelpCircle,
} from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { opportunities } from "../../services/api";
import {
  combineDescription,
  parseDescription,
  createOpportunityLink,
} from "../../utils/descriptionUtils";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition shadow-2xs";
const textareaCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition resize-none shadow-2xs";
const selectCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition appearance-none cursor-pointer pr-10 shadow-2xs";
const labelCls = "block text-xs font-semibold text-gray-700 mb-1.5";

export default function EditOpportunity() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keyResponsibilities: "",
    requirementsBenefits: "",
    aboutCompany: "",
    applicationInstructions: "",
    workModel: "Hybrid",
    location: "",
    timeCommitment: "",
    opportunityType: "volunteering",
    targetApplicants: "",
  });

  const [customQuestions, setCustomQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
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
            targetApplicants:
              data.target_applicants != null ? String(data.target_applicants) : "",
          });

          try {
            const savedQuestions = sessionStorage.getItem(`opportunity_questions_${id}`);
            if (savedQuestions) setCustomQuestions(JSON.parse(savedQuestions));
          } catch (e) {
            console.warn("Could not parse saved questions", e);
          }
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
      setErrorMessage("Please enter both the opportunity title and description.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const combinedDesc = combineDescription({
        description: formData.description,
        keyResponsibilities: formData.keyResponsibilities,
        requirementsBenefits: formData.requirementsBenefits,
        aboutCompany: formData.aboutCompany,
        applicationInstructions: formData.applicationInstructions,
        location: formData.location,
        workModel: formData.workModel,
        timeCommitment: formData.timeCommitment,
        customQuestions: customQuestions,
      });

      const link = createOpportunityLink(formData.title, formData.opportunityType);
      if (!link.startsWith("https://")) {
        throw new Error(
          "Generated opportunity link must use HTTPS. Please contact support."
        );
      }

      const targetVal = parseInt(formData.targetApplicants, 10);
      await opportunities.update(id, {
        title: formData.title,
        description: combinedDesc,
        opportunity_type: formData.opportunityType,
        link,
        is_open: true,
        target_applicants: Number.isNaN(targetVal) || targetVal <= 0 ? null : targetVal,
      });

      if (customQuestions.length > 0) {
        sessionStorage.setItem(
          `opportunity_questions_${id}`,
          JSON.stringify(customQuestions)
        );
      }

      setToastMessage("Opportunity details updated successfully!");
      setTimeout(() => {
        navigate(`/enabler/opportunity/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Error updating opportunity:", err);
      const body = err?.body;
      let msg = err?.message || "Failed to update opportunity. Please try again.";
      if (body && typeof body === "object") {
        if (typeof body.detail === "string") msg = body.detail;
        else if (Array.isArray(body.detail)) msg = body.detail.join(". ");
        else {
          const parts = [];
          for (const [k, v] of Object.entries(body)) {
            if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
            else if (typeof v === "string") parts.push(`${k}: ${v}`);
          }
          if (parts.length) msg = parts.join(". ");
        }
      }
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OrganizationLayout activeItem="Volunteer Engagements">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER & BACK LINK
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-gray-500 block mb-2">
          Volunteer Engagements / Edit Details
        </span>

        <button
          onClick={() => navigate(`/enabler/opportunity/${id}`)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#843A7F] hover:text-[#6a2b66] transition-colors group mb-3"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back to engagement details</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Edit Opportunity
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Update the opportunity details, responsibilities, and application criteria below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/enabler/opportunity/${id}`)}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#843A7F] hover:bg-[#6e2e6a] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? "Saving changes..." : "Save changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#843A7F] border-t-transparent" />
        </div>
      ) : !opportunityFound ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto">
          <p className="text-gray-500 text-sm mb-4">Opportunity could not be found.</p>
          <button
            onClick={() => navigate("/enabler/opportunities-posted")}
            className="bg-[#843A7F] text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:bg-[#6e2e6a] transition"
          >
            Back to volunteer engagements
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {/* ══════════════════════════════════════════════════════
              CARD 1: BASIC INFORMATION
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Basic Information
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Core title, type, and description of the volunteer engagement
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Opportunity Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="opportunityType"
                    value={formData.opportunityType}
                    onChange={handleInputChange}
                    className={selectCls}
                  >
                    <option value="volunteering">Volunteering</option>
                    <option value="internship">Internship</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="job">Job</option>
                    <option value="grant">Grant</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Opportunity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Content Creator"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the opportunity and purpose..."
                rows={5}
                className={textareaCls}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 2: ENGAGEMENT DETAILS & EXPECTATIONS
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Details & Responsibilities
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Outline expectations, key contributions, and what volunteers gain
              </p>
            </div>

            <div>
              <label className={labelCls}>Key Responsibilities</label>
              <textarea
                name="keyResponsibilities"
                value={formData.keyResponsibilities}
                onChange={handleInputChange}
                placeholder="• Make short videos a few times a month&#10;• Work directly with the team on scripts&#10;• Experiment with formats and storytelling"
                rows={4}
                className={textareaCls}
              />
            </div>

            <div>
              <label className={labelCls}>Requirements & Benefits</label>
              <textarea
                name="requirementsBenefits"
                value={formData.requirementsBenefits}
                onChange={handleInputChange}
                placeholder="List skills desired, certificate issuance, mentorship, or stipends..."
                rows={4}
                className={textareaCls}
              />
            </div>

            <div>
              <label className={labelCls}>About the Organization</label>
              <textarea
                name="aboutCompany"
                value={formData.aboutCompany}
                onChange={handleInputChange}
                placeholder="Share your mission and background with applicants..."
                rows={3}
                className={textareaCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Application Instructions{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                name="applicationInstructions"
                value={formData.applicationInstructions}
                onChange={handleInputChange}
                placeholder="Provide special instructions or portfolio requirements..."
                rows={3}
                className={textareaCls}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 3: LOGISTICS & APPLICANTS
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Logistics & Placement
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Work modality, expected commitment, and physical or remote location
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Work Mode</label>
                <div className="relative">
                  <select
                    name="workModel"
                    value={formData.workModel}
                    onChange={handleInputChange}
                    className={selectCls}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Time Commitment</label>
                <div className="relative">
                  <select
                    name="timeCommitment"
                    value={formData.timeCommitment}
                    onChange={handleInputChange}
                    className={selectCls}
                  >
                    <option value="">Select time commitment</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Flexible">Flexible</option>
                    <option value="Project-based">Project-based</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Asaba, Nigeria or Remote"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Target Number of Applicants{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  name="targetApplicants"
                  value={formData.targetApplicants}
                  onChange={handleInputChange}
                  placeholder="e.g. 20"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 4: CUSTOM APPLICATION QUESTIONS
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  Custom Application Questions
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Screening questions applicants must answer when applying
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-[#843A7F] rounded-full border border-purple-100">
                {customQuestions.length} added
              </span>
            </div>

            <div className="space-y-2.5 mb-4">
              {customQuestions.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center bg-gray-50/50">
                  <p className="text-xs text-gray-500">
                    No custom questions added yet. You can add specific questions for applicants to answer.
                  </p>
                </div>
              ) : (
                customQuestions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between bg-purple-50/70 border border-purple-100 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <HelpCircle size={16} className="text-[#843A7F] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-[#843A7F] uppercase tracking-wide block">
                          Question {i + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-gray-800">
                          {q.question}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomQuestion(q.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors shrink-0"
                      title="Remove question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {showAddQuestion ? (
              <div className="border border-purple-200 rounded-2xl p-4 bg-purple-50/40 animate-in fade-in duration-150">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter your custom question for applicants..."
                  rows={2}
                  className={textareaCls + " mb-3 bg-white"}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={addCustomQuestion}
                    disabled={!newQuestion.trim()}
                    className="px-4 py-2 bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                  >
                    Add question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddQuestion(false);
                      setNewQuestion("");
                    }}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddQuestion(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#843A7F] hover:text-[#6e2e6a] transition"
              >
                <Plus size={15} />
                <span>Add custom question</span>
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
              BOTTOM ACTION BAR
          ══════════════════════════════════════════════════════ */}
          <div className="pt-2 pb-8 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/enabler/opportunity/${id}`)}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-[#843A7F] hover:bg-[#6e2e6a] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? "Saving changes..." : "Save changes"}</span>
            </button>
          </div>
        </div>
      )}
    </OrganizationLayout>
  );
}
