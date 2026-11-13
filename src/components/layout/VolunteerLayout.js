import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Archive,
  Award,
  Crown,
  Briefcase,
  LogOut,
  Headphones,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  MoreHorizontal,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { profile } from "../../services/api";
import logoImg from "../../Assets/AfriVate_logo_long_white_on_navy.png";
import NotificationModal from "./NotificationModal";

const BRAND_PURPLE = "#843A7F";

export default function VolunteerLayout({
  activeItem = "Over View",
  fullWidth = false,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    profile
      .pictureGet()
      .then((pic) => {
        if (isMounted && pic?.profile_pic) {
          setProfilePic(pic.profile_pic);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "Volunteer";

  const displayEmail =
    user?.email ||
    "";

  const navItems = [
    { name: "Home", path: "/volunteer/home", icon: Home },
    { name: "Overview", path: "/volunteer/dashboard", icon: LayoutGrid },
    { name: "Engagements", path: "/volunteer/engagements", icon: Archive },
    { name: "Credentials", path: "/volunteer/credentials", icon: Award },
    { name: "Achievements", path: "/volunteer/achievements", icon: Crown },
    { name: "Skills Portfolio", path: "/volunteer/skills-portfolio", icon: Briefcase },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased text-gray-900">
      {/* ══════════════════════════════════════════════════════
          MOBILE BACKDROP
      ══════════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════
          FIXED SIDEBAR (Never scrollable, fixed position)
      ══════════════════════════════════════════════════════ */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-screen h-[100dvh] z-40 w-64 lg:w-72 flex flex-col justify-between py-5 px-4 text-white overflow-hidden transition-transform duration-200 ease-in-out select-none shadow-xl lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: BRAND_PURPLE }}
      >
        {/* Top: Logo & Navigation Links */}
        <div className="flex flex-col gap-4 sm:gap-5 min-h-0">
          {/* Logo badge in white rounded box */}
          <div className="flex items-center justify-between px-1">
            <Link
              to="/volunteer/dashboard"
              className="bg-white rounded-2xl py-2 px-3.5 shadow-sm flex items-center justify-center w-full max-w-[155px] hover:opacity-95 transition-opacity"
            >
              <img
                src={logoImg}
                alt="AfriVate"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/80 hover:text-white p-1 rounded-lg"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeItem === item.name ||
                (item.name === "Home" &&
                  (location.pathname === "/volunteer/home" ||
                    location.pathname === "/volunteer/opportunities")) ||
                ((item.name === "Overview" || item.name === "OverView") &&
                  (location.pathname === "/volunteer/dashboard" ||
                    location.pathname === "/volunteer/overview" ||
                    location.pathname === "/pathf" ||
                    location.pathname === "/dashf")) ||
                (item.name === "Engagements" &&
                  location.pathname === "/volunteer/engagements") ||
                (item.name === "Credentials" &&
                  location.pathname === "/volunteer/credentials") ||
                (item.name === "Achievements" &&
                  location.pathname === "/volunteer/achievements") ||
                (item.name === "Skills Portfolio" &&
                  location.pathname === "/volunteer/skills-portfolio");

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-white font-bold shadow-sm"
                      : "text-white/85 hover:text-white hover:bg-white/10 font-medium"
                  }`}
                  style={{
                    color: isActive ? BRAND_PURPLE : undefined,
                  }}
                >
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? "stroke-[2.5]"
                        : "stroke-[2] text-white/90"
                    }
                    style={{ color: isActive ? BRAND_PURPLE : undefined }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Viewing As, Actions, User profile */}
        <div className="flex flex-col gap-3 pt-3 border-t border-white/15 shrink-0">
          {/* Viewing As section */}
          <div>
            <p className="text-[10px] text-white/60 mb-1 px-1.5 font-medium uppercase tracking-wider">
              Viewing As
            </p>
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 flex items-center justify-between text-white text-xs font-semibold cursor-pointer hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 truncate pr-2">
                <User size={14} className="text-white/80 shrink-0" />
                <span className="truncate">Volunteer</span>
              </div>
              <ChevronDown size={14} className="text-white/70 shrink-0" />
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col gap-0.5 text-xs">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-left font-medium"
            >
              <LogOut size={15} />
              <span>Log out</span>
            </button>

            <Link
              to="/support"
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors font-medium"
            >
              <Headphones size={15} />
              <span>Support</span>
            </Link>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="relative shrink-0">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-white/30 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white text-xs uppercase shadow-sm">
                  {displayName.charAt(0)}
                </div>
              )}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#843A7F] absolute bottom-0 right-0" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {displayName}
              </p>
              {displayEmail && (
                <p className="text-[10px] text-white/60 truncate mt-0.5">
                  {displayEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT AREA (Offset by fixed sidebar width)
      ══════════════════════════════════════════════════════ */}
      <div className="lg:pl-72 min-h-screen flex flex-col min-w-0">
        {/* Top Header bar */}
        <header
          className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white shrink-0 sticky top-0 z-30 shadow-sm"
          style={{ backgroundColor: BRAND_PURPLE }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white text-gray-800 flex items-center justify-center shadow-xs focus:outline-none active:scale-95 transition-transform"
              aria-label="Open navigation menu"
            >
              <Menu size={18} strokeWidth={2.5} />
            </button>
            <span className="text-sm font-semibold tracking-wide">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(true)}
              className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition-colors relative cursor-pointer"
            >
              <Bell size={18} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 border border-[#843A7F]" />
            </button>
          </div>
        </header>

        {/* Mobile Sub-header */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shadow-xs">
          <span className="text-base font-extrabold text-[#843A7F] tracking-tight">
            AfriVate
          </span>
          <div
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-1.5 text-xs text-gray-600 font-medium cursor-pointer"
          >
            <span>Viewing As:</span>
            <span className="text-[#843A7F] font-bold">Volunteer</span>
            <ChevronDown size={13} className="text-gray-500" />
          </div>
        </div>

        {/* Content canvas with extra bottom padding on mobile for fixed navigation */}
        <main
          className={`flex-1 w-full ${
            fullWidth
              ? "p-0 max-w-none pb-36 lg:pb-9"
              : "p-4 sm:p-7 lg:p-9 max-w-[1400px] mx-auto pb-36 lg:pb-9"
          }`}
        >
          {children}
        </main>

        {/* ══════════════════════════════════════════════════════
            MOBILE FIXED BOTTOM NAVIGATION
        ══════════════════════════════════════════════════════ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t border-gray-200/80 shadow-lg">
          {/* Upper tier: User Mini Profile */}
          <div className="px-5 py-2 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs uppercase">
                    {displayName.charAt(0)}
                  </div>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-xs bg-emerald-500 shrink-0" />
          </div>

          {/* Lower tier: 4 Navigation Tabs */}
          <div className="px-2 pt-1 pb-1 flex items-center justify-around">
            {/* Tab 1: Overview */}
            <Link
              to="/volunteer/dashboard"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[70px] transition-colors ${
                activeItem === "Overview" || activeItem === "Over View" || location.pathname === "/volunteer/dashboard"
                  ? "bg-[#843A7F]/10 text-[#843A7F] font-bold"
                  : "text-gray-500 hover:text-gray-900 font-medium"
              }`}
            >
              <LayoutGrid size={17} className={activeItem === "Overview" ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[10px] mt-0.5">Overview</span>
            </Link>

            {/* Tab 2: Engagements */}
            <Link
              to="/volunteer/engagements"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[70px] transition-colors ${
                activeItem === "Engagements" || location.pathname === "/volunteer/engagements"
                  ? "bg-[#843A7F]/10 text-[#843A7F] font-bold"
                  : "text-gray-500 hover:text-gray-900 font-medium"
              }`}
            >
              <Archive size={17} className={activeItem === "Engagements" ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[10px] mt-0.5">Engagements</span>
            </Link>

            {/* Tab 3: Credentials */}
            <Link
              to="/volunteer/credentials"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[70px] transition-colors ${
                activeItem === "Credentials" || location.pathname === "/volunteer/credentials"
                  ? "bg-[#843A7F]/10 text-[#843A7F] font-bold"
                  : "text-gray-500 hover:text-gray-900 font-medium"
              }`}
            >
              <Award size={17} className={activeItem === "Credentials" ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[10px] mt-0.5">Credentials</span>
            </Link>

            {/* Tab 4: More */}
            <Link
              to="/volunteer/skills-portfolio"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[70px] transition-colors ${
                activeItem === "Achievements" ||
                activeItem === "Skills Portfolio" ||
                activeItem === "Support" ||
                location.pathname === "/support"
                  ? "bg-[#843A7F]/10 text-[#843A7F] font-bold"
                  : "text-gray-500 hover:text-gray-900 font-medium"
              }`}
            >
              <MoreHorizontal
                size={17}
                className={
                  activeItem === "Skills Portfolio" ||
                  activeItem === "Achievements" ||
                  activeItem === "Support" ||
                  location.pathname === "/support"
                    ? "stroke-[2.5]"
                    : "stroke-2"
                }
              />
              <span className="text-[10px] mt-0.5">More</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications Pop-up inside Layout */}
      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

