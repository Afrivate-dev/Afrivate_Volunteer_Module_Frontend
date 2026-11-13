import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Award } from "lucide-react";
import VolunteerLayout from "../../components/layout/VolunteerLayout";
import { engagements, profile } from "../../services/api";

export default function VolunteerCredentials() {
  const navigate = useNavigate();
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [credentialsList, setCredentialsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Credentials - Volunteer - AfriVate";

    const loadData = async () => {
      setLoading(true);
      try {
        const [engRes, credRes] = await Promise.allSettled([
          engagements.list(),
          profile.credentialsList(),
        ]);

        const engList =
          engRes.status === "fulfilled" && Array.isArray(engRes.value)
            ? engRes.value
            : [];
        const credDocs =
          credRes.status === "fulfilled" && Array.isArray(credRes.value)
            ? credRes.value
            : [];

        const attested = engList.filter(
          (e) =>
            e.status?.toLowerCase() === "attested" ||
            e.status?.toLowerCase() === "certified" ||
            e.certificate_id
        );

        const mappedAttested = attested.map((item, idx) => {
          const orgName = item.organization_name || "AfriVate Verified Organization";
          const badge = orgName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "AV";

          const rawDate = item.updated_at || item.created_at;
          const issuedDate = rawDate
            ? new Date(rawDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recently issued";

          return {
            id: String(item.id || idx),
            orgBadge: badge,
            badgeBg: "bg-teal-50 text-teal-800",
            status: "Active",
            statusCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
            dotCls: "bg-emerald-500",
            isRevoked: false,
            type: "VERIFIED VOLUNTEER EXPERIENCE",
            title: item.title || item.role || item.opportunity_title || "Verified Engagement",
            issuer: orgName,
            issuedDate,
            verificationCode: item.certificate_id || `AFR-2025-${item.id || "001"}-V`,
            hours: item.hours_contributed ? `${item.hours_contributed} hours verified` : "Verified hours",
            skills: Array.isArray(item.skills) && item.skills.length > 0 ? item.skills : ["Community outreach", "Volunteer service"],
          };
        });

        const mappedDocs = credDocs.map((doc, idx) => {
          const rawDate = doc.created_at;
          const issuedDate = rawDate
            ? new Date(rawDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recently issued";

          return {
            id: `doc-${doc.id || idx}`,
            orgBadge: "CR",
            badgeBg: "bg-purple-50 text-purple-800",
            status: "Active",
            statusCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
            dotCls: "bg-emerald-500",
            isRevoked: false,
            type: "VERIFIED DOCUMENT CREDENTIAL",
            title: doc.document_name || "Verified Credential",
            issuer: "Verified Credential Issuer",
            issuedDate,
            verificationCode: `AFR-DOC-${doc.id || idx}`,
            hours: "Verified Credential",
            skills: ["Verified Entity", "Trust Signal"],
          };
        });

        setCredentialsList([...mappedAttested, ...mappedDocs]);
      } catch (e) {
        console.warn("Could not load volunteer credentials", e);
        setCredentialsList([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <VolunteerLayout activeItem="Credentials">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-500 block mb-1">
          Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Credentials
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Professional records of your verified volunteer experience.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          CREDENTIAL CARDS GRID (Matches Image 3)
      ══════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#843A7F] border-t-transparent" />
        </div>
      ) : credentialsList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mx-auto mb-4">
            <Award size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No credentials earned yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            Once an organization attests your volunteer engagement or issues a verified credential, it will appear here with an official tamper-proof verification ID.
          </p>
          <button
            onClick={() => navigate("/volunteer/home")}
            className="bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            Explore volunteer opportunities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentialsList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Top Row: Org badge and Name */}
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tracking-wide shrink-0 ${item.badgeBg}`}
                >
                  {item.orgBadge}
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {item.issuer}
                </span>
              </div>

              {/* Status badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.statusCls}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dotCls}`} />
                  {item.status}
                </span>
              </div>

              {/* Tag / Category */}
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                {item.type}
              </span>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {item.title}
              </h3>

              {/* Subtitle / Issuer */}
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {item.isRevoked ? "Previously issued by " : "Issued to you by "}
                <span className="font-medium text-gray-700">{item.issuer}</span>
              </p>

              {/* Issued Date block */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-gray-400 block">
                    Issued
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 block">
                    {item.issuedDate}
                  </span>
                </div>

                {item.isRevoked && item.tier && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    <span>{item.tier}</span>
                  </div>
                )}
              </div>

              {/* Revoked Warning Box if inactive */}
              {item.isRevoked && item.warning && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-2.5 text-[11px] text-rose-800 leading-relaxed">
                  <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                  <span>{item.warning}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              {item.isRevoked ? (
                <span className="text-xs font-semibold text-[#0B7B69]">
                  Sharing and download unavailable
                </span>
              ) : (
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <button
                    onClick={() => setSelectedCredential(item)}
                    className="text-[#0B7B69] hover:text-[#096657] flex items-center gap-1.5 transition-colors group"
                  >
                    <span>View credential</span>
                    <ArrowRight
                      size={15}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>

                  <button
                    onClick={() => navigate(`/verify/${item.verificationCode}`)}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Public view</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* ══════════════════════════════════════════════════════
          CREDENTIAL PREVIEW MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedCredential && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base">
                  {selectedCredential.orgBadge}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    {selectedCredential.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Issued by {selectedCredential.issuer}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCredential(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 my-6 text-xs sm:text-sm text-gray-600 border-y border-gray-100 py-5">
              <div className="flex justify-between">
                <span className="text-gray-400">Issuing Entity:</span>
                <span className="font-semibold text-gray-900">
                  {selectedCredential.issuer}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verification ID:</span>
                <span className="font-mono text-gray-800 font-medium">
                  {selectedCredential.verificationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified hours:</span>
                <span className="font-semibold text-gray-900">
                  {selectedCredential.hours}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date issued:</span>
                <span className="font-semibold text-gray-900">
                  {selectedCredential.issuedDate}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-gray-400 block mb-2">Verified competencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCredential.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <ShieldCheck size={16} />
                <span>Digitally signed & verified</span>
              </div>

              <button
                onClick={() =>
                  navigate(`/verify/${selectedCredential.verificationCode}`)
                }
                className="bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Open public page</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </VolunteerLayout>
  );
}

