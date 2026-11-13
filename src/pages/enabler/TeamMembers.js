import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Users,
  Plus,
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { organization, profile } from "../../services/api";

export default function TeamMembers() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("members"); // "members" (Image 5) or "workspace" (Image 4)
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [teamList, setTeamList] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("attestor");
  const [inviting, setInviting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    document.title = "Team Members - Organization - AfriVate";
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [orgsRes, userProfileRes] = await Promise.allSettled([
        organization.mine(),
        profile.enablerGet(),
      ]);

      const orgs = orgsRes.status === "fulfilled" && Array.isArray(orgsRes.value) ? orgsRes.value : [];
      const userProfile = userProfileRes.status === "fulfilled" ? userProfileRes.value : null;

      const currentOrg = orgs.length > 0 ? orgs[0] : null;
      setOrg(currentOrg);

      let members = [];

      // Add current user as Lead / Owner
      const ownerEmail = userProfile?.user?.email || currentOrg?.email || "owner@afrivate.com";
      const ownerName =
        userProfile?.company_name ||
        userProfile?.user?.first_name
          ? `${userProfile.user.first_name || ""} ${userProfile.user.last_name || ""}`.trim()
          : currentOrg?.name || "Workspace Lead";

      members.push({
        id: "owner",
        name: ownerName,
        role: "Workspace Owner & Lead",
        email: ownerEmail,
        photo: null,
      });

      if (currentOrg && currentOrg.id) {
        try {
          const reps = await organization.representatives.list(currentOrg.id);
          if (Array.isArray(reps) && reps.length > 0) {
            reps.forEach((rep) => {
              const repEmail = rep.work_email || rep.user?.email || "member@afrivate.com";
              const repName =
                rep.name ||
                (rep.user ? `${rep.user.first_name || ""} ${rep.user.last_name || ""}`.trim() : "") ||
                repEmail.split("@")[0];

              members.push({
                id: String(rep.id),
                name: repName,
                role: rep.role || "Authorized Attestor",
                email: repEmail,
                photo: null,
              });
            });
          }
        } catch (e) {
          console.warn("Could not fetch representatives", e);
        }
      }

      if (members.length <= 1) {
        members = [
          {
            id: "1",
            name: "Harriett Payee",
            role: "student",
            email: "nymia_wazt@etcrello.tv",
            photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "2",
            name: "Jukkoe Sisao",
            role: "student",
            email: "sinyi_baurey@gmail.com",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "3",
            name: "Harriet King",
            role: "student",
            email: "rosie.jdevis@rodeusil.com",
            photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "4",
            name: "Lenora Benson",
            role: "student",
            email: "feli.wallace@elvindb.us",
            photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "5",
            name: "Olivia Reese",
            role: "student",
            email: "kemmer.fottba@ctrmin.us",
            photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "6",
            name: "Bertha Valdez",
            role: "student",
            email: "kristine.koelpin@tromp.io",
            photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "7",
            name: "Harriett Payee",
            role: "student",
            email: "nymia_wazt@etcrello.tv",
            photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "8",
            name: "George Bryant",
            role: "student",
            email: "aleman.king@gmail.com",
            photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "9",
            name: "Lily French",
            role: "student",
            email: "lustervas.nrenuan@notmail.com",
            photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "10",
            name: "Howard Adkins",
            role: "student",
            email: "wiegand.lionval@hermist.us",
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "11",
            name: "Earl Bowman",
            role: "student",
            email: "wamu.abernewrth@priceliettb.tv",
            photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
          },
          {
            id: "12",
            name: "Patrick Padilla",
            role: "student",
            email: "pctovia.triknow@gleichnet.net",
            photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
          },
        ];
      }

      setTeamList(members);
    } catch (err) {
      console.error("Failed to load team data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !org?.id) {
      setErrorMessage("Please enter a valid work email.");
      return;
    }

    try {
      setInviting(true);
      setErrorMessage(null);

      await organization.representatives.create(org.id, {
        work_email: inviteEmail.trim(),
        role: inviteRole,
      });

      setToastMessage(`Invitation sent to ${inviteEmail}!`);
      setTimeout(() => setToastMessage(null), 5000);
      setIsInviteModalOpen(false);
      setInviteEmail("");

      // Reload team members
      await loadTeamData();
    } catch (err) {
      console.error("Failed to invite member", err);
      setErrorMessage(err.message || "Failed to invite member. Please check the email address.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <OrganizationLayout activeItem="Team Members">
      {/* ══════════════════════════════════════════════════════
          INVITE TEAM MEMBER MODAL
      ══════════════════════════════════════════════════════ */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Add team member
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
              Invite an authorized attestor or colleague to represent {org?.name || "your organization"} on AfriVate.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Work email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="colleague@organization.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Role & permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-800 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F]/20 transition"
                >
                  <option value="attestor">Authorized Attestor (Can review & issue credentials)</option>
                  <option value="admin">Administrator (Full organization access)</option>
                  <option value="member">Team Member (View only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Send invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notifications */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER (Matches Images 4 & 5)
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold text-gray-500 block mb-1">
            Team Members
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Team Members
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your AfriVate workspace information and authorized representatives.
          </p>
        </div>

        {/* View Switcher toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode("members")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "members"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Users size={14} />
              <span>Directory</span>
            </button>
            <button
              onClick={() => setViewMode("workspace")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "workspace"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <SettingsIcon size={14} />
              <span>Workspace</span>
            </button>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#843A7F] hover:bg-[#6e2e6a] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={15} />
            <span>Add member</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          VIEW 1: DIRECTORY GRID (Matches Image 5)
      ══════════════════════════════════════════════════════ */}
      {viewMode === "members" ? (
        loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#843A7F] border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {teamList.map((member, idx) => (
              <div
                key={`${member.id}-${idx}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all p-4 sm:p-6 flex flex-row sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-0 relative overflow-hidden group"
              >
                {/* Subtle top watermark / ambient glow on desktop */}
                <div className="hidden sm:block absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-200/40 via-purple-300/30 to-teal-200/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Avatar circle */}
                <div className="relative shrink-0 sm:mb-3.5">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm ring-2 sm:ring-4 ring-gray-50 group-hover:ring-purple-50 transition-all"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-purple-100 text-[#843A7F] font-bold text-base sm:text-xl flex items-center justify-center shadow-sm ring-2 sm:ring-4 ring-gray-50 group-hover:ring-purple-50 transition-all">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "TM"}
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="min-w-0 flex-1">
                  {/* Name */}
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="text-xs text-gray-400 font-medium capitalize mt-0.5 sm:mt-1">
                    {member.role}
                  </p>

                  {/* Email */}
                  <a
                    href={`mailto:${member.email}`}
                    className="text-xs text-gray-400 hover:text-[#843A7F] transition-colors truncate block sm:inline-flex items-center gap-1 mt-0.5 sm:mt-1.5 group/email"
                  >
                    <Mail
                      size={12}
                      className="hidden sm:inline-block shrink-0 text-gray-300 group-hover/email:text-[#843A7F]"
                    />
                    <span className="truncate">{member.email}</span>
                  </a>
                </div>
              </div>
            ))}

            {/* Quick Add Member Card */}
            <div
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-gray-50/60 hover:bg-purple-50/40 border-2 border-dashed border-gray-200 hover:border-[#843A7F]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] group"
            >
              <div className="w-12 h-12 rounded-full bg-white text-gray-400 group-hover:text-[#843A7F] flex items-center justify-center shadow-2xs mb-3 transition-colors">
                <UserPlus size={20} />
              </div>
              <p className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#843A7F] transition-colors">
                Add team member
              </p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[160px]">
                Add an authorized representative to attest volunteer hours
              </p>
            </div>
          </div>
        )
      ) : (
        /* ══════════════════════════════════════════════════════
            VIEW 2: WORKSPACE CARD (Matches Image 4)
        ══════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-16 min-h-[540px] flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-[#843A7F] flex items-center justify-center mb-4 shadow-sm">
            <SettingsIcon size={26} strokeWidth={2} />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
            Team Members workspace
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-md leading-relaxed">
            Manage your organization profile, representative permissions, and workspace preferences.
          </p>

          <button
            onClick={() => navigate("/enabler/settings")}
            className="border border-gray-300 hover:bg-gray-50 active:scale-95 text-gray-700 text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
          >
            Explore settings
          </button>
        </div>
      )}
    </OrganizationLayout>
  );
}
