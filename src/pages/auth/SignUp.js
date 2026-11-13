import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, User } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import heroImage from "../../Assets/signup-hero.png";
import globeImage from "../../Assets/signup-globe.png";

const BRAND_PURPLE = "#843A7F";

/* ─────────────────────────────────────────────────────────────
    Password field 
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
          style={{ paddingRight: "3.5rem" }}
          className={`w-full px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl text-[15px] sm:text-base outline-none transition-all duration-200 ${
            error
              ? "border border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400/20"
              : isFilled
              ? "bg-[#EEF3FA] border border-transparent text-gray-900 focus:bg-white focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
              : "bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#843A7F] transition-colors focus:outline-none cursor-pointer"
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 pl-1">{error}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
    MAIN SIGNUP PAGE
═══════════════════════════════════════════════════════════════ */
const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    userType: "pathfinder", // pathfinder = freelancer
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoleChange = (role) =>
    setFormData((prev) => ({ ...prev, userType: role }));

  const validateForm = () => {
    const e = {};

    if (!formData.email) {
      e.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = "Email is invalid";
    } else if (formData.email.length > 50) {
      e.email = "Email must be less than 50 characters";
    }

    if (!formData.password) {
      e.password = "Password is required";
    } else if (formData.password.length < 8) {
      e.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const role = formData.userType === "pathfinder" ? "pathfinder" : "enabler";
      
      // Auto-derive clean username from email for backend compatibility
      const baseUser = (formData.email.split("@")[0] || "user").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
      const username = baseUser.length >= 3 ? baseUser : `${baseUser || "user"}_${Math.floor(100 + Math.random() * 900)}`;

      const regRes = await api.auth.register({
        username,
        email: formData.email.trim(),
        password: formData.password,
        password2: formData.confirmPassword,
        role,
      });

      if (regRes?.access) {
        api.setTokens(regRes.access, regRes.refresh);
        api.setRole(role);
        navigate(
          role === "enabler"
            ? "/enabler/profile-setup"
            : "/pathfinder/profile-setup"
        );
        return;
      }

      sessionStorage.setItem("registrationEmail", formData.email.trim());
      sessionStorage.setItem("registrationRole", role);
      navigate("/verify-otp?flow=registration");
    } catch (err) {
      setServerError(getApiErrorMessage(err) || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12 font-sans">
      <div className="max-w-[1260px] xl:max-w-[1340px] w-full min-h-[680px] lg:min-h-[740px] xl:min-h-[780px] bg-white rounded-[36px] sm:rounded-[44px] lg:rounded-[48px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row">

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
            <h2 className="text-white text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-bold leading-tight mb-7 sm:mb-8">
              Your next chapter<br />starts here.
            </h2>

            {/* Photo Card */}
            <div className="w-full h-[280px] sm:h-[320px] lg:h-[360px] xl:h-[400px] rounded-[28px] sm:rounded-[34px] overflow-hidden border border-white/20 shadow-xl relative bg-white/10">
              <img
                src={heroImage}
                alt="Woman working on laptop"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>
          </div>

          {/* Globe lines overlay at bottom */}
          <div className="absolute -bottom-12 -left-12 -right-12 pointer-events-none opacity-30 mix-blend-screen z-0">
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
              className="text-center font-bold text-2xl sm:text-3xl lg:text-[32px] uppercase tracking-wider mb-7 sm:mb-8"
              style={{ color: BRAND_PURPLE }}
            >
              SIGN UP
            </h1>

            {/* Google / Gmail Button */}
            <div className="w-full mb-4">
              <GoogleAuthButton
                mode="signup"
                role={formData.userType}
                buttonText="Login with Gmail"
                onError={setServerError}
                className="py-4 px-6 rounded-2xl text-[15px] sm:text-[16px]"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3.5 text-xs text-gray-400 font-medium">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Toggle Pills - placed at the top */}
              <div className="flex items-center gap-2 p-1 bg-gray-50/90 rounded-2xl border border-gray-100 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleRoleChange("pathfinder")}
                  className={`flex-1 py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all tracking-wide cursor-pointer ${
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
                  className={`flex-1 py-3 sm:py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all tracking-wide cursor-pointer ${
                    formData.userType === "enabler"
                      ? "bg-[#843A7F] text-white font-bold shadow-sm"
                      : "text-gray-400 hover:text-gray-600 font-semibold"
                  }`}
                >
                  <User size={15} className={formData.userType === "enabler" ? "stroke-[2.5]" : "stroke-[2]"} />
                  As ENABLER
                </button>
              </div>

              {/* Email / Username field - brought down directly above password */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email or Username"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl text-[15px] sm:text-base outline-none transition-all duration-200 ${
                    errors.email
                      ? "border border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400/20"
                      : formData.email
                      ? "bg-[#EEF3FA] border border-transparent text-gray-900 focus:bg-white focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
                      : "bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
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

              {/* Confirm Password */}
              <PasswordField
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />

              {/* Remember Me */}
              <div
                onClick={() =>
                  handleChange({
                    target: { name: "rememberMe", type: "checkbox", checked: !formData.rememberMe },
                  })
                }
                className="flex items-center gap-2.5 pt-1 cursor-pointer select-none"
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

              {/* Server error */}
              {serverError && (
                <p className="text-red-500 text-center text-xs sm:text-sm font-semibold pt-1">{serverError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-4.5 rounded-2xl text-white font-bold text-base sm:text-[17px] tracking-wide shadow-[0_12px_28px_-6px_rgba(132,58,127,0.42)] transition-all duration-200 mt-3 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: BRAND_PURPLE,
                }}
              >
                {loading ? "Processing…" : "Proceed"}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-xs sm:text-sm text-center text-gray-600 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold hover:underline ml-1"
                style={{ color: BRAND_PURPLE }}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
