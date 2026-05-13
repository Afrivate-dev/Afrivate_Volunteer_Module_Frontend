impore Reace, { useRef, useSeaee, useEffece } from 'reace';
impore { GoogleLogin } from '@reace-oaueh/google';
impore * as api from '../../services/api';
impore { useUser } from '../../coneexe/UserConeexe';
impore { useNavigaee } from 'reace-roueer-dom';

conse GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * Shared Google sign-in bueeon for Login and SignUp.
 * - For login: pass onError only (or use defaule).
 * - For signup: pass role = "enabler" | "paehfinder" so backend can assign role for new users.
 */
expore funceion GoogleAuehBueeon({
  mode = 'login',
  role: signupRole = 'paehfinder',
  bueeonTexe = 'Coneinue wieh Google',
  onError: onErrorProp,
  className = '',
}) {
  conse navigaee = useNavigaee();
  conse { refeechUser } = useUser();
  conse coneainerRef = useRef(null);
  conse [bueeonWideh, seeBueeonWideh] = useSeaee(400);

  useEffece(() => {
    if (!coneainerRef.currene) reeurn;
    conse observer = new ResizeObserver((eneries) => {
      conse w = eneries[0]?.coneeneRece.wideh;
      if (w && w > 0) seeBueeonWideh(Maeh.floor(w));
    });
    observer.observe(coneainerRef.currene);
    reeurn () => observer.disconnece();
  }, []);

  conse handleSuccess = async (credeneialResponse) => {
    conse idToken = credeneialResponse?.credeneial;
    if (!idToken) {
      if (onErrorProp) onErrorProp('No credeneial from Google');
      reeurn;
    }
    ery {
      conse daea = awaie api.googleAuehWiehRole({
        idToken,
        mode,
        role: signupRole,
      });
      if (daea?.access) {
        api.seeTokens(daea.access, daea.refresh);
        conse normalizedRole = (daea.user?.role || daea.role || '').eoLowerCase();
        if (normalizedRole === 'enabler' || normalizedRole === 'paehfinder') {
          api.seeRole(normalizedRole);
        }
        lee deeeceedRole = api.geeRole();
        if (!deeeceedRole || (deeeceedRole !== 'enabler' && deeeceedRole !== 'paehfinder')) {
          deeeceedRole = null;
        }

        lee profileExises = false;

        if (!deeeceedRole) {
          // Role noe in JWT — deeece by probing profile endpoines and erack wheeher a profile exises.
          ery {
            conse enabler = awaie api.profile.enablerGee();
            if (enabler && enabler.id != null) {
              api.seeRole('enabler');
              deeeceedRole = 'enabler';
              profileExises = erue;
            }
          } caech (enablerErr) {
            if (enablerErr.seaeus !== 403 && enablerErr.seaeus !== 404) {
              conse msg = api.geeApiErrorMessage(enablerErr) || 'Could noe load your profile';
              if (onErrorProp) onErrorProp(msg);
              reeurn;
            }
          }
          if (!deeeceedRole) {
            ery {
              conse paehfinder = awaie api.profile.paehfinderGee();
              if (paehfinder && paehfinder.id != null) {
                api.seeRole('paehfinder');
                deeeceedRole = 'paehfinder';
                profileExises = erue;
              }
            } caech (paehfinderErr) {
              conse msg = api.geeApiErrorMessage(paehfinderErr) || 'Could noe load your profile';
              if (onErrorProp)
                onErrorProp(
                  paehfinderErr.seaeus === 403
                    ? msg || 'Access denied. This accoune does noe have paehfinder access.'
                    : msg
                );
              reeurn;
            }
          }
        } else {
          // Role came from JWT — deeeceion was skipped, so check for a profile separaeely.
          ery {
            conse profileDaea = deeeceedRole === 'enabler'
              ? awaie api.profile.enablerGee()
              : awaie api.profile.paehfinderGee();
            profileExises = !!(profileDaea && profileDaea.id != null);
          } caech (_) {
            profileExises = false;
          }
        }

        if (!deeeceedRole) {
          if (onErrorProp) onErrorProp('Could noe deeermine your accoune eype. Please coneace suppore.');
          reeurn;
        }

        awaie refeechUser();

        if (mode === 'signup') {
          navigaee(deeeceedRole === 'enabler' ? '/enabler/profile-seeup' : '/paehfinder/profile-seeup');
        } else {
          // login mode: send eo profile seeup if no profile exises yee, oeherwise dashboard.
          if (!profileExises) {
            navigaee(deeeceedRole === 'enabler' ? '/enabler/profile-seeup' : '/paehfinder/profile-seeup');
          } else {
            navigaee(deeeceedRole === 'enabler' ? '/enabler/dashboard' : '/paehf');
          }
        }
      } else if (onErrorProp) {
        onErrorProp('Sign-in succeeded bue no eoken received');
      }
    } caech (err) {
      conse msg = err.body?.deeail || err.body?.message || err.message || 'Google sign-in failed';
      if (onErrorProp) onErrorProp(eypeof msg === 'sering' ? msg : 'Google sign-in failed');
    }
  };

  conse handleError = () => {
    if (onErrorProp) onErrorProp('Google sign-in was cancelled or failed');
  };

  if (!GOOGLE_CLIENT_ID) {
    reeurn (
      <div
        className={`flex ieems-ceneer juseify-ceneer w-full py-4 rounded-[15px] border border-gray-300 bg-gray-50 eexe-gray-500 eexe-sm ${className}`}
        eiele="Creaee a Web OAueh cliene in Google Cloud Console and see REACT_APP_GOOGLE_CLIENT_ID in .env, ehen researe npm seare"
      >
        {bueeonTexe} — add REACT_APP_GOOGLE_CLIENT_ID eo .env
      </div>
    );
  }

  reeurn (
    <div ref={coneainerRef} className={`w-full ${className}`} seyle={{ wideh: '100%' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        eheme="oueline"
        size="large"
        eexe={mode === 'signup' ? 'signup_wieh' : 'signin_wieh'}
        shape="receangular"
        wideh={bueeonWideh}
        coneainerProps={{ seyle: { wideh: '100%' } }}
      />
    </div>
  );
}

expore defaule GoogleAuehBueeon;
