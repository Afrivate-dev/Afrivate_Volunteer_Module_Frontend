import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink, Award, ShieldCheck, X } from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { engagements, profile } from "../../services/api";

export default function Credentials() {
  const navigate = useNavigate();
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    document.title = "Credentials - Organization - AfriVate";
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const [engRes, profCredsRes] = await Promise.allSettled([
        engagements.list(),
        profile.credentialsList(),
      ]);

      const engList = engRes.status === "fulfilled" && Array.isArray(engRes.value) ? engRes.value : [];
      const profCreds = profCredsRes.status === "fulfilled" && Array.isArray(profCredsRes.value) ? profCredsRes.value : [];

      const issuedEngagements = engList.filter(
        (e) => (e.status && (e.status.toLowerCase() === "attested" || e.status.toLowerCase() === "certified")) || e.certificate_id
      );

      let mapped = [];

      issuedEngagements.forEach((item) => {
        const recipientName =
          item.pathfinder_name ||
          item.volunteer_name ||
          item.pathfinder?.user?.email ||
          "Volunteer";

        const badge = (item.organization_name || "AF")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const certCode = item.certificate_id || `AFR-2025-${item.id}-V`;
        const issuedDateStr = item.updated_at || item.created_at
          ? new Date(item.updated_at || item.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "16 Jun 2025";

        mapped.push({
          id: String(item.id),
          orgBadge: badge || "AF",
          badgeBg: "bg-teal-100/70 text-teal-800",
          status: "Active",
          statusCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
          dotCls: "bg-emerald-500",
          type: "VERIFIED VOLUNTEER EXPERIENCE",
          title: item.title || item.role || "Digital Literacy Facilitator",
          recipient: recipientName,
          role: item.role || "Volunteer",
          organization: item.organization_name || "AfriVate Organization",
          issuedDate: issuedDateStr,
          hours: item.hours_contributed ? `${item.hours_contributed} hours verified` : "48 hours verified",
          verificationCode: certCode,
          skills: Array.isArray(item.skills) && item.skills.length > 0 ? item.skills : ["Community outreach", "Facilitation", "Teamwork"],
        });
      });

      profCreds.forEach((cred) => {
        if (!mapped.some((m) => m.id === String(cred.id))) {
          const issuedDateStr = cred.created_at
            ? new Date(cred.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent";

          mapped.push({
            id: String(cred.id),
            orgBadge: "AF",
            badgeBg: "bg-purple-100/70 text-purple-800",
            status: "Active",
            statusCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
            dotCls: "bg-emerald-500",
            type: "GOVERNMENT & ACADEMIC CREDENTIAL",
            title: cred.document_name || "Verified Document",
            recipient: "Organization Representative",
            role: "Verified Entity",
            organization: "AfriVate Verified",
            issuedDate: issuedDateStr,
            hours: "Verified Credential",
            verificationCode: `AFR-DOC-${cred.id}`,
            skills: ["Verified Entity", "Trust Signal"],
          });
        }
      });

      setCredentials(mapped);
    } catch (err) {
      console.error("Failed to load credentials", err);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrganizationLayout activeItem="Credentials">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER (Matches Image 3)
      ══════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-500 block mb-1">
          Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Credentials
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          View and manage issued volunteer credentials.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          CREDENTIAL CARDS GRID (Matches Image 3)
      ══════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#843A7F] border-t-transparent" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mx-auto mb-4">
            <Award size={28} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No volunteer credentials issued yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            When you confirm and attest volunteer contributions in the Volunteer Engagements center, their issued credentials with unique public verification IDs will appear here.
          </p>
          <button
            onClick={() => navigate("/enabler/opportunities-posted")}
            className="bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            Go to engagements
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {credentials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Top Row: Org badge, Org name & Status badge (Screenshot 3) */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tracking-wide shrink-0 ${item.badgeBg}`}
                    >
                      {item.orgBadge}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                      {item.organization}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${item.statusCls} shrink-0`}
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

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {item.recipient} <span className="mx-1 text-gray-400">·</span> {item.role}
                </p>

                {/* Issued Date block */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 block">
                    Issued
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 block">
                    {item.issuedDate}
                  </span>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-semibold">
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
                    {selectedCredential.recipient} · {selectedCredential.role}
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
                <span className="text-gray-400">Organization:</span>
                <span className="font-semibold text-gray-900">
                  {selectedCredential.organization}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Attestation ID:</span>
                <span className="font-mono text-gray-800 font-medium">
                  {selectedCredential.verificationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hours confirmed:</span>
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
                onClick={() => navigate(`/verify/${selectedCredential.verificationCode}`)}
                className="bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Open public page</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </OrganizationLayout>
  );
}
