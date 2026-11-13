import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import api, { getApiErrorMessage } from "../../services/api";

const BRAND_PURPLE = "#843A7F";
const RESET_EMAIL_KEY = "resetPasswordEmail";
const RESET_UID_KEY = "passwordResetUid";
const RESET_TOKEN_KEY = "passwordResetToken";

const PasswordField = ({ label, name, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  const isFilled = Boolean(value && value.length > 0);

  return (
    <div>
      {label && <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 pl-0.5">{label}</label>}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: "3rem" }}
          className={`w-full px-5 py-4 rounded-2xl text-[15px] sm:text-base outline-none transition-all duration-200 ${
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
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#843A7F] transition-colors focus:outline-none"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs sm:text-sm mt-1.5 pl-1">{error}</p>}
    </div>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset Password - AfriVate";
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!token) {
      const isDev = process.env.NODE_ENV === "development";
      if (!isDev) {
        navigate("/forgot-password", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const uid = sessionStorage.getItem(RESET_UID_KEY);
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);

    if (!token) {
      setServerError("Reset token missing or expired. Please request a new link.");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const payload = {
        token,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      };
      if (uid) payload.uid = uid;

      await api.auth.resetPassword(payload);

      sessionStorage.removeItem(RESET_EMAIL_KEY);
      sessionStorage.removeItem(RESET_UID_KEY);
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      sessionStorage.removeItem("forgotPasswordEmail");

      navigate("/login", { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err) || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
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
          className="text-center font-bold text-2xl sm:text-3xl mt-5 mb-8 tracking-tight"
          style={{ color: BRAND_PURPLE }}
        >
          Reset Your Password
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordField
            label="New Password"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {serverError && (
            <p className="text-red-500 text-xs sm:text-sm font-semibold text-center pt-1">{serverError}</p>
          )}

          {/* Done Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-base tracking-wide shadow-[0_12px_28px_-6px_rgba(132,58,127,0.42)] transition-all duration-200 mt-8 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: BRAND_PURPLE,
            }}
          >
            {loading ? "Saving…" : "Done"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ResetPassword;
