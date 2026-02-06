import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from '../../components/common/Input';
import api, { getApiErrorMessage } from '../../services/api';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up - AfriVate";
  }, []);

  const [formData, setFormData] = useState({
    userType: "freelancer", // default
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    } else if (formData.email.length > 50) {
      newErrors.email = "Email must be less than 50 characters";
    }

    if (!formData.userType) {
      newErrors.userType = "Please select a role";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, userType: role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      const role = formData.userType === "pathfinder" ? "pathfinder" : "enabler";

      await api.auth.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        role,
      });

      try {
        const tokenData = await api.auth.token({
          email: formData.email,
          password: formData.password
        });
        if (tokenData.access) {
          api.setTokens(tokenData.access, tokenData.refresh);
        }
      } catch (_) {}

      localStorage.setItem('hasCompletedProfile', 'false');

      if (role === "enabler") {
        localStorage.setItem('hasCompletedEnablerProfile', 'false');
        navigate('/enabler/profile-setup');
      } else {
        navigate('/edit-new-profile');
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err) || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-5 py-2 sm:px-8 lg:px-10">
      <div className="sm:px-20 max-w-md w-full mx-auto bg-[rgba(246,246,246)] p-8 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-[#45005A] to-[#B678FF] bg-clip-text text-transparent mb-2">
            Sign Up
          </h1>
          <p className="text-center text-gray-600 text-sm">
            Create your account and start your volunteering journey with AfriVate
          </p>
        </div>

        <div className="mb-3 w-full">
          <GoogleAuthButton
            mode="signup"
            role={formData.userType === 'employer' ? 'enabler' : 'pathfinder'}
            buttonText="Sign up with Google"
            onError={setServerError}
            className="flex justify-center"
          />
        </div>

        <div className="relative mx-2 mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-6 bg-[rgba(246,246,246)] text-black font-medium">
              Or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}

          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

          <div className="relative flex w-full bg-gray-200 rounded-2xl overflow-hidden">
            <div
              className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-[#45005A] to-[#B678FF] transition-transform duration-300 rounded-2xl ${
                formData.userType === "pathfinder"
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            />
            <button
              type="button"
              onClick={() => handleRoleChange("pathfinder")}
              className={`relative flex-1 py-3 z-10 text-xs ${
                formData.userType === "pathfinder"
                  ? "text-white"
                  : "text-[#002060]"
              }`}
            >
              <i class="fas fa-regular fa-user-circle text-base mr-1"></i>AS PATHFINDER
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("enabler")}
              className={`relative flex-1 py-3 z-10 text-xs ${
                formData.userType === "enabler"
                  ? "text-white"
                  : "text-[#002060]"
              }`}
            >
              <i class="fas fa-regular fa-user-circle text-base mr-1"></i>AS ENABLER
            </button>
          </div>

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

          <Input
            type="password"
            name="confirmPassword"
            placeholder="Repeat Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

          {serverError && (
            <p className="text-red-500 text-center text-sm font-semibold">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-full text-white font-bold text-lg ${
              loading ? 'bg-gray-400' : 'bg-[#6A00B1]'
            }`}
          >
            {loading ? 'Creating account...' : 'Proceed'}
          </button>
        </form>

        <Link to="/login">
          <p className="mt-8 text-sm text-black text-center">
            Already have an account?{" "}
            <span className="text-[#012B52] font-semibold">Log in</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
