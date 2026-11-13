import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OTPInput from "../../components/auth/OTPInput";
import api, { getApiErrorMessage } from "../../services/api";
import { useUser } from "../../context/UserContext";

const BRAND_PURPLE = "#843A7F";
const REG_EMAIL_KEY = "registrationEmail";
const REG_ROLE_KEY = "registrationRole";
const FORGOT_EMAIL_KEY = "forgotPasswordEmail";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetchUser } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const flow = useMemo(() => {
    const q = (searchParams.get("flow") || "").toLowerCase();
    if (q === "registration" || q === "password_reset") return q;
    if (sessionStorage.getItem(FORGOT_EMAIL_KEY)) return "password_reset";
    if (sessionStorage.getItem(REG_EMAIL_KEY)) return "registration";
    return "password_reset";
  }, [searchParams]);

  const email =
    flow === "registration"
      ? sessionStorage.getItem(REG_EMAIL_KEY) || ""
      : sessionStorage.getItem(FORGOT_EMAIL_KEY) || "";

  useEffect(() => {
    document.title =
      flow === "registration" ? "Verify Email - AfriVate" : "Verify OTP - AfriVate";
  }, [flow]);

  const handleOTPComplete = async (otp) => {
    setOtpValue(otp);
    submitOtp(otp);
  };

  const submitOtp = async (otpToSubmit) => {
    const code = otpToSubmit || otpValue;
    if (!code || code.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!email) {
      setError(
        flow === "registration"
          ? "Session expired. Please sign up again."
          : "Email missing. Please restart from Forgot Password."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (flow === "registration") {
        const data = await api.auth.verifyOtp({ email, otp: String(code) });
        if (data?.access) {
          api.setTokens(data.access, data.refresh);
          const roleFromApi =
            (typeof data.role === "string" && data.role) ||
            sessionStorage.getItem(REG_ROLE_KEY) ||
            "pathfinder";
          api.setRole(
            roleFromApi === "enabler" || roleFromApi === "pathfinder"
              ? roleFromApi
              : "pathfinder"
          );
          sessionStorage.removeItem(REG_EMAIL_KEY);
          sessionStorage.removeItem(REG_ROLE_KEY);
          await refetchUser();
          navigate(
            api.getRole() === "enabler"
              ? "/enabler/profile-setup"
              : "/pathfinder/profile-setup",
            { replace: true }
          );
          return;
        }
        setError("Verification succeeded but no session token was received. Please log in.");
        return;
      }

      const data = await api.auth.verifyPasswordResetOtp({ email, otp: String(code) });
      const uid = data?.uid ?? data?.user_uid ?? data?.reset_uid ?? data?.id ?? null;
      if (uid != null && String(uid).length > 0) sessionStorage.setItem("passwordResetUid", String(uid));
      if (data?.token) sessionStorage.setItem("passwordResetToken", String(data.token));
      sessionStorage.setItem("resetPasswordEmail", email);
      navigate("/reset-password", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err) || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSuccess(false);
    setIsResending(true);
    try {
      if (!email) return;
      if (flow === "registration") {
        await api.auth.resendOtp({ email });
      } else {
        await api.auth.forgotPassword({ email });
      }
      setResendSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err) || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-[520px] w-full bg-white rounded-[36px] sm:rounded-[44px] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] border border-gray-100/80 relative">

        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#843A7F] shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Title */}
        <h1
          className="text-center font-bold text-2xl sm:text-3xl mt-5 mb-2.5 tracking-tight"
          style={{ color: BRAND_PURPLE }}
        >
          Enter Your OTP
        </h1>

        {/* Subtitle */}
        <p className="text-center text-sm sm:text-base text-gray-500 mb-6 leading-relaxed max-w-[340px] mx-auto">
          {flow === "registration"
            ? "To complete your registration, please enter the OTP sent to your mailbox."
            : "To reset your password, please enter the OTP sent to your mailbox."}
        </p>

        {email && (
          <p className="text-center text-xs sm:text-sm font-semibold text-[#843A7F] mb-5 bg-purple-50/60 py-2 px-4 rounded-full w-fit mx-auto border border-purple-100">
            {email}
          </p>
        )}

        {/* OTP Input component */}
        <OTPInput
          length={6}
          onChange={(val) => {
            setOtpValue(val);
            if (error) setError("");
          }}
          onComplete={handleOTPComplete}
          disabled={loading}
        />

        {/* Error message */}
        {error && <p className="text-center text-xs sm:text-sm text-red-500 font-medium my-3">{error}</p>}
        {resendSuccess && (
          <p className="text-center text-xs sm:text-sm text-emerald-600 font-medium my-3">
            A new OTP code has been sent to your email.
          </p>
        )}

        {/* Proceed Button */}
        <button
          type="button"
          onClick={() => submitOtp()}
          disabled={loading || otpValue.length < 6}
          className="w-full py-4 rounded-2xl text-white font-bold text-base tracking-wide shadow-[0_12px_28px_-6px_rgba(132,58,127,0.42)] transition-all duration-200 mt-4 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: BRAND_PURPLE,
          }}
        >
          {loading ? "Verifying…" : "Proceed"}
        </button>

        {/* Resend & Back link */}
        <div className="flex flex-col items-center gap-3 mt-8 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold hover:underline disabled:opacity-50"
              style={{ color: BRAND_PURPLE }}
            >
              {isResending ? "Resending…" : "Resend code"}
            </button>
          </div>

          <Link
            to="/login"
            className="text-xs sm:text-sm text-gray-400 hover:text-[#843A7F] transition-colors font-medium mt-1"
          >
            ← Back to login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
