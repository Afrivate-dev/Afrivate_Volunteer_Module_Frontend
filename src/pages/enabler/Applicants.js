import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnablerNavbar from "../../components/auth/EnablerNavbar";
import { pathfinderDataById } from "../../utils/pathfinderData";

const STORAGE_APPLICATIONS = "pathfinderApplications";

const Applicants = () => {
  const navigate = useNavigate();
  const { id: opportunityId } = useParams();
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [applications, setApplications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    document.title = "Applicants - AfriVate";
    const apps = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS) || "[]");
    const forOpp = apps.filter(
      (a) => String(a.opportunityId) === String(opportunityId)
    );
    forOpp.forEach((app) => {
      pathfinderDataById[app.id] = {
        id: app.id,
        name: app.pathfinderName || "Applicant",
        role: "Pathfinder",
        location: "",
        email: app.pathfinderEmail,
      };
    });
    setApplications(forOpp);
    if (forOpp.length > 0) setOpportunityTitle(forOpp[0].opportunityTitle);
    else {
      const opps = JSON.parse(localStorage.getItem("enablerOpportunities") || "[]");
      const found = opps.find((o) => String(o.id) === String(opportunityId));
      setOpportunityTitle(found?.title || "Opportunity");
    }
  }, [opportunityId]);

  const handleDownloadCv = (app) => {
    if (!app.cvData) return;
    const a = document.createElement("a");
    a.href = app.cvData;
    a.download = app.cvFileName || "CV.pdf";
    a.click();
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <EnablerNavbar />
      <div className="pt-20 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-[#6A00B1] hover:text-[#5A0091] transition-colors"
          >
            <i className="fa fa-arrow-left text-xl"></i>
          </button>

          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-black mb-1">
              Applicants for: {opportunityTitle || "Opportunity"}
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              View applications from pathfinders who applied for this opportunity
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <i className="fa fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-sm md:text-base">
                No applications yet for this opportunity.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Pathfinders can apply from the opportunity details page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div
                    className="p-3 md:p-4 flex items-start gap-3 md:gap-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-[#6A00B1] font-bold text-lg">
                      {app.pathfinderName ? app.pathfinderName.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-base font-bold text-black mb-1">
                        {app.pathfinderName || "Applicant"}
                      </h2>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {app.pathfinderEmail}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                        {app.motivation}
                      </p>
                    </div>
                    <i
                      className={`fa fa-chevron-${expandedId === app.id ? "up" : "down"} text-gray-400 mt-2`}
                    ></i>
                  </div>

                  {expandedId === app.id && (
                    <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
                      {app.aboutMe && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 mb-1">About</h3>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap">{app.aboutMe}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1">Why applying</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{app.motivation}</p>
                      </div>
                      {app.cvFileName && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 mb-1">CV / Resume</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadCv(app);
                            }}
                            className="inline-flex items-center gap-2 text-[#6A00B1] font-semibold text-sm hover:underline"
                          >
                            <i className="fa fa-download"></i>
                            {app.cvFileName}
                          </button>
                        </div>
                      )}
                      {app.customAnswers && app.customAnswers.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 mb-2">Additional answers</h3>
                          <div className="space-y-2">
                            {app.customAnswers.map((a, i) => (
                              <div key={i}>
                                <p className="text-xs font-semibold text-gray-700">{a.question}</p>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.answer || "—"}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/enabler/pathfinder/${app.id}`);
                          }}
                          className="bg-[#E0C6FF] text-[#6A00B1] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#D0B6FF]"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/enabler/contact/${app.id}`);
                          }}
                          className="bg-[#6A00B1] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#5A0091]"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applicants;
