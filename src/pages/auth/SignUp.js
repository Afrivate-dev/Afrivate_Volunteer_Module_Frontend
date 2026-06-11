import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, User } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";
import heroImage  from "../../Assets/signup-hero.png";
import globeImage from "../../Assets/signup-globe.png";

const GLOBE_IMAGE_URL = globeImage; 
const WOMAN_IMAGE_URL = heroImage; 

const BRAND_PURPLE = "#843A7F"; 
const LIGHT_ACCENT = "#BEB5BC";

/* ─────────────────────────────────────────────────────────────
    Password field 
───────────────────────────────────────────────────────────── */
const PasswordField = ({ name, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: "2.75rem" }}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/10 transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          className="text-gray-400 hover:text-[#843A7F] transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
    MAIN SIGNUP PAGE
═══════════════════════════════════════════════════════════ */
const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    userType: "pathfinder",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading]         = useState(false);

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

    if (!formData.email)
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Email is invalid";
    else if (formData.email.length > 50)
      e.email = "Email must be less than 50 characters";

    if (!formData.password)
      e.password = "Password is required";
    else if (formData.password.length < 8)
      e.password = "At least 8 characters";
    else if (!/[A-Z]/.test(formData.password))
      e.password = "Must contain an uppercase letter";
    else if (!/[a-z]/.test(formData.password))
      e.password = "Must contain a lowercase letter";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password))
      e.password = "Must contain a special character";

    if (!formData.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* username is auto-derived from the email local-part */
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    const username = formData.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .substring(0, 30);

    try {
      const role = formData.userType === "pathfinder" ? "pathfinder" : "enabler";

      const regRes = await api.auth.register({
        username,
        email: formData.email,
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

      sessionStorage.setItem("registrationEmail", formData.email);
      sessionStorage.setItem("registrationRole", role);
      navigate("/verify-otp?flow=registration");
    } catch (err) {
      setServerError(getApiErrorMessage(err) || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden bg-white w-full">

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden lg:h-full"
        style={{
          width: "50%",
          minWidth: "50%",
          backgroundColor: BRAND_PURPLE,
        }}
      >
        {/* Back button container */}
        <div style={{ padding: "1.25rem 1.5rem", position: "relative", zIndex: 3 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            <ArrowLeft size={15} color={BRAND_PURPLE} strokeWidth={2.5} />
          </button>
        </div>

        {/* Headline & Woman Image Container (Centering wrapper) */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: "1rem" }}>
          
          {/* Headline */}
          <h2
            style={{
              width: "80%",
              maxWidth: "340px",
              color: "white",
              fontSize: "1.9rem",
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: "1.5rem",
              textAlign: "left",
            }}
          >
            Your next chapter<br />starts here.
          </h2>

          {/* Hero image card */}
          <div
            style={{
              width: "80%",
              maxWidth: "340px",
              height: "360px", 
              borderRadius: "1.75rem",
              overflow: "hidden",
              border: "4px solid rgba(255,255,255,0.25)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            }}
          >
            <img
              src={WOMAN_IMAGE_URL}
              alt="Professional at work"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 18%",
                display: "block",
              }}
              loading="eager"
            />
          </div>
        </div>

        {/* Globe image centered, pushed 140px down to hide the bottom quarter */}
        <div
          style={{
            position: "absolute",
            bottom: "-140px", 
            left: "50%",
            transform: "translateX(-50%)",
            width: "135%",
            zIndex: 1,
          }}
        >
          {/* Gradient fade to seamlessly blend top edge of globe */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "45%",
              background: `linear-gradient(to bottom, ${BRAND_PURPLE} 0%, rgba(132, 58, 127, 0) 100%)`,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />

          <img
            src={GLOBE_IMAGE_URL}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              display: "block",
              mixBlendMode: "screen",
              opacity: 0.95,
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL 
      ══════════════════════════════════════════════════════ */}
      <div
        className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-full flex items-center justify-center bg-white px-6 py-8 sm:px-10 lg:py-6 lg:overflow-hidden"
      >
        <div style={{ width: "100%", maxWidth: "360px" }}>

          {/* Mobile back button */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="lg:hidden mb-5 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={15} color={BRAND_PURPLE} strokeWidth={2.5} />
          </button>

          {/* Title */}
          <h1
            className="text-center font-extrabold uppercase mb-6"
            style={{ fontSize: "1.85rem", letterSpacing: "0.15em", color: BRAND_PURPLE }}
          >
            Sign Up
          </h1>

          {/* Gmail button */}
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-3.5 border rounded-full bg-white hover:bg-gray-50 active:bg-gray-100 transition shadow-sm mb-5"
            style={{ borderColor: "#E5E2E5" }}
            onClick={() => { /* plug in your Google OAuth flow */ }}
          >
            <svg style={{ width: 20, height: 20, flexShrink: 0 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span style={{ color: BRAND_PURPLE }} className="flex-1 text-center text-[15px] font-bold">
              Login with Gmail
            </span>
            <ArrowRight size={18} color={BRAND_PURPLE} strokeWidth={2.2} />
          </button>

          {/* Or divider */}
          <div style={{ position: "relative", marginBottom: "1.25rem" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid #E5E2E5" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <span style={{ backgroundColor: "white", padding: "0 1rem" }} className="text-sm text-gray-500 font-medium">
                Or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label style={{ color: LIGHT_ACCENT }} className="block text-xs font-bold mb-1 pl-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ borderColor: "#E5E2E5" }}
                className="w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-[#BEB5BC] outline-none focus:ring-1 focus:ring-[#843A7F] focus:border-[#843A7F] transition-all"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
            </div>

            {/* Role toggle */}
            <div 
              style={{ 
                position: "relative", 
                display: "flex", 
                width: "100%", 
                backgroundColor: "#FFFFFF", 
                border: "1px solid #E5E2E5", 
                borderRadius: "0.75rem", 
                padding: "4px" 
              }}
            >
              {/* Inner sliding backdrop */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: 4, bottom: 4,
                  width: "calc(50% - 4px)",
                  borderRadius: "0.5rem", 
                  background: BRAND_PURPLE,
                  boxShadow: "0 2px 8px rgba(132,58,127,0.35)",
                  transform: formData.userType === "pathfinder" ? "translateX(0)" : "translateX(calc(100% + 4px))",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
              <button
                type="button"
                onClick={() => handleRoleChange("pathfinder")}
                style={{ position: "relative", flex: 1, zIndex: 1, borderRadius: "0.5rem" }}
                className={`py-2.5 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200 focus:outline-none ${formData.userType === "pathfinder" ? "text-white" : LIGHT_ACCENT}`}
              >
                <User size={12} strokeWidth={2} />
                AS FREELANCER
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("enabler")}
                style={{ position: "relative", flex: 1, zIndex: 1, borderRadius: "0.5rem" }}
                className={`py-2.5 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200 focus:outline-none ${formData.userType === "enabler" ? "text-white" : LIGHT_ACCENT}`}
              >
                <User size={12} strokeWidth={2} />
                AS ENABLER
              </button>
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

            {/* Remember me */}
            <div 
              onClick={() => handleChange({ target: { name: "rememberMe", type: "checkbox", checked: !formData.rememberMe } })}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                  formData.rememberMe 
                    ? "border-[#843A7F] bg-white" 
                    : "border-[#BEB5BC] bg-white"
                }`}
              >
                {formData.rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={BRAND_PURPLE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold" style={{ color: BRAND_PURPLE }}>
                Remember me
              </span>
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-red-500 text-center text-sm font-semibold">{serverError}</p>
            )}

            {/* Proceed */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] tracking-wide transition-all duration-200 ${loading ? "cursor-not-allowed" : "hover:opacity-95 active:scale-[0.99]"}`}
              style={{
                backgroundColor: loading ? "#9ca3af" : BRAND_PURPLE,
                boxShadow: loading ? "none" : "0 8px 24px rgba(132, 58, 127, 0.35)",
              }}
            >
              {loading ? "Creating account…" : "Proceed"}
            </button>
          </form>

          {/* Login link */}
          <Link to="/login">
            <p className="mt-6 text-sm text-center font-medium" style={{ color: "#2D2D2D" }}>
              Already have an account?{" "}
              <span className="font-extrabold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: BRAND_PURPLE }}>
                Log in
              </span>
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default SignUp;