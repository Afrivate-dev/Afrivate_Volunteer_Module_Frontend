import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ShieldCheck,
  Clock,
  Check,
  FileText,
  UserCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { organization } from "../../services/api";

const BRAND_PURPLE = "#843A7F";

export default function VerificationStatus() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [representatives, setRepresentatives] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    document.title = "Verification Center - AfriVate";
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const orgs = await organization.mine();
      const currentOrg = Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null;
      setOrg(currentOrg);

      if (currentOrg && currentOrg.id) {
        try {
          const docs = await organization.documents.list(currentOrg.id);
          setDocuments(Array.isArray(docs) ? docs : []);
        } catch (e) {
          console.warn("Could not fetch documents", e);
        }

        try {
          const reps = await organization.representatives.list(currentOrg.id);
          setRepresentatives(Array.isArray(reps) ? reps : []);
        } catch (e) {
          console.warn("Could not fetch representatives", e);
        }
      }
    } catch (err) {
      console.error("Failed to load organization verification data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !org?.id) return;

    try {
      setUploading(true);
      setErrorMessage(null);
      await organization.documents.create(org.id, "cac", file);
      setToastMessage("CAC registration document uploaded successfully for review!");
      setTimeout(() => setToastMessage(null), 5000);
      // Reload documents
      const docs = await organization.documents.list(org.id);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("Failed to upload document", err);
      setErrorMessage(err.message || "Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Derive dynamic tier information
  const tierKey = org?.tier || "tier_2";
  const tierDisplay = {
    tier_1: {
      number: "Tier 1",
      title: "Registered & Verified",
      desc: "Formal registration has been reviewed and representative identity confirmed.",
    },
    tier_2: {
      number: "Tier 2",
      title: "Community-Referenced",
      desc: "Your organization has been community-referenced based on activity evidence and two independent references.",
    },
    tier_3: {
      number: "Tier 3",
      title: "Self-Declared / Pending",
      desc: "Registered on AfriVate, awaiting review of evidence for higher trust tier.",
    },
  }[tierKey] || {
    number: "Tier 2",
    title: "Community-Referenced",
    desc: "Your organization has been community-referenced based on activity evidence and two independent references.",
  };

  const hasCacDoc = documents.some(
    (d) =>
      d.document_type === "cac" ||
      d.document_type === "cac_certificate" ||
      d.document_type?.toLowerCase().includes("cac")
  );

  const hasProfile = Boolean(org?.name);
  const hasRep = representatives.length > 0 || Boolean(org?.email);
  const hasEvidence = documents.length > 0 || tierKey === "tier_1" || tierKey === "tier_2";
  const hasReferences = tierKey === "tier_1" || tierKey === "tier_2";
  const hasIdentityCheck = tierKey === "tier_1";

  const checklistItems = [
    { label: "Organization profile completed", completed: hasProfile },
    { label: "Representative contact confirmed", completed: hasRep },
    { label: "Community activity evidence accepted", completed: hasEvidence },
    { label: "Two references validated", completed: hasReferences },
    {
      label: "CAC registration document",
      completed: hasCacDoc,
      isActionable: !hasCacDoc,
      actionText: uploading ? "Uploading..." : "Upload",
      actionHandler: () => fileInputRef.current?.click(),
    },
    {
      label: "Representative identity check",
      completed: hasIdentityCheck,
      isActionable: !hasIdentityCheck,
      actionText: "Begin check",
      actionHandler: () => navigate("/kyc"),
    },
  ];

  const completedCount = checklistItems.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  const formattedDate = org?.updated_at
    ? new Date(org.updated_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "18 May 2025";

  return (
    <OrganizationLayout activeItem="Verification Center">
      {/* Hidden file input for CAC upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
      />

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

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-gray-500 block mb-1">
          Verification Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Verification Center
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Build a transparent trust profile by submitting evidence for review.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#843A7F] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════════════════════════
              CURRENT ORGANIZATION STATUS CARD
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
              CURRENT ORGANIZATION STATUS
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#843A7F] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#843A7F]">
                      {tierDisplay.number}
                    </span>
                    <span className="text-gray-300">•</span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {tierDisplay.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
                    {tierDisplay.desc}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
                <span className="text-[11px] text-gray-400 mt-1.5 font-medium">
                  Last reviewed {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              3-TIER COMPARISON CARDS
          ══════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
            {/* Tier 1 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between ${
                tierKey === "tier_1"
                  ? "relative border-2 border-[#843A7F]"
                  : "border border-gray-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Shield size={18} strokeWidth={2.5} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Tier 1
                    </span>
                  </div>
                  {tierKey === "tier_1" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      ● Your tier
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                      ● Next level
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  Registered & Verified
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Formal registration has been reviewed and representative identity confirmed.
                </p>

                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>CAC registration evidence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>Representative identity check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>Optional SCUML trust signal</span>
                  </li>
                </ul>
              </div>

              {tierKey !== "tier_1" && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-6 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>Submit CAC documents</span>
                </button>
              )}
            </div>

            {/* Tier 2 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between ${
                tierKey === "tier_2"
                  ? "relative border-2 border-[#843A7F]"
                  : "border border-gray-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-2"
                    style={{ color: BRAND_PURPLE }}
                  >
                    <ShieldCheck size={18} strokeWidth={2.5} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Tier 2
                    </span>
                  </div>
                  {tierKey === "tier_2" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      ● Your tier
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  Community-Referenced
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Public activity, community references, and organizational presence have been reviewed.
                </p>

                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>Documented activity evidence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>Public presence and references</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>Representative identity check</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate("/enabler/online-presence")}
                className="w-full mt-6 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition shadow-sm"
              >
                View requirements
              </button>
            </div>

            {/* Tier 3 */}
            <div
              className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between ${
                tierKey === "tier_3"
                  ? "relative border-2 border-[#843A7F]"
                  : "border border-gray-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock size={18} strokeWidth={2.5} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Tier 3
                    </span>
                  </div>
                  {tierKey === "tier_3" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      ● Your tier
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-1.5">
                  Self-Declared / Pending
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  Registered on AfriVate, but evidence is not yet sufficient for a higher trust tier.
                </p>

                <ul className="space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-600 stroke-[3] shrink-0" />
                    <span>Organization account created</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <Clock size={14} className="shrink-0" />
                    <span>Evidence not reviewed</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-9" />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              BOTTOM SECTION: VERIFICATION PATHWAY
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Your verification pathway
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete the outstanding requirements to progress to Tier 1 ({progressPercent}% completed).
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {completedCount} of {checklistItems.length} complete
              </span>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {checklistItems.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-3.5 flex items-center justify-between transition-colors ${
                    item.completed
                      ? "border-gray-100 bg-gray-50/40"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : item.label.includes("CAC") ? (
                      <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                        <FileText size={14} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                        <UserCheck size={14} />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {item.completed ? "Completed" : "Action required"}
                      </p>
                    </div>
                  </div>

                  {item.isActionable && (
                    <button
                      onClick={item.actionHandler}
                      disabled={uploading}
                      className="border border-gray-300 hover:bg-gray-50 active:scale-95 text-xs font-semibold text-gray-800 px-3.5 py-1.5 rounded-lg transition shadow-sm disabled:opacity-50"
                    >
                      {item.actionText}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </OrganizationLayout>
  );
}
