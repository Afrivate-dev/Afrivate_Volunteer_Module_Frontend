import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";
import heroImage from "../../Assets/forgot-password-hero.png";
import globeImage from "../../Assets/signup-globe.png";

const BRAND_PURPLE = "#843A7F";

/* ═══════════════════════════════════════════════════════════
    MAIN FORGOT PASSWORD COMPONENT
══════════════════════════════════════════════════════════════ */
const ForgotPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password - AfriVate";
  }, []);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.auth.forgotPassword({ email: email.trim() });
      sessionStorage.setItem("forgotPasswordEmail", email.trim());
      navigate("/verify-otp?flow=password_reset", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err) || "Request failed. Please try again.");
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
              Turn your ambition<br />into<br />Africa's tomorrow.
            </h2>

            {/* Photo Card */}
            <div className="w-full h-[280px] sm:h-[320px] lg:h-[360px] xl:h-[400px] rounded-[28px] sm:rounded-[34px] overflow-hidden border border-white/20 shadow-xl relative bg-white/10">
              <img
                src={heroImage}
                alt="Woman learning outdoors on laptop"
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
              className="font-bold text-2xl sm:text-3xl lg:text-[32px] mb-3 text-center"
              style={{ color: BRAND_PURPLE }}
            >
              Forgot Password
            </h1>

            {/* Subtitle / Instructions */}
            <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed text-center">
              Please enter your email address. You will receive a link to create a new password via email.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full px-5 sm:px-6 py-4 sm:py-4.5 rounded-2xl text-[15px] sm:text-base outline-none transition-all duration-200 ${
                    error
                      ? "border border-red-400 bg-red-50/20 focus:ring-2 focus:ring-red-400/20"
                      : email
                      ? "bg-[#EEF3FA] border border-transparent text-gray-900 focus:bg-white focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
                      : "bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#843A7F] focus:ring-2 focus:ring-[#843A7F]/15"
                  }`}
                />
                {error && <p className="text-red-500 text-xs sm:text-sm mt-1.5 pl-1">{error}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 sm:py-4.5 rounded-2xl text-white font-bold text-base sm:text-[17px] tracking-wide shadow-[0_12px_28px_-6px_rgba(132,58,127,0.42)] transition-all duration-200 mt-3 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: BRAND_PURPLE,
                }}
              >
                {loading ? "Sending link…" : "Proceed"}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-xs sm:text-sm text-center text-gray-600 font-medium">
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

export default ForgotPassword;
