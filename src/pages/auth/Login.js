import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import heroImage from "../../Assets/login-hero.png";
import globeImage from "../../Assets/signup-globe.png"; 

const GLOBE_IMAGE_URL = globeImage; 
const MAN_IMAGE_URL = heroImage; 

const BRAND_PURPLE = "#843A7F"; 
// const LIGHT_ACCENT = "#BEB5BC";

/* ─────────────────────────────────────────────────────────────
    Password field with toggle eye
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
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#843A7F] focus:ring-1 focus:ring-[#843A7F] transition-all"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          className="text-gray-400 hover:text-[#843A7F] transition-colors focus:outline-none"
        >
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LIGHT_ACCENT} strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LIGHT_ACCENT} strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
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
    email: '',
    password: '',
    rememberMe: false
  });

  const [userType, setUserType] = useState("freelancer");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email or username is required';
    if (!formData.password) newErrors.password = 'Password is required';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setLoading(true);
    setServerError('');
  
    try {
      const data = await api.auth.login({
        username_or_email: formData.email.trim(),
        password: formData.password,
      });

      if (data.access) {
        api.setTokens(data.access, data.refresh);

        const normalizedRole = (data.user?.role || data.role || '').toLowerCase();
        if (normalizedRole === 'enabler' || normalizedRole === 'pathfinder') {
          api.setRole(normalizedRole);
        }

        let role =
          api.getRole() === 'enabler' || api.getRole() === 'pathfinder'
            ? api.getRole()
            : null;

        if (!role) {
          try {
            const enabler = await api.profile.enablerGet();
            if (enabler && enabler.id != null) {
              api.setRole('enabler');
              role = 'enabler';
            }
          } catch (enablerErr) {
            if (enablerErr.status !== 403 && enablerErr.status !== 404) {
              setServerError(getApiErrorMessage(enablerErr) || 'Login failed');
              setLoading(false);
              return;
            }
          }
        }

        if (!role) {
          try {
            const pathfinder = await api.profile.pathfinderGet();
            if (pathfinder && pathfinder.id != null) {
              api.setRole('pathfinder');
              role = 'pathfinder';
            }
          } catch (pathfinderErr) {
            const msg = getApiErrorMessage(pathfinderErr) || 'Could not load your profile.';
            setServerError(pathfinderErr.status === 403 ? (msg || 'Access denied. This account does not have pathfinder access.') : msg);
            setLoading(false);
            return;
          }
        }

        if (!role) {
          api.setRole('pathfinder');
          role = 'pathfinder';
        }

        await refetchUser();
        navigate(role === 'enabler' ? '/enabler/dashboard' : '/pathf');
      } else {
        setServerError('Login failed');
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err) || 'Login failed');
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BRAND_PURPLE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Headline & Man Image Container (Centering wrapper) */}
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
            Your potential,<br />amplified by technology.
          </h2>

          {/* Man Image Card with proper portrait dimensions [INDEX] */}
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
              src={MAN_IMAGE_URL}
              alt="Man using phone"
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

        {/* Globe image centered, pushed 140px down to hide the bottom quarter [INDEX] */}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND_PURPLE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Title */}
          <h1
            className="text-center font-extrabold uppercase mb-6"
            style={{ fontSize: "1.85rem", letterSpacing: "0.15em", color: BRAND_PURPLE }}
          >
            Login
          </h1>

          {/* Google / Gmail button */}
          <div className="w-full mb-5">
            <GoogleAuthButton
              mode="login"
              buttonText="Login with Gmail"
              onError={setServerError}
              style={{ borderColor: "#E5E2E5" }}
              className="w-full flex items-center justify-between px-5 py-3.5 border rounded-full bg-white hover:bg-gray-50 active:bg-gray-100 transition shadow-sm font-bold"
            />
          </div>

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

            {/* Email / Username field */}
            <div>
              <label style={{ color: LIGHT_ACCENT }} className="block text-xs font-bold mb-1 pl-1">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={handleChange}
                style={{ borderColor: "#E5E2E5" }}
                className="w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-[#BEB5BC] outline-none focus:ring-1 focus:ring-[#843A7F] focus:border-[#843A7F] transition-all"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 pl-1">{errors.email}</p>}
            </div>

            {/* Role toggle container styled with rectangular rounded corners [INDEX] */}
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
                  transform: userType === "freelancer" ? "translateX(0)" : "translateX(calc(100% + 4px))",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
              <button
                type="button"
                onClick={() => setUserType("freelancer")}
                style={{ position: "relative", flex: 1, zIndex: 1, borderRadius: "0.5rem" }}
                className={`py-2.5 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200 focus:outline-none ${userType === "freelancer" ? "text-white" : LIGHT_ACCENT}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                AS FREELANCER
              </button>
              <button
                type="button"
                onClick={() => setUserType("enabler")}
                style={{ position: "relative", flex: 1, zIndex: 1, borderRadius: "0.5rem" }}
                className={`py-2.5 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors duration-200 focus:outline-none ${userType === "enabler" ? "text-white" : LIGHT_ACCENT}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
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

            {/* Remember me row & Forgot Password */}
            <div className="flex items-center justify-between">
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

              <Link
                to="/forgot-password"
                className="text-sm font-semibold hover:opacity-85 transition"
                style={{ color: BRAND_PURPLE }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Server Error display */}
            {serverError && (
              <p className="text-red-500 text-center text-sm font-semibold">{serverError}</p>
            )}

            {/* Proceed Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] tracking-wide transition-all duration-200 ${loading ? "cursor-not-allowed" : "hover:opacity-95 active:scale-[0.99]"}`}
              style={{
                backgroundColor: loading ? "#9ca3af" : BRAND_PURPLE,
                boxShadow: loading ? "none" : "0 8px 24px rgba(132, 58, 127, 0.35)",
              }}
            >
              {loading ? 'Logging in...' : 'Proceed'}
            </button>
          </form>

          {/* Sign up Link */}
          <p className="mt-6 text-sm text-center font-medium" style={{ color: "#2D2D2D" }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-extrabold underline underline-offset-2 hover:opacity-80 transition"
              style={{ color: BRAND_PURPLE }}
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
