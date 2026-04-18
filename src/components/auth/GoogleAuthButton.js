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
  role: signupRole = 'pathfinder',
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
      const data = await api.googleAuthWithRole({
        idToken,
        mode,
        role: signupRole,
      });
      if (data?.access) {
        api.setTokens(data.access, data.refresh);
        if (data.role === 'enabler' || data.role === 'pathfinder') {
          api.setRole(data.role);
        }
        let detectedRole = api.getRole();
        if (!detectedRole || (detectedRole !== 'enabler' && detectedRole !== 'pathfinder')) {
          detectedRole = null;
          try {
            const enabler = await api.profile.enablerGet();
            if (enabler && enabler.id != null) {
              api.setRole('enabler');
              detectedRole = 'enabler';
            }
          } catch (enablerErr) {
            if (enablerErr.status !== 403 && enablerErr.status !== 404) {
              const msg = api.getApiErrorMessage(enablerErr) || 'Could not load your profile';
              if (onErrorProp) onErrorProp(msg);
              return;
            }
          }
          if (!detectedRole) {
            try {
              const pathfinder = await api.profile.pathfinderGet();
              if (pathfinder && pathfinder.id != null) {
                api.setRole('pathfinder');
                detectedRole = 'pathfinder';
              }
            } catch (pathfinderErr) {
              const msg = api.getApiErrorMessage(pathfinderErr) || 'Could not load your profile';
              if (onErrorProp)
                onErrorProp(
                  pathfinderErr.status === 403
                    ? msg || 'Access denied. This account does not have pathfinder access.'
                    : msg
                );
              return;
            }
          }
        }
        if (!detectedRole) {
          if (onErrorProp) onErrorProp('Could not determine your account type. Please contact support.');
          return;
        }
        await refetchUser();
        if (mode === 'signup') {
          if (detectedRole === 'enabler') {
            navigate('/enabler/profile-setup');
          } else {
            navigate('/pathfinder/profile-setup');
          }
        } else {
          navigate(detectedRole === 'enabler' ? '/enabler/dashboard' : '/pathf');
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
        title="Create a Web OAuth client in Google Cloud Console and set REACT_APP_GOOGLE_CLIENT_ID in .env, then restart npm start"
      >
        {buttonText} — add REACT_APP_GOOGLE_CLIENT_ID to .env
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
