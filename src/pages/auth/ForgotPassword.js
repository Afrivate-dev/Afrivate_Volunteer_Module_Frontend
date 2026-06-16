import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import heroImage from "../../Assets/forgot-password-hero.png"; 
import globeImage from "../../Assets/signup-globe.png"; 

const GLOBE_IMAGE_URL = globeImage; 
const WOMAN_IMAGE_URL = heroImage; 

const BRAND_PURPLE = "#843A7F"; 
// const LIGHT_ACCENT = "#BEB5BC";

/* ═══════════════════════════════════════════════════════════
    MAIN FORGOT PASSWORD COMPONENT
══════════════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password - AfriVate";
  }, []);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.auth.forgotPassword({ email });
      sessionStorage.setItem("forgotPasswordEmail", email);
      navigate("/verify-otp?flow=password_reset", { replace: true });
    } catch (err) {
      setError(err.body?.detail || err.message || 'Request failed. Try again.');
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

        {/* Headline & Woman Image Container (Centering wrapper) */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: "1rem" }}>
          
          {/* Headline with exact Figma line breaks [INDEX] */}
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
            Turn your ambition<br />into<br />Africa’s tomorrow.
          </h2>

          {/* Woman Image Card with portrait dimensions [INDEX] */}
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
              alt="Woman working on iMac"
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

          {/* Title styled with exact mockup margins */}
          <h1
            className="text-center font-bold mb-4 font-sans"
            style={{ fontSize: "1.85rem", color: BRAND_PURPLE }}
          >
            Forgot Password
          </h1>

          {/* Description text matching Figma copy [INDEX] */}
          <p 
            className="text-center text-sm font-semibold mb-6 max-w-[280px] mx-auto leading-relaxed" 
            style={{ color: BRAND_PURPLE }}
          >
            Please enter your email address. You will receive a link to create a new password via email.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email input field */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                style={{ borderColor: "#E5E2E5" }}
                className="w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-[#BEB5BC] outline-none focus:ring-1 focus:ring-[#843A7F] focus:border-[#843A7F] transition-all"
              />
              {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
            </div>

            {/* Proceed submit button with exact branding color & shadows */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-[15px] tracking-wide transition-all duration-200 ${loading ? "cursor-not-allowed" : "hover:opacity-95 active:scale-[0.99]"}`}
              style={{
                backgroundColor: loading ? "#9ca3af" : BRAND_PURPLE,
                boxShadow: loading ? "none" : "0 8px 24px rgba(132, 58, 127, 0.35)",
              }}
            >
              {loading ? "Sending..." : "Proceed"}
            </button>
          </form>

          {/* Login navigation link */}
          <p className="mt-6 text-sm text-center font-medium" style={{ color: "#2D2D2D" }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-extrabold underline underline-offset-2 hover:opacity-80 transition"
              style={{ color: BRAND_PURPLE }}
            >
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
