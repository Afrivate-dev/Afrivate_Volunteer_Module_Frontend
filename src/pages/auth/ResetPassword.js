import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api, { getApiErrorMessage } from '../../services/api';

const RESET_EMAIL_KEY = 'resetPasswordEmail';
const RESET_UID_KEY = 'passwordResetUid';
const RESET_TOKEN_KEY = 'passwordResetToken';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const uid = sessionStorage.getItem(RESET_UID_KEY);
    const email = sessionStorage.getItem(RESET_EMAIL_KEY);
    if (!uid && !email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const uid = sessionStorage.getItem(RESET_UID_KEY);
    const email = sessionStorage.getItem(RESET_EMAIL_KEY);
    const token = sessionStorage.getItem(RESET_TOKEN_KEY);
    if (!uid && !email) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const payload = {
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      };
      if (uid) {
        payload.uid = uid;
        if (token) payload.token = token;
      } else {
        payload.email = email;
      }
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">
          Reset Your Password
        </h1>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="newPassword"
              type="password"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
            />

            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            {serverError && (
              <p className="text-red-500 text-sm text-center">{serverError}</p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 