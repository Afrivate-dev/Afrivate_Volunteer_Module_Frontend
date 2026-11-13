import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, User } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";
import { useUser } from "../../context/UserContext";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import heroImage from "../../Assets/login-man-new.png";
import fallbackHeroImage from "../../Assets/login-hero.png";
import globeImage from "../../Assets/signup-globe.png";

const BRAND_PURPLE = "#843A7F";

/* ─────────────────────────────────────────────────────────────
    Password field with toggle eye
───────────────────────────────────────────────────────────── */
const PasswordField = ({ name, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  const isFilled = Boolean(value && value.length > 0);

  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: "3.25rem" }}
          className={`w-full px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl text-[15px] sm:text-base outline-none transition-all duration-200 ${
            error
              ? "border border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400/20"
              : isFilled
              ? "bg-[#EEF3FA] border border-transparent text-gray-900 focus:bg-white focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
              : "bg-white border border-gray-200/90 text-gray-800 placeholder-gray-400 focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#843A7F] transition-colors focus:outline-none"
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs sm:text-sm mt-1.5 pl-1">{error}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
    MAIN LOGIN COMPONENT
══════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const { refetchUser } = useUser();

  useEffect(() => {
    document.title = "Login - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    userType: "pathfinder",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, userType: role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email or username is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const data = await api.auth.login({
        username_or_email: formData.email.trim(),
        password: formData.password,
      });

      if (data.access) {
        api.setTokens(data.access, data.refresh);

        const normalizedRole = (data.user?.role || data.role || "").toLowerCase();
        if (normalizedRole === "enabler" || normalizedRole === "pathfinder") {
          api.setRole(normalizedRole);
        } else if (formData.userType) {
          api.setRole(formData.userType);
        }

        let role =
          api.getRole() === "enabler" || api.getRole() === "pathfinder"
            ? api.getRole()
            : null;

        if (!role) {
          try {
            const enabler = await api.profile.enablerGet();
            if (enabler && enabler.id != null) {
              api.setRole("enabler");
              role = "enabler";
            }
          } catch (enablerErr) {
            if (enablerErr.status !== 403 && enablerErr.status !== 404) {
              setServerError(getApiErrorMessage(enablerErr) || "Login failed");
              setLoading(false);
              return;
            }
          }
        }

        if (!role) {
          try {
            const pathfinder = await api.profile.pathfinderGet();
            if (pathfinder && pathfinder.id != null) {
              api.setRole("pathfinder");
              role = "pathfinder";
            }
          } catch (pathfinderErr) {
            const msg = getApiErrorMessage(pathfinderErr) || "Could not load your profile.";
            setServerError(
              pathfinderErr.status === 403
                ? msg || "Access denied. This account does not have pathfinder access."
                : msg
            );
            setLoading(false);
            return;
          }
        }

        if (!role) {
          api.setRole(formData.userType || "pathfinder");
          role = formData.userType || "pathfinder";
        }

        await refetchUser();
        navigate(role === "enabler" ? "/enabler/dashboard" : "/pathf");
      } else {
        setServerError("Login failed");
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err) || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50/40 flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12 font-sans">
      <div className="max-w-[1260px] xl:max-w-[1340px] w-full min-h-[680px] lg:min-h-[740px] xl:min-h-[780px] bg-white rounded-[36px] sm:rounded-[44px] lg:rounded-[48px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.08)] border border-gray-100/90 overflow-hidden flex flex-col lg:flex-row">

        {/* ══════════════════════════════════════════════════════
            LEFT HERO PANEL
        ══════════════════════════════════════════════════════ */}
        <div
          className="w-full lg:w-[46%] xl:w-[45%] p-8 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between relative overflow-hidden text-white rounded-t-[36px] lg:rounded-t-none lg:rounded-l-[44px] xl:rounded-l-[48px]"
          style={{ backgroundColor: BRAND_PURPLE }}
        >
          {/* Circular back button */}
          <div className="relative z-10 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 flex items-center justify-center text-white backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
          </div>

          {/* Heading & Image Card */}
          <div className="relative z-10 my-6 sm:my-8">
            <h2 className="text-white text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-bold leading-[1.18] mb-7 sm:mb-8">
              Your potential,<br />amplified by<br />technology.
            </h2>

            {/* Photo Card */}
            <div className="w-full h-[280px] sm:h-[320px] lg:h-[360px] xl:h-[400px] rounded-[28px] sm:rounded-[34px] overflow-hidden border-2 border-white/20 shadow-xl relative bg-white/10">
              <img
                src={heroImage || fallbackHeroImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackHeroImage;
                }}
                alt="Professional using phone at desk"
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>

          {/* Globe lines overlay at bottom */}
          <div className="absolute -bottom-10 -left-10 -right-10 pointer-events-none opacity-25 mix-blend-screen z-0">
            <img
              src={globeImage}
              alt=""
              aria-hidden="true"
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT FORM PANEL
        ══════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[54%] xl:w-[55%] p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[460px] sm:max-w-[480px] xl:max-w-[500px] mx-auto">
            {/* Title */}
            <h1
              className="text-center font-bold text-2xl sm:text-3xl lg:text-[32px] tracking-tight mb-7 sm:mb-8"
              style={{ color: BRAND_PURPLE }}
            >
              Login
            </h1>

            {/* Google / Gmail Button */}
            <div className="w-full mb-4">
              <GoogleAuthButton
                mode="login"
                role={formData.userType}
                buttonText="Login with Gmail"
                onError={setServerError}
                className="py-4 px-6 rounded-2xl text-[15px] sm:text-[16px]"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200/90"></div>
              <span className="px-3.5 text-xs text-gray-400 font-medium">Or</span>
              <div className="flex-1 border-t border-gray-200/90"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Toggle Pills - placed at the top */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleRoleChange("pathfinder")}
                  className={`flex-1 py-3 sm:py-3.5 px-3 rounded-xl text-xs sm:text-[13px] flex items-center justify-center gap-2 transition-all tracking-wide cursor-pointer ${
                    formData.userType === "pathfinder"
                      ? "bg-[#843A7F] text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-gray-600 font-semibold"
                  }`}
                >
                  <User size={15} className={formData.userType === "pathfinder" ? "stroke-[2.5]" : "stroke-[2]"} />
                  AS FREELANCER
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("enabler")}
                  className={`flex-1 py-3 sm:py-3.5 px-3 rounded-xl text-xs sm:text-[13px] flex items-center justify-center gap-2 transition-all tracking-wide cursor-pointer ${
                    formData.userType === "enabler"
                      ? "bg-[#843A7F] text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-gray-600 font-semibold"
                  }`}
                >
                  <User size={15} className={formData.userType === "enabler" ? "stroke-[2.5]" : "stroke-[2]"} />
                  As ENABLER
                </button>
              </div>

              {/* Username / Email field - brought down directly above password */}
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="Username or Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl text-[15px] sm:text-base outline-none transition-all duration-200 ${
                    errors.email
                      ? "border border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400/20"
                      : formData.email
                      ? "bg-[#EEF3FA] border border-transparent text-gray-900 focus:bg-white focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
                      : "bg-white border border-gray-200/90 text-gray-800 placeholder-gray-400 focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1.5 pl-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <PasswordField
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />

              {/* Remember me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1">
                <div
                  onClick={() =>
                    handleChange({
                      target: { name: "rememberMe", type: "checkbox", checked: !formData.rememberMe },
                    })
                  }
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      formData.rememberMe ? "border-[#843A7F] bg-[#843A7F] text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {formData.rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">Remember me</span>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-bold hover:underline"
                  style={{ color: BRAND_PURPLE }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Server Error display */}
              {serverError && (
                <p className="text-red-500 text-center text-xs sm:text-sm font-semibold pt-1">{serverError}</p>
              )}

              {/* Proceed Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-4.5 rounded-2xl text-white font-bold text-[16px] tracking-wide shadow-[0_12px_24px_-4px_rgba(132,58,127,0.42)] transition-all duration-200 mt-2 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: BRAND_PURPLE,
                }}
              >
                {loading ? "Logging in…" : "Proceed"}
              </button>
            </form>

            {/* Sign up Link */}
            <p className="mt-7 text-xs sm:text-sm text-center text-gray-600 font-medium">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold hover:underline ml-1"
                style={{ color: BRAND_PURPLE }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
