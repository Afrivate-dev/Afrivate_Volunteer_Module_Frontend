import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";
import api, { getApiErrorMessage, getRole } from "../../services/api";

/**
 * For Google (or other) accounts without a password: POST /auth/set-password/ while logged in.
 */
const SetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Set password - AfriVate";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setServerError("");
    try {
      await api.auth.setPassword({
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });
      const r = getRole();
      navigate(r === "enabler" ? "/enabler/settings" : "/edit-new-profile", { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">Set a password</h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Add a password to your account so you can sign in with email as well as Google.
        </p>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput
              name="newPassword"
              placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
            />
            <PasswordInput
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save password"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to={getRole() === "enabler" ? "/enabler/settings" : "/pathf"} className="text-purple-600">
              Skip for now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
