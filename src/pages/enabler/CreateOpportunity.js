import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
// import { useUser } from "../../context/UserContext";
import Toast from "../../components/common/Toast";
import { opportunities } from "../../services/api";
import { combineDescription, createOpportunityLink } from "../../utils/descriptionUtils";

const STEPS = [
  { num: 1, label: "Basics", sub: "General info" },
  { num: 2, label: "Details", sub: "Scope & skills" },
  { num: 3, label: "Logistics", sub: "Dates & location" },
  { num: 4, label: "Review", sub: "Final summary" },
];

const OPP_TYPES = ["volunteering","internship","mentorship","fellowship","contract","full-time","part-time"];
const WORK_MODES = ["Remote","On-site","Hybrid"];
const TIME_COMMITMENTS = ["Part-time (20h / week)","Full-time (40h / week)","Flexible","Weekends only","Evenings only"];

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D4087] bg-white";
const textareaCls = inputCls + " resize-none";

const TipBox = ({ text }) => (
  <div className="bg-purple-50 border-l-4 border-[#8D4087] rounded-r-xl p-4 mb-5 flex items-start gap-2">
    <span className="text-[#8D4087] mt-0.5">💡</span>
    <p className="text-sm text-purple-900">{text}</p>
  </div>
);

const CreateOpportunity = () => {
  const navigate = useNavigate();
  // const { user } = useUser();

  useEffect(() => { document.title = "Create Opportunity - AfriVate"; }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [posted, setPosted] = useState(false);
  const [publishOpen, setPublishOpen] = useState(true);
  const [formData, setFormData] = useState({
    title: "", description: "", keyResponsibilities: "", requirementsBenefits: "",
    aboutCompany: "", applicationInstructions: "", workModel: "Hybrid", location: "",
    timeCommitment: "", opportunityType: "volunteering",
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [posting, setPosting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomQuestion = () => {
    if (newQuestion.trim()) {
      setCustomQuestions((prev) => [...prev, { id: `q-${Date.now()}`, question: newQuestion.trim() }]);
      setNewQuestion(""); setShowAddQuestion(false);
    }
  };

  const removeCustomQuestion = (id) => setCustomQuestions((prev) => prev.filter((x) => x.id !== id));

  const handlePost = async () => {
    setPosting(true);
    try {
      const combinedDesc = combineDescription({
        description: formData.description, keyResponsibilities: formData.keyResponsibilities,
        requirementsBenefits: formData.requirementsBenefits, aboutCompany: formData.aboutCompany,
        applicationInstructions: formData.applicationInstructions, location: formData.location,
        workModel: formData.workModel, timeCommitment: formData.timeCommitment, customQuestions,
      });
      const link = createOpportunityLink(formData.title, formData.opportunityType);
      if (!link.startsWith("https://")) throw new Error("Generated opportunity link must use HTTPS.");
      await opportunities.create({
        title: formData.title.trim(), description: combinedDesc,
        opportunity_type: formData.opportunityType || "volunteering",
        link, is_open: publishOpen,
      });
      setPosted(true);
    } catch (err) {
      const body = err?.body;
      let msg = err?.message || "Failed to post opportunity. Please try again.";
      if (body && typeof body === "object") {
        if (typeof body.detail === "string") msg = body.detail;
        else if (Array.isArray(body.detail)) msg = body.detail.join(". ");
        else {
          const parts = Object.entries(body).map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join(", ")}` : typeof v === "string" ? `${k}: ${v}` : "").filter(Boolean);
          if (parts.length) msg = parts.join(". ");
        }
      }
      setToast({ isOpen: true, message: msg, type: "error" });
    } finally {
      setPosting(false);
    }
  };

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (posted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans">
        <EnablerNavbar />
        <div className="pt-16 max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Opportunity posted!</h1>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Your opportunity is now live and visible to Pathfinders. You will receive notifications as soon as candidates begin applying or expressing interest.
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <button onClick={() => navigate("/enabler/opportunities-posted")}
                className="border border-[#8D4087] text-[#8D4087] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2">
                View my opportunities →
              </button>
              <button onClick={() => navigate("/enabler/dashboard")}
                className="bg-[#8D4087] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#651F5F] transition-colors">
                Back to Dashboard
              </button>
            </div>
            <hr className="border-gray-100 mb-6" />
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">SHARE THIS OPPORTUNITY</p>
            <div className="flex items-center justify-center gap-3">
              {["🔗","✉️","📤"].map((icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 text-xl">📣</div>
              <h3 className="font-bold text-gray-900 mb-1">Boost Visibility</h3>
              <p className="text-sm text-gray-500">Promote this posting to reach 5x more qualified Pathfinders in your region.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-xl">➕</div>
              <h3 className="font-bold text-gray-900 mb-1">Post Another</h3>
              <p className="text-sm text-gray-500">Ready to scale? Create another opportunity using your saved templates.</p>
              <button onClick={() => { setPosted(false); setCurrentStep(1); setFormData({ title:"",description:"",keyResponsibilities:"",requirementsBenefits:"",aboutCompany:"",applicationInstructions:"",workModel:"Hybrid",location:"",timeCommitment:"",opportunityType:"volunteering" }); setCustomQuestions([]); }}
                className="mt-3 text-[#8D4087] text-sm font-semibold hover:underline">Post now →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="w-60 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 self-start">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">PROGRESS</p>
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const active = currentStep === step.num;
          const done = currentStep > step.num;
          return (
            <div key={step.num} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => done && setCurrentStep(step.num)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    active ? "bg-[#8D4087] text-white" : done ? "bg-purple-100 text-[#8D4087]" : "bg-gray-100 text-gray-400"
                  }`}>
                  {done ? "✓" : step.num === 1 ? "📄" : step.num === 2 ? "📋" : step.num === 3 ? "🕐" : "✅"}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 mt-1 ${done ? "bg-[#8D4087]" : "bg-gray-200"}`} />
                )}
              </div>
              <div className="pt-1">
                <p className={`text-sm font-semibold ${active ? "text-[#8D4087]" : done ? "text-gray-700" : "text-gray-400"}`}>{step.label}</p>
                <p className="text-xs text-gray-400">{step.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 bg-purple-50 rounded-xl p-3">
        <p className="text-xs text-purple-700 italic">"Tip: Opportunities with detailed descriptions get 40% more applications from qualified Pathfinders."</p>
      </div>
    </div>
  );

  const StepHeader = ({ title, subtitle, part }) => (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-xl font-bold text-[#8D4087]">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <span className="bg-purple-100 text-[#8D4087] text-xs font-semibold px-3 py-1 rounded-full">{part}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />
      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-8 py-8 flex items-center gap-4">
          <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Post an opportunity</h1>
            <p className="text-purple-200 text-sm mt-1">Connect with talented Pathfinders ready to contribute.</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-5xl mx-auto px-4 py-8 flex gap-6 items-start">
          <Sidebar />

          <div className="flex-1">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <StepHeader title="Step 1: Basics" subtitle="Start with the fundamental identity of your opportunity." part="Part 1 of 4" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Opportunity Type</label>
                    <div className="relative">
                      <select name="opportunityType" value={formData.opportunityType} onChange={handleInputChange}
                        className={inputCls + " appearance-none pr-8 capitalize"}>
                        {OPP_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange}
                      placeholder="e.g. Senior Product Designer for FinTech" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={8}
                    placeholder="Clearly describe the role, impact, and who you are looking for..."
                    className={textareaCls} />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">Recommended: 200 - 500 words.</p>
                    <p className="text-xs text-gray-400">{formData.description.split(/\s+/).filter(Boolean).length} / 500</p>
                  </div>
                </div>
                <hr className="border-gray-100 my-5" />
                <div className="flex items-center justify-end gap-4">
                  <button onClick={() => setToast({ isOpen: true, message: "Draft saved!", type: "success" })}
                    className="text-sm text-gray-500 font-semibold hover:text-gray-700">Save as Draft</button>
                  <button onClick={() => setCurrentStep(2)} disabled={!formData.title.trim() || !formData.description.trim()}
                    className="bg-[#8D4087] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#651F5F] transition-colors disabled:opacity-40 flex items-center gap-2">
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <StepHeader title="Step 2: Details" subtitle="Define the scope, skills required, and role expectations." part="Part 2 of 4" />
                <TipBox text="Tip: Be specific about skills needed — Pathfinders self-select when the requirements are clear, saving you screening time." />
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-gray-600">Key Responsibilities</label>
                      <span className="text-xs text-gray-400">Required</span>
                    </div>
                    <textarea name="keyResponsibilities" value={formData.keyResponsibilities} onChange={handleInputChange} rows={4}
                      placeholder={"e.g., - Lead the design of a new administrative portal\n- Facilitate weekly stakeholder feedback sessions\n- Mentor junior designers in the team"}
                      className={textareaCls} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-gray-600">Requirements &amp; Benefits</label>
                      <span className="text-xs text-gray-400">Required</span>
                    </div>
                    <textarea name="requirementsBenefits" value={formData.requirementsBenefits} onChange={handleInputChange} rows={4}
                      placeholder="What background is needed? What will the Pathfinder gain?"
                      className={textareaCls} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">About Your Organisation</label>
                    <textarea name="aboutCompany" value={formData.aboutCompany} onChange={handleInputChange} rows={3}
                      placeholder="Briefly describe your mission and team culture..."
                      className={textareaCls} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-gray-600">Application Instructions (optional)</label>
                      <span className="text-xs text-gray-400">Optional</span>
                    </div>
                    <textarea name="applicationInstructions" value={formData.applicationInstructions} onChange={handleInputChange} rows={3}
                      placeholder="Should applicants include a portfolio or a specific cover letter?"
                      className={textareaCls} />
                  </div>
                </div>
                <hr className="border-gray-100 my-5" />
                <div className="flex items-center justify-between">
                  <button onClick={() => setCurrentStep(1)}
                    className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
                    ← Back
                  </button>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setToast({ isOpen: true, message: "Draft saved!", type: "success" })}
                      className="text-sm text-gray-500 font-semibold hover:text-gray-700">Save as Draft</button>
                    <button onClick={() => setCurrentStep(3)}
                      className="bg-[#8D4087] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#651F5F] transition-colors flex items-center gap-2">
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Logistics */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <StepHeader title="Step 3: Logistics" subtitle="Set the location, schedule, and custom screening questions." part="Part 3 of 4" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Work Mode</label>
                    <div className="relative">
                      <select name="workModel" value={formData.workModel} onChange={handleInputChange}
                        className={inputCls + " appearance-none pr-8"}>
                        <option value="">Select mode</option>
                        {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">Time Commitment</label>
                    <div className="relative">
                      <select name="timeCommitment" value={formData.timeCommitment} onChange={handleInputChange}
                        className={inputCls + " appearance-none pr-8"}>
                        <option value="">Select commitment</option>
                        {TIME_COMMITMENTS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                    </div>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm text-gray-600 mb-1.5">Location</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                    <input name="location" value={formData.location} onChange={handleInputChange}
                      placeholder="Enter city, region, or 'Remote'" className={inputCls + " pl-9"} />
                  </div>
                </div>

                {/* Custom Questions */}
                <div className="mb-5">
                  <label className="block text-sm text-gray-600 mb-2">Custom Application Questions (optional)</label>
                  {customQuestions.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {customQuestions.map((q) => (
                        <div key={q.id} className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
                          <p className="text-sm text-gray-700">{q.question}</p>
                          <button onClick={() => removeCustomQuestion(q.id)} className="text-gray-400 hover:text-red-500 ml-3">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {showAddQuestion ? (
                    <div className="flex gap-2">
                      <input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Type your question..." className={inputCls + " flex-1"} autoFocus
                        onKeyDown={(e) => e.key === "Enter" && addCustomQuestion()} />
                      <button onClick={addCustomQuestion} className="bg-[#8D4087] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#651F5F]">Add</button>
                      <button onClick={() => { setShowAddQuestion(false); setNewQuestion(""); }} className="border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddQuestion(true)} disabled={customQuestions.length >= 5}
                      className={`w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-colors ${customQuestions.length < 5 ? "border-purple-200 hover:border-[#8D4087] cursor-pointer" : "border-gray-200 cursor-not-allowed opacity-50"}`}>
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#8D4087] text-xl font-bold">+</div>
                      <p className="text-sm font-semibold text-[#8D4087]">Add your first question</p>
                      <p className="text-xs text-gray-400">Ask up to 5 custom questions to screen candidates.</p>
                    </button>
                  )}
                </div>

                <TipBox text="Tip: Adding custom questions helps you identify the most motivated Pathfinders before you even read a full application." />

                <hr className="border-gray-100 my-5" />
                <div className="flex items-center justify-between">
                  <button onClick={() => setCurrentStep(2)}
                    className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
                    ← Back
                  </button>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setToast({ isOpen: true, message: "Draft saved!", type: "success" })}
                      className="text-sm text-gray-500 font-semibold hover:text-gray-700">Save as Draft</button>
                    <button onClick={() => setCurrentStep(4)} disabled={!formData.location.trim() || !formData.timeCommitment.trim()}
                      className="bg-[#8D4087] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#651F5F] transition-colors disabled:opacity-40 flex items-center gap-2">
                      Preview &amp; review →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <StepHeader title="Step 4: Review" subtitle="Check everything looks good before publishing." part="Part 4 of 4" />

                {/* Summary Header */}
                <div className="grid grid-cols-4 gap-3 mb-5 pb-5 border-b border-gray-100">
                  {[
                    { label: "TYPE", val: formData.opportunityType },
                    { label: "WORK MODE", val: formData.workModel || "—" },
                    { label: "LOCATION", val: formData.location || "—" },
                    { label: "COMMITMENT", val: formData.timeCommitment || "—" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-[#8D4087] capitalize">{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Editable sections */}
                {[
                  { key: "OPPORTUNITY TITLE", val: formData.title, step: 1 },
                  { key: "DESCRIPTION", val: formData.description, step: 1 },
                  { key: "KEY REQUIREMENTS", val: formData.keyResponsibilities, step: 2 },
                ].map(({ key, val, step }) => (
                  <div key={key} className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400 font-semibold uppercase">{key}</p>
                      <button onClick={() => setCurrentStep(step)}
                        className="text-xs text-[#8D4087] font-semibold hover:underline flex items-center gap-1">
                        ✏️ Edit
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{val || <span className="text-gray-400 italic">Not provided</span>}</p>
                  </div>
                ))}

                {/* Publishing Status */}
                <div className="bg-purple-50 rounded-xl p-4 flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm font-bold text-[#8D4087]">Publishing Status</p>
                    <p className="text-xs text-gray-500">Set the opportunity visibility immediately after posting.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#8D4087]">
                      {publishOpen ? "Open for applications" : "Draft (hidden)"}
                    </span>
                    <button onClick={() => setPublishOpen(!publishOpen)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${publishOpen ? "bg-[#8D4087]" : "bg-gray-300"}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${publishOpen ? "translate-x-7" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setCurrentStep(3)}
                    className="border border-gray-200 text-gray-600 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
                    ← Edit details
                  </button>
                  <button onClick={handlePost} disabled={posting}
                    className="bg-[#651F5F] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#4a1647] transition-colors disabled:opacity-50 flex items-center gap-2">
                    {posting ? "Posting..." : "Confirm & post ▶"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast isOpen={toast.isOpen} message={toast.message} type={toast.type}
        onClose={() => setToast({ isOpen: false, message: "", type: "success" })} />
    </div>
  );
};

export default CreateOpportunity;
