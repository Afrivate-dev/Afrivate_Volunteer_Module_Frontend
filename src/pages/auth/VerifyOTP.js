import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import OTPInput from "../../components/auth/OTPInput";
import api, { getApiErrorMessage } from "../../services/api";
import { useUser } from "../../context/UserContext";

const REG_EMAIL_KEY = "registrationEmail";
const REG_ROLE_KEY = "registrationRole";
const FORGOT_EMAIL_KEY = "forgotPasswordEmail";

/**
 * Two flows (query ?flow=):
 * - registration — POST /auth/register/ then POST /auth/verify-otp/; resend via POST /auth/resend-otp/
 * - password_reset — POST /auth/forgot-password/ then POST /auth/verify-password-reset-otp/; resend via forgot-password again
 *
 * If `flow` is omitted: password_reset when forgot email exists in session, else registration when registration email exists.
 */
const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetchUser } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
      flow === "registration" ? "Verify email - AfriVate" : "Verify OTP - AfriVate";
  }, [flow]);

  const title =
    flow === "registration" ? "Verify your email" : "Enter your OTP";
  const subtitle =
    flow === "registration"
      ? "Enter the 6-digit code we sent to your email to finish signing up."
      : "Enter the 6-digit code we sent to your email to reset your password.";

  const handleOTPComplete = async (otp) => {
    if (!email) {
      setError(
        flow === "registration"
          ? "Session expired. Please sign up again."
          : "Email missing. Start from Forgot Password."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (flow === "registration") {
        const data = await api.auth.verifyOtp({
          email,
          otp: String(otp),
        });
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
        setError("Verification succeeded but no tokens were returned. Try logging in.");
        return;
      }

      const data = await api.auth.verifyPasswordResetOtp({
        email,
        otp: String(otp),
      });
      const uid =
        data?.uid ??
        data?.user_uid ??
        data?.reset_uid ??
        data?.id ??
        null;
      if (uid != null && String(uid).length > 0) {
        sessionStorage.setItem("passwordResetUid", String(uid));
      }
      if (data?.token) {
        sessionStorage.setItem("passwordResetToken", String(data.token));
      }
      sessionStorage.setItem("resetPasswordEmail", email);
      navigate("/reset-password", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsResending(true);
    try {
      if (!email) return;
      if (flow === "registration") {
        await api.auth.resendOtp({ email });
      } else {
        await api.auth.forgotPassword({ email });
      }
    } catch (_) {
      /* still show generic message */
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <h1 className="text-2xl font-bold text-purple-900 mb-2">Verification</h1>
          <p className="text-gray-600 mb-6">
            {flow === "registration"
              ? "Start from the sign-up page to receive a code."
              : "Start from Forgot Password to receive a code."}
          </p>
          <Link
            to={flow === "registration" ? "/signup" : "/forgot-password"}
            className="text-purple-600 font-medium hover:text-purple-500"
          >
            {flow === "registration" ? "Go to Sign up" : "Go to Forgot Password"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">{title}</h1>
        <p className="text-center text-gray-600 mb-2">{subtitle}</p>
        <p className="text-center text-sm text-gray-500 mb-8">{email}</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <OTPInput length={6} onComplete={handleOTPComplete} disabled={loading} />

            {error && <p className="text-center text-sm text-red-600">{error}</p>}

            {flow === "password_reset" ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Didn&apos;t receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm font-medium text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Didn&apos;t receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm font-medium text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              </div>
            )}

            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-purple-600">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
