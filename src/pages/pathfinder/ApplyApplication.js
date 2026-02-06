import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import NavBar from "../../components/auth/Navbar";
import Toast from "../../components/common/Toast";

const STORAGE_APPLICATIONS = "pathfinderApplications";
const STORAGE_CUSTOM_QUESTIONS = "opportunityCustomQuestions";

function getCustomQuestions(opportunityId) {
  try {
    const q = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_QUESTIONS) || "{}");
    return Array.isArray(q[opportunityId]) ? q[opportunityId] : [];
  } catch (_) {
    return [];
  }
}

const ApplyApplication = () => {
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const location = useLocation();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    aboutMe: "",
    motivation: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [customAnswers, setCustomAnswers] = useState({});

  const customQuestions = opportunityId ? getCustomQuestions(opportunityId) : [];

  useEffect(() => {
    document.title = "Apply - AfriVate";
    const job = location.state?.job;
    if (job) {
      setOpportunity({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
      });
    } else {
      try {
        const opps = JSON.parse(localStorage.getItem("enablerOpportunities") || "[]");
        const fromApi = JSON.parse(localStorage.getItem("opportunityListCache") || "[]");
        const found =
          opps.find((o) => String(o.id) === String(opportunityId)) ||
          fromApi.find((o) => String(o.id) === String(opportunityId));
        if (found) {
          setOpportunity({
            id: found.id,
            title: found.title,
            company: found.company || "Remote",
            location: found.location || "Remote",
          });
        } else {
          setOpportunity({
            id: opportunityId,
            title: "Volunteer Opportunity",
            company: "Organization",
            location: "Remote",
          });
        }
      } catch (_) {
        setOpportunity({
          id: opportunityId,
          title: "Volunteer Opportunity",
          company: "Organization",
          location: "Remote",
        });
      }
    }
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      if (profile.displayName) setFormData((p) => ({ ...p, name: profile.displayName }));
      if (profile.email) setFormData((p) => ({ ...p, email: profile.email }));
    } catch (_) {}
    setLoading(false);
  }, [opportunityId, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomAnswer = (questionId, value) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setCvFile(file || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setToast({ isOpen: true, message: "Please enter your name and email.", type: "error" });
      return;
    }
    if (!formData.motivation.trim()) {
      setToast({ isOpen: true, message: "Please explain why you're applying.", type: "error" });
      return;
    }
    let cvFileName = "";
    let cvData = "";
    if (cvFile) {
      cvFileName = cvFile.name;
      const reader = new FileReader();
      reader.onload = () => {
        saveApplication(cvFileName, reader.result || "");
      };
      reader.readAsDataURL(cvFile);
    } else {
      saveApplication(cvFileName, cvData);
    }
  };

  const saveApplication = (cvFileName, cvData) => {
    const applications = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS) || "[]");
    const customAnswersList = customQuestions.map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: customAnswers[q.id] || "",
    }));
    const application = {
      id: `app-${Date.now()}`,
      opportunityId: String(opportunityId),
      opportunityTitle: opportunity?.title || "Opportunity",
      pathfinderName: formData.name.trim(),
      pathfinderEmail: formData.email.trim(),
      aboutMe: formData.aboutMe.trim(),
      motivation: formData.motivation.trim(),
      cvFileName,
      cvData,
      customAnswers: customAnswersList,
      appliedAt: new Date().toISOString(),
    };
    applications.push(application);
    localStorage.setItem(STORAGE_APPLICATIONS, JSON.stringify(applications));
    setToast({ isOpen: true, message: "Application submitted successfully!", type: "success" });
    setTimeout(() => navigate("/opportunity"), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <NavBar />
        <div className="pt-20 px-4 py-12 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar />
      <div className="pt-20 px-4 md:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Apply for this Opportunity</h1>
          <p className="text-gray-600 mb-6">
            {opportunity?.title} at {opportunity?.company}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">About yourself</label>
              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                placeholder="Brief introduction, skills, experience..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">Why are you applying? *</label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                required
                placeholder="Explain your interest and how you can contribute..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2">Upload CV / Resume</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#6A00B1] file:text-white file:font-semibold hover:file:bg-[#5A0091]"
              />
              {cvFile && <p className="mt-2 text-sm text-gray-500">{cvFile.name}</p>}
            </div>

            {customQuestions.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-black mb-4">Additional Questions</h3>
                {customQuestions.map((q) => (
                  <div key={q.id} className="mb-4">
                    <label className="block text-sm font-bold text-black mb-2">{q.question}</label>
                    <textarea
                      value={customAnswers[q.id] || ""}
                      onChange={(e) => handleCustomAnswer(q.id, e.target.value)}
                      placeholder="Your answer..."
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6A00B1] resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border-2 border-[#6A00B1] text-[#6A00B1] px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#6A00B1] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5A0091] transition-colors"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
};

export default ApplyApplication;
