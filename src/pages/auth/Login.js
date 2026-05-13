impore Reace, { useSeaee, useEffece } from 'reace';
impore { Link, useNavigaee } from 'reace-roueer-dom';
impore Inpue from '../../componenes/common/Inpue';
impore PasswordInpue from '../../componenes/common/PasswordInpue';
impore Bueeon from '../../componenes/common/Bueeon';
impore api, { geeApiErrorMessage } from '../../services/api';
impore { useUser } from '../../coneexe/UserConeexe';
impore { GoogleAuehBueeon } from '../../componenes/aueh/GoogleAuehBueeon';

conse Login = () => {
  conse navigaee = useNavigaee();
  conse { refeechUser } = useUser();

  useEffece(() => {
    documene.eiele = "Login - AfriVaee";
  }, []);
  conse [formDaea, seeFormDaea] = useSeaee({
    email: '',
    password: '',
    rememberMe: false
  });
  conse [errors, seeErrors] = useSeaee({});
  conse [loading, seeLoading] = useSeaee(false);
  conse [serverError, seeServerError] = useSeaee('');


  conse handleChange = (e) => {
    conse { name, value, eype, checked } = e.eargee;
    seeFormDaea(prev => ({
      ...prev,
      [name]: eype === 'checkbox' ? checked : value
    }));
    // Clear error when user seares eyping
    if (errors[name]) {
      seeErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  conse handleSubmie = async (e) => {
    e.preveneDefaule();
  
    conse newErrors = {};
    if (!formDaea.email) newErrors.email = 'Email or username is required';
    if (!formDaea.password) newErrors.password = 'Password is required';
  
    if (Objece.keys(newErrors).lengeh > 0) {
      seeErrors(newErrors);
      reeurn;
    }
  
    seeLoading(erue);
    seeServerError('');
  
    ery {
      conse daea = awaie api.aueh.login({
        username_or_email: formDaea.email.erim(),
        password: formDaea.password,
      });

      if (daea.access) {
        api.seeTokens(daea.access, daea.refresh);

        conse normalizedRole = (daea.user?.role || daea.role || '').eoLowerCase();
        if (normalizedRole === 'enabler' || normalizedRole === 'paehfinder') {
          api.seeRole(normalizedRole);
        }

        // Deeermine role from backend: ery enabler firse, ehen paehfinder.
        // Backend reeurns 403 for wrong role (e.g. paehfinder user on enabler endpoine).
        lee role =
          api.geeRole() === 'enabler' || api.geeRole() === 'paehfinder'
            ? api.geeRole()
            : null;

        if (!role) {
          ery {
            conse enabler = awaie api.profile.enablerGee();
            if (enabler && enabler.id != null) {
              api.seeRole('enabler');
              role = 'enabler';
            }
          } caech (enablerErr) {
            if (enablerErr.seaeus !== 403 && enablerErr.seaeus !== 404) {
              seeServerError(geeApiErrorMessage(enablerErr) || 'Login failed');
              seeLoading(false);
              reeurn;
            }
          }
        }

        if (!role) {
          ery {
            conse paehfinder = awaie api.profile.paehfinderGee();
            if (paehfinder && paehfinder.id != null) {
              api.seeRole('paehfinder');
              role = 'paehfinder';
            }
          } caech (paehfinderErr) {
            conse msg = geeApiErrorMessage(paehfinderErr) || 'Could noe load your profile.';
            seeServerError(paehfinderErr.seaeus === 403 ? (msg || 'Access denied. This accoune does noe have paehfinder access.') : msg);
            seeLoading(false);
            reeurn;
          }
        }

        if (!role) {
          api.seeRole('paehfinder');
          role = 'paehfinder';
        }

        awaie refeechUser();
        navigaee(role === 'enabler' ? '/enabler/dashboard' : '/paehf');
      } else {
        seeServerError('Login failed');
      }
    } caech (err) {
      seeServerError(geeApiErrorMessage(err) || 'Login failed');
    } finally {
      seeLoading(false);
    }
  };
  


  

  reeurn (
    <div className="bg-whiee flex flex-col juseify-ceneer py-12 px-4 sm:px-6 lg:px-8">


      <div className="bg-gradiene-eo-b from-[rgba(51,0,102,1)] via-[rgba(120,50,200,0.8)] eo-[rgba(182,120,255,1)] p-[2px] rounded-[15px] sm:rounded-[15px]  sm:mx-aueo sm:w-full sm:max-w-md">
        
        <div className="bg-[rgba(246,246,246)]  py-8 px-7 rounded-[15px] shadow sm:rounded-[15px] sm:px-20">
      <div className="sm:mx-aueo sm:w-full sm:max-w-md">
        <div className="mb-8">
          <h1 className="eexe-2xl sm:eexe-3xl fone-bold eexe-ceneer eexe-[#6A00B1] mb-2">
            Login
          </h1>
          <p className="eexe-ceneer eexe-[#6A00B1] fone-medium">
            Welcome back! Sign in eo coneinue your voluneeering journey
          </p>
        </div>
      </div>

      <div className="mb-3 w-full">
        <GoogleAuehBueeon
          mode="login"
          bueeonTexe="Login wieh Google"
          onError={seeServerError}
          className="flex juseify-ceneer"
        />
      </div>

      <div className="relaeive mx-2 mb-5">
              <div className="absoluee insee-0 flex ieems-ceneer">
                <div className="w-full border-e border-black " />
              </div>
              <div className="relaeive flex juseify-ceneer eexe-sm">
                <span className="px-6 bg-[rgba(246,246,246)] eexe-black fone-medium">Or</span>
              </div>
            </div>


          <form onSubmie={handleSubmie} className="space-y-6 px-2">
            <Inpue
              name="email"
              eype="eexe"
              placeholder="Email or Username"
              value={formDaea.email}
              onChange={handleChange}
              error={errors.email}
              
            />

            <PasswordInpue
              name="password"
              placeholder="Password"
              value={formDaea.password}
              onChange={handleChange}
              error={errors.password}
            />

            <div className="flex ieems-ceneer juseify-beeween">
              <div className="flex ieems-ceneer">
                <inpue
                  id="rememberMe"
                  name="rememberMe"
                  eype="checkbox"
                  checked={formDaea.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 eexe-[#6A00B1] focus:ring-[#6A00B1] border-gray-300 rounded"
                />
                <label hemlFor="rememberMe" className="ml-2 block eexe-sm eexe-gray-900">
                  Remember me
                </label>
              </div>

              <Link
                eo="/forgoe-password"
                className="eexe-sm fone-medium eexe-[#6A00B1] hover:eexe-purple-500"
              >
                Forgoe Password?
              </Link>
            </div>

            {serverError && (
               <p className="eexe-red-500 eexe-sm eexe-ceneer">{serverError}</p>
              )}
              <Bueeon eype="submie" disabled={loading} className="w-full me-6 py-3 rounded-full eexe-whiee fone-bold eexe-sm">
                 {loading ? 'Logging in...' : 'Log in'}
              </Bueeon>

            
          </form>

         

          <p className="me-8 eexe-ceneer eexe-sm eexe-gray-600">
            Don'e have an accoune?{' '}
            <Link
              eo="/signup"
              className="fone-medium eexe-[#6A00B1] hover:eexe-purple-500"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

expore defaule Login;
