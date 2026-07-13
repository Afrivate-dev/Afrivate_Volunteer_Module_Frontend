import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, User } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";
import { GoogleAuthButton } from "../../components/auth/GoogleAuthButton";
import PasswordRequirements, { isPasswordValid } from "../../components/common/PasswordRequirements";
import heroImage  from "../../Assets/signup-hero.png";
import globeImage from "../../Assets/signup-globe.png";

const GLOBE_IMAGE_URL = globeImage; 
const WOMAN_IMAGE_URL = heroImage; 

const BRAND_PURPLE = "#843A7F";

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
    username: "",
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

    if (!formData.username)
      e.username = "Username is required";
    else if (formData.username.length < 3)
      e.username = "Username must be at least 3 characters";
    else if (formData.username.length > 30)
      e.username = "Username must be 30 characters or less";
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      e.username = "Only letters, numbers, and underscores allowed";

    if (!formData.email)
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Email is invalid";
    else if (formData.email.length > 50)
      e.email = "Email must be less than 50 characters";

    if (!formData.password)
      e.password = "Password is required";
    else if (!isPasswordValid(formData.password))
      e.password = "Password doesn't meet all the requirements below";

    if (!formData.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";

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

      const regRes = await api.auth.register({
        username: formData.username,
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
            className="text-center font-extrabold mb-1"
            style={{ fontSize: "1.75rem", color: "#1a1a1a" }}
          >
            Create account
          </h1>
          <p className="text-center text-gray-400 text-sm mb-5">Join AfriVate — shape your future.</p>

          {/* Gmail button — shared component; uses the currently selected
              role toggle so new Google accounts get the right role */}
          <div className="w-full mb-5">
            <GoogleAuthButton
              mode="signup"
              role={formData.userType === "enabler" ? "enabler" : "pathfinder"}
              buttonText="Continue with Google"
              onError={setServerError}
            />
          </div>

          {/* Or divider */}
          <div style={{ position: "relative", marginBottom: "1.25rem" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid #E5E2E5" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <span style={{ backgroundColor: "white", padding: "0 1rem" }} className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                OR
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* I am joining as... + Role toggle */}
            <div>
              <p className="text-sm text-gray-500 mb-2">I am joining as a...</p>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  width: "100%",
                  backgroundColor: "#F5F0F5",
                  borderRadius: "0.75rem",
                  padding: "4px"
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute", top: 4, bottom: 4,
                    width: "calc(50% - 4px)",
                    borderRadius: "0.6rem",
                    background: BRAND_PURPLE,
                    boxShadow: "0 2px 8px rgba(132,58,127,0.25)",
                    transform: formData.userType === "pathfinder" ? "translateX(0)" : "translateX(calc(100% + 4px))",
                    transition: "transform 0.3s ease-in-out",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRoleChange("pathfinder")}
                  style={{ position: "relative", flex: 1, zIndex: 1, borderRadius: "0.6rem" }}
                  className={`py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none ${formData.userType === "pathfinder" ? "text-white" : "text-gray-500"}`}
                >
                  <User size={14} strokeWidth={2} />
                  Pathfinder
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("enabler")}
                  style={{ position: "relative", flex: 1, zIndex: 1, borderRadius: "0.6rem" }}
                  className={`py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none ${formData.userType === "enabler" ? "text-white" : "text-gray-500"}`}
                >
                  <User size={14} strokeWidth={2} />
                  Enabler
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                style={{ borderColor: errors.username ? "#ef4444" : "#E5E2E5" }}
                className="w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-[#BEB5BC] outline-none focus:ring-1 focus:ring-[#843A7F] focus:border-[#843A7F] transition-all"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1 pl-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                style={{ borderColor: errors.email ? "#ef4444" : "#E5E2E5" }}
                className="w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-[#BEB5BC] outline-none focus:ring-1 focus:ring-[#843A7F] focus:border-[#843A7F] transition-all"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <PasswordField
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <PasswordRequirements password={formData.password} />
            </div>

            {/* Confirm Password */}
            <PasswordField
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            {/* Server error */}
            {serverError && (
              <p className="text-red-500 text-center text-sm font-semibold">{serverError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] transition-all duration-200 ${loading ? "cursor-not-allowed" : "hover:opacity-95 active:scale-[0.99]"}`}
              style={{
                backgroundColor: loading ? "#9ca3af" : BRAND_PURPLE,
                boxShadow: loading ? "none" : "0 8px 24px rgba(132, 58, 127, 0.35)",
              }}
            >
              {loading ? "Creating account…" : "Create account"}
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
