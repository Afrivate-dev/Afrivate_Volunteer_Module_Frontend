import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import * as api from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * Shared Google sign-in button for Login and SignUp.
 * - For login: pass onError only (or use default).
 * - For signup: pass role = "enabler" | "pathfinder" so backend can assign role for new users.
 */
export function GoogleAuthButton({
  mode = 'login',
  role = 'pathfinder',
  buttonText = 'Continue with Google',
  onError: onErrorProp,
  className = '',
}) {
  const navigate = useNavigate();
  const { refetchUser } = useUser();

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      if (onErrorProp) onErrorProp('No credential from Google');
      return;
    }
    try {
      const body = { id_token: idToken };
      if (mode === 'signup') body.role = role;
      const data = await api.auth.google(body);
      if (data?.access) {
        api.setTokens(data.access, data.refresh);
        try {
          const enabler = await api.profile.enablerGet();
          if (enabler && enabler.id != null) api.setRole('enabler');
        } catch (_) {
          try {
            const pathfinder = await api.profile.pathfinderGet();
            if (pathfinder && pathfinder.id != null) api.setRole('pathfinder');
          } catch (__) {}
        }
        await refetchUser();
        if (mode === 'signup') {
          if (role === 'enabler') {
            navigate('/enabler/profile-setup');
          } else {
            localStorage.setItem('hasCompletedProfile', 'false');
            navigate('/edit-new-profile');
          }
        } else {
          const r = api.getRole();
          navigate(r === 'enabler' ? '/enabler/dashboard' : '/pathf');
        }
      } else if (onErrorProp) {
        onErrorProp('Sign-in succeeded but no token received');
      }
    } catch (err) {
      const msg = err.body?.detail || err.body?.message || err.message || 'Google sign-in failed';
      if (onErrorProp) onErrorProp(typeof msg === 'string' ? msg : 'Google sign-in failed');
    }
  };

  const handleError = () => {
    if (onErrorProp) onErrorProp('Google sign-in was cancelled or failed');
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div
        className={`flex items-center justify-center w-full py-4 rounded-[15px] border border-gray-300 bg-gray-50 text-gray-500 text-sm ${className}`}
        title="Set REACT_APP_GOOGLE_CLIENT_ID to enable"
      >
        {buttonText} (not configured)
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        width="100%"
        containerProps={{ style: { width: '100%', justifyContent: 'center' } }}
      />
    </div>
  );
}

export default GoogleAuthButton;
