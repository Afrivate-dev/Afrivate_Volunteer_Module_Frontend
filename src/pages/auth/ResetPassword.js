import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../services/api';
import PasswordRequirements, { isPasswordValid } from '../../components/common/PasswordRequirements';

const RESET_EMAIL_KEY = 'resetPasswordEmail';
const RESET_UID_KEY = 'passwordResetUid';
const RESET_TOKEN_KEY = 'passwordResetToken';

const PasswordField = ({ name, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <input type={show ? "text" : "password"} name={name} placeholder={placeholder}
          value={value} onChange={onChange} style={{ paddingRight: "2.75rem" }}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#8D4087] focus:border-[#8D4087] transition-all" />
        <button type="button" tabIndex={-1} onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8D4087] transition-colors focus:outline-none">
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
    </div>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Reset Password - AfriVate";
    // The single-use reset token from the verify-OTP step is required by the
    // backend — without it the reset cannot succeed, so restart the flow.
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!token) navigate('/forgot-password', { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (!isPasswordValid(formData.newPassword)) newErrors.newPassword = "Password doesn't meet all the requirements below";
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const uid = sessionStorage.getItem(RESET_UID_KEY);
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!token) { navigate('/forgot-password', { replace: true }); return; }
    setLoading(true);
    setServerError('');
    try {
      const payload = { token, new_password: formData.newPassword, confirm_password: formData.confirmPassword };
      if (uid) payload.uid = uid;
      await api.auth.resetPassword(payload);
      sessionStorage.removeItem(RESET_EMAIL_KEY);
      sessionStorage.removeItem(RESET_UID_KEY);
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      sessionStorage.removeItem('forgotPasswordEmail');
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err) || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Reset your password</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Enter a new password for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <PasswordField name="newPassword" placeholder="New password" value={formData.newPassword} onChange={handleChange} error={errors.newPassword} />
            <PasswordRequirements password={formData.newPassword} />
          </div>
          <PasswordField name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed"
            style={{ backgroundColor: loading ? "#9ca3af" : "#843A7F", boxShadow: loading ? "none" : "0 8px 24px rgba(132,58,127,0.35)" }}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
