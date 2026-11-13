import React, { useRef, useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ArrowRight } from 'lucide-react';
import * as api from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

/**
 * Shared Google sign-in button for Login and SignUp.
 * - For login: pass onError only (or use default).
 * - For signup: pass role = "enabler" | "pathfinder" so backend can assign role for new users.
 */
export function GoogleAuthButton({
  mode = 'login',
  role: signupRole = 'pathfinder',
  buttonText = 'Login with Gmail',
  onError: onErrorProp,
  className = '',
  style = {},
}) {
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setButtonWidth(Math.floor(w));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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
        const normalizedRole = (data.user?.role || data.role || '').toLowerCase();
        if (normalizedRole === 'enabler' || normalizedRole === 'pathfinder') {
          api.setRole(normalizedRole);
        }
        let detectedRole = api.getRole();
        if (!detectedRole || (detectedRole !== 'enabler' && detectedRole !== 'pathfinder')) {
          detectedRole = null;
        }

        let profileExists = false;

        if (!detectedRole) {
          try {
            const enabler = await api.profile.enablerGet();
            if (enabler && enabler.id != null) {
              api.setRole('enabler');
              detectedRole = 'enabler';
              profileExists = true;
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
                profileExists = true;
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
        } else {
          try {
            const profileData = detectedRole === 'enabler'
              ? await api.profile.enablerGet()
              : await api.profile.pathfinderGet();
            profileExists = !!(profileData && profileData.id != null);
          } catch (_) {
            profileExists = false;
          }
        }

        if (!detectedRole) {
          if (onErrorProp) onErrorProp('Could not determine your account type. Please contact support.');
          return;
        }

        await refetchUser();

        if (mode === 'signup') {
          navigate(detectedRole === 'enabler' ? '/enabler/profile-setup' : '/pathfinder/profile-setup');
        } else {
          if (!profileExists) {
            navigate(detectedRole === 'enabler' ? '/enabler/profile-setup' : '/pathfinder/profile-setup');
          } else {
            navigate(detectedRole === 'enabler' ? '/enabler/dashboard' : '/pathf');
          }
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
      <button
        type="button"
        onClick={() => {
          if (onErrorProp) {
            onErrorProp('Google sign-in is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your environment.');
          }
        }}
        className={`w-full flex items-center justify-between px-5 py-3 border border-gray-200/90 rounded-2xl bg-white hover:bg-gray-50/80 active:bg-gray-100 transition shadow-sm text-sm font-semibold text-gray-700 ${className}`}
        style={style}
      >
        <div className="flex items-center gap-3">
          <GoogleIcon />
          <span>{buttonText}</span>
        </div>
        <ArrowRight size={18} className="text-[#843A7F]" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`} style={{ width: '100%', ...style }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        size="large"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        shape="pill"
        width={buttonWidth}
        containerProps={{ style: { width: '100%' } }}
      />
    </div>
  );
}

export default GoogleAuthButton;
