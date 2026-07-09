import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import FormattedText from "../../components/common/FormattedText";
import { opportunities } from "../../services/api";
import { getOrgName } from "../../utils/opportunityUtils";
import { parseDescription } from "../../utils/descriptionUtils";

const statusConfig = (status = "") => {
  const s = status.toLowerCase();
  if (s === "open" || s === "active" || s === "published")
    return { label: "OPEN", cls: "text-green-600" };
  if (s === "closed" || s === "filled")
    return { label: "CLOSED", cls: "text-red-500" };
  return { label: "DRAFT", cls: "text-gray-500" };
};

const OpportunityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalApps, setTotalApps] = useState(0);

  const numericId = useMemo(() => {
    if (!id) return null;
    const match = id.match(/^(\d+)/);
    return match ? match[1] : id;
  }, [id]);

  useEffect(() => { document.title = "Opportunity Details - AfriVate"; }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const saved = JSON.parse(localStorage.getItem("enablerOpportunities") || "[]");
      let found = saved.find((o) => String(o.id) === numericId || String(o.id) === id);
      if (!found && numericId) {
        try {
          const apiData = await opportunities.get(numericId);
          if (apiData?.id) {
            found = {
              id: apiData.id, title: apiData.title || "",
              company: getOrgName(apiData), type: apiData.opportunity_type || "",
              status: apiData.status || apiData.is_open ? "open" : "closed",
              rawDescription: apiData.description || "",
              location: apiData.location || "", workMode: apiData.work_mode || "",
              timeCommitment: apiData.time_commitment || "",
              target: apiData.target_applicants || null,
            };
            setTotalApps(apiData.applications_count || 0);
          }
        } catch (err) {
          console.error("Error fetching opportunity:", err);
        }
      }
      if (found) setOpportunity(found);
      setLoading(false);
    };
    load();
  }, [id, numericId]);

  const parsedDescription = useMemo(() => {
    if (!opportunity?.rawDescription) return parseDescription("");
    return parseDescription(opportunity.rawDescription);
  }, [opportunity?.rawDescription]);

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

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <EnablerNavbar />
        <div className="pt-20 text-center px-4">
          <p className="text-gray-500 mb-4">No opportunity found.</p>
          <button onClick={() => navigate("/enabler/opportunities-posted")}
            className="text-[#8D4087] font-semibold hover:underline">Back to opportunities</button>
        </div>
      </div>
    );
  }

  const { label: statusLabel, cls: statusCls } = statusConfig(opportunity.status);
  const target = opportunity.target || 40;
  const progress = Math.min(100, Math.round((totalApps / target) * 100));

  const reqSections = [
    { key: "EDUCATION", text: parsedDescription.education || "Relevant educational background." },
    { key: "TECHNICAL SKILLS", text: parsedDescription.technicalSkills || "Relevant technical skills." },
    { key: "SOFT SKILLS", text: parsedDescription.softSkills || "Strong communication and collaboration skills." },
    { key: "EXPERIENCE", text: parsedDescription.experience || "Portfolio or relevant experience preferred." },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <EnablerNavbar />

      <div className="pt-16">
        {/* Purple Header */}
        <div style={{ background: "linear-gradient(104.04deg, #8D4087 0%, #651F5F 100%)" }} className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors mb-4">
              ←
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{opportunity.title}</h1>
                <div className="flex items-center gap-2 text-sm text-purple-200">
                  <span>{opportunity.company}</span>
                  {opportunity.type && <><span>•</span><span className="capitalize">{opportunity.type}</span></>}
                  <span>•</span>
                  <span className={`font-bold ${statusCls.replace("text-", "text-")} text-green-300`}>{statusLabel}</span>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => navigate(`/enabler/applicants/${opportunity.id}`)}
                  className="border border-white text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:text-[#651F5F] transition-colors flex items-center gap-2">
                  Applicants
                </button>
                <button onClick={() => navigate(`/enabler/edit-opportunity/${opportunity.id}`)}
                  className="bg-white text-[#651F5F] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#8D4087] flex items-center gap-2 mb-3">Description</h2>
              {parsedDescription.description ? (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <FormattedText text={parsedDescription.description} />
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">No description provided.</p>
              )}
            </div>

            {/* Key Responsibilities */}
            {parsedDescription.keyResponsibilities && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#8D4087] flex items-center gap-2 mb-3">Key Responsibilities</h2>
                <div className="text-sm text-gray-700 space-y-2">
                  {parsedDescription.keyResponsibilities.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8D4087] mt-1.5 shrink-0 inline-block"></span>
                      <p>{line.replace(/^[-•]\s*/, "")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[#8D4087] flex items-center gap-2 mb-4">Requirements</h2>
              {parsedDescription.requirementsBenefits ? (
                <div className="text-sm text-gray-700">
                  <FormattedText text={parsedDescription.requirementsBenefits} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {reqSections.map(({ key, text }) => (
                    <div key={key} className="bg-purple-50/50 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">{key}</p>
                      <p className="text-sm text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About Org */}
            {parsedDescription.aboutCompany && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#8D4087] mb-3">About the Organisation</h2>
                <div className="text-sm text-gray-700">
                  <FormattedText text={parsedDescription.aboutCompany} />
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                {[
                  { icon: null, label: "TYPE", val: opportunity.type || "Internship Opportunity" },
                  { icon: null, label: "LOCATION", val: opportunity.location || parsedDescription.location || "Not specified" },
                  { icon: null, label: "WORK MODE", val: opportunity.workMode || parsedDescription.workMode || "Not specified" },
                  { icon: null, label: "TIME COMMITMENT", val: opportunity.timeCommitment || parsedDescription.timeCommitment || "Not specified" },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-sm shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 my-4" />

              {/* Applications Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800">Total Applications</p>
                  <span className="bg-purple-100 text-[#8D4087] text-xs font-bold px-2.5 py-1 rounded-full">
                    {totalApps} New
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8D4087] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Targeting {target}-{target + 10} applicants</p>
              </div>

              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                Share Opportunity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;
