import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPInput from '../../components/auth/OTPInput';
import api from '../../services/api';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = sessionStorage.getItem('forgotPasswordEmail') || '';

  const handleOTPComplete = async (otp) => {
    if (!email) {
      setError('Email missing. Please start from Forgot Password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.auth.verifyOtp({ email, otp: String(otp) });
      sessionStorage.setItem('resetPasswordEmail', email);
      navigate('/reset-password');
    } catch (err) {
      setError(err.body?.detail || err.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsResending(true);
    try {
      if (email) await api.auth.forgotPassword({ email });
    } catch (_) {}
    setIsResending(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">
          Enter Your OTP
        </h1>
        <p className="text-center text-gray-600 mb-8">
          To reset your password, please Enter the OTP sent to your mail box.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              disabled={loading}
            />

            {error && (
              <p className="text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Didn't receive the OTP?
              </p>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm font-medium text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Resending...' : 'Resend'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Report Problem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP; 
