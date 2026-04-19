import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your email and we&apos;ll send a one-time code to reset your password.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              error={error}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send code"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              Go Back To Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 