import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api, { getApiErrorMessage } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

const Login = () => {
  const navigate = useNavigate();
  const { refetchUser } = useUser();

  useEffect(() => {
    document.title = "Login - AfriVate";
  }, []);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setLoading(true);
    setServerError('');
  
    try {
      const data = await api.auth.token({
        email: formData.email,
        password: formData.password,
      });
  
      if (data.access) {
        api.setTokens(data.access, data.refresh);
        let role = 'pathfinder';
        try {
          const enabler = await api.profile.enablerGet();
          if (enabler && enabler.id != null) {
            api.setRole('enabler');
            role = 'enabler';
          }
        } catch (_) {
          try {
            const pathfinder = await api.profile.pathfinderGet();
            if (pathfinder && pathfinder.id != null) api.setRole('pathfinder');
          } catch (__) {}
        }
        await refetchUser();
        navigate(role === 'enabler' ? '/enabler/dashboard' : '/pathf');
      } else {
        setServerError('Login failed');
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err) || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  


  

  return (
    <div className="bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">


      <div className="bg-gradient-to-b from-[rgba(51,0,102,1)] via-[rgba(120,50,200,0.8)] to-[rgba(182,120,255,1)] p-[2px] rounded-[15px] sm:rounded-[15px]  sm:mx-auto sm:w-full sm:max-w-md">
        
        <div className="bg-[rgba(246,246,246)]  py-8 px-7 rounded-[15px] shadow sm:rounded-[15px] sm:px-20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#45005A] mb-2">
            Login
          </h1>
          <p className="text-center text-[#45005A] font-medium">
            Welcome back! Sign in to continue your volunteering journey
          </p>
        </div>
      </div>

      <div className="mb-3 w-full">
        <GoogleAuthButton
          mode="login"
          buttonText="Login with Google"
          onError={setServerError}
          className="flex justify-center"
        />
      </div>

      <div className="relative mx-2 mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black " />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-[rgba(246,246,246)] text-black font-medium">Or</span>
              </div>
            </div>


          <form onSubmit={handleSubmit} className="space-y-6 px-2">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              
            />

            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Forgot Password?
              </Link>
            </div>

            {serverError && (
               <p className="text-red-500 text-sm text-center">{serverError}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full mt-6 py-3 rounded-full text-white font-bold text-sm">
                 {loading ? 'Logging in...' : 'Log in'}
              </Button>

            
          </form>

         

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 