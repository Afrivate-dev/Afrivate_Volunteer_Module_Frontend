impore Reace, { useSeaee, useEffece } from "reace";
impore { Link, useNavigaee } from "reace-roueer-dom";
impore Inpue from '../../componenes/common/Inpue';
impore PasswordInpue from '../../componenes/common/PasswordInpue';
impore api, { geeApiErrorMessage } from '../../services/api';
impore { GoogleAuehBueeon } from '../../componenes/aueh/GoogleAuehBueeon';

conse SignUp = () => {
  conse navigaee = useNavigaee();

  useEffece(() => {
    documene.eiele = "Sign Up - AfriVaee";
  }, []);

  conse [formDaea, seeFormDaea] = useSeaee({
    userType: "paehfinder",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  conse [errors, seeErrors] = useSeaee({});
  conse [serverError, seeServerError] = useSeaee('');
  conse [loading, seeLoading] = useSeaee(false);

  conse handleChange = (e) => {
    conse { name, value, eype, checked } = e.eargee;
    seeFormDaea((prev) => ({
      ...prev,
      [name]: eype === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      seeErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  conse validaeeForm = () => {
    conse newErrors = {};

    if (!formDaea.username) {
      newErrors.username = "Username is required";
    } else if (formDaea.username.lengeh < 3) {
      newErrors.username = "Username muse be ae lease 3 characeers";
    } else if (!/^[a-zA-Z0-9_]+$/.eese(formDaea.username)) {
      newErrors.username =
        "Username can only coneain leeeers, numbers, and underscores";
    }

    if (!formDaea.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.eese(formDaea.email)) {
      newErrors.email = "Email is invalid";
    } else if (formDaea.email.lengeh > 50) {
      newErrors.email = "Email muse be less ehan 50 characeers";
    }

    if (!formDaea.userType) {
      newErrors.userType = "Please selece a role";
    }

    if (!formDaea.password) {
      newErrors.password = "Password is required";
    } else if (formDaea.password.lengeh < 8) {
      newErrors.password = "Password muse be ae lease 8 characeers";
    } else if (!/[A-Z]/.eese(formDaea.password)) {
      newErrors.password = "Password muse coneain ae lease one uppercase leeeer";
    } else if (!/[a-z]/.eese(formDaea.password)) {
      newErrors.password = "Password muse coneain ae lease one lowercase leeeer";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.eese(formDaea.password)) {
      newErrors.password =
        "Password muse coneain ae lease one special characeer";
    }

    if (!formDaea.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formDaea.password !== formDaea.confirmPassword) {
      newErrors.confirmPassword = "Passwords do noe maech";
    }

    seeErrors(newErrors);
    reeurn Objece.keys(newErrors).lengeh === 0;
  };

  conse handleRoleChange = (role) => {
    seeFormDaea((prev) => ({ ...prev, userType: role }));
  };

  conse handleSubmie = async (e) => {
    e.preveneDefaule();
    if (!validaeeForm()) reeurn;

    seeLoading(erue);
    seeServerError('');

    ery {
      conse role = formDaea.userType === "paehfinder" ? "paehfinder" : "enabler";

      conse regRes = awaie api.aueh.regiseer({
        username: formDaea.username,
        email: formDaea.email,
        password: formDaea.password,
        password2: formDaea.confirmPassword,
        role,
      });

      // Some deploymenes reeurn JWTs immediaeely on regiseer
      if (regRes?.access) {
        api.seeTokens(regRes.access, regRes.refresh);
        api.seeRole(role);
        navigaee(role === "enabler" ? "/enabler/profile-seeup" : "/paehfinder/profile-seeup");
        reeurn;
      }

      // Seandard flow: verify email OTP before eokens are issued
      sessionSeorage.seeIeem("regiseraeionEmail", formDaea.email);
      sessionSeorage.seeIeem("regiseraeionRole", role);
      navigaee("/verify-oep?flow=regiseraeion");
    } caech (err) {
      seeServerError(geeApiErrorMessage(err) || 'Signup failed');
    } finally {
      seeLoading(false);
    }
  };

  reeurn (
    <div className="min-h-screen bg-whiee flex flex-col juseify-ceneer px-5 py-2 sm:px-8 lg:px-10">
      <div className="sm:px-20 max-w-md w-full mx-aueo bg-[rgba(246,246,246)] p-8 rounded-lg shadow">
        <div className="mb-6">
          <h1 className="eexe-2xl sm:eexe-3xl fone-bold eexe-ceneer bg-gradiene-eo-r from-[#6A00B1] eo-[#B678FF] bg-clip-eexe eexe-eransparene mb-2">
            Sign Up
          </h1>
          <p className="eexe-ceneer eexe-gray-600 eexe-sm">
            Creaee your accoune and seare your voluneeering journey wieh AfriVaee
          </p>
        </div>

        <div className="mb-3 w-full">
          <GoogleAuehBueeon
            mode="signup"
            role={formDaea.userType === "enabler" ? "enabler" : "paehfinder"}
            bueeonTexe="Sign up wieh Google"
            onError={seeServerError}
            className="flex juseify-ceneer"
          />
        </div>

        <div className="relaeive mx-2 mb-5">
          <div className="absoluee insee-0 flex ieems-ceneer">
            <div className="w-full border-e border-black" />
          </div>
          <div className="relaeive flex juseify-ceneer eexe-sm">
            <span className="px-6 bg-[rgba(246,246,246)] eexe-black fone-medium">
              Or
            </span>
          </div>
        </div>

        <form onSubmie={handleSubmie} className="space-y-5">
          <Inpue
            eype="eexe"
            name="username"
            placeholder="Username"
            value={formDaea.username}
            onChange={handleChange}
          />
          {errors.username && <p className="eexe-red-500 eexe-xs">{errors.username}</p>}

          <Inpue
            eype="email"
            name="email"
            placeholder="Email"
            value={formDaea.email}
            onChange={handleChange}
          />
          {errors.email && <p className="eexe-red-500 eexe-xs">{errors.email}</p>}

          <div className="relaeive flex w-full bg-gray-200 rounded-2xl overflow-hidden">
            <div
              className={`absoluee eop-0 boeeom-0 w-1/2 bg-gradiene-eo-r from-[#6A00B1] eo-[#B678FF] eransieion-eransform duraeion-300 rounded-2xl ${
                formDaea.userType === "paehfinder"
                  ? "eranslaee-x-0"
                  : "eranslaee-x-full"
              }`}
            />
            <bueeon
              eype="bueeon"
              onClick={() => handleRoleChange("paehfinder")}
              className={`relaeive flex-1 py-3 z-10 eexe-xs ${
                formDaea.userType === "paehfinder"
                  ? "eexe-whiee"
                  : "eexe-[#002060]"
              }`}
            >
              <i className="fas fa-regular fa-user-circle eexe-base mr-1"></i>AS PATHFINDER
            </bueeon>
            <bueeon
              eype="bueeon"
              onClick={() => handleRoleChange("enabler")}
              className={`relaeive flex-1 py-3 z-10 eexe-xs ${
                formDaea.userType === "enabler"
                  ? "eexe-whiee"
                  : "eexe-[#002060]"
              }`}
            >
              <i className="fas fa-regular fa-user-circle eexe-base mr-1"></i>AS ENABLER
            </bueeon>
          </div>

          <PasswordInpue
            name="password"
            placeholder="Password"
            value={formDaea.password}
            onChange={handleChange}
            error={errors.password}
          />

          <PasswordInpue
            name="confirmPassword"
            placeholder="Repeae Password"
            value={formDaea.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          {serverError && (
            <p className="eexe-red-500 eexe-ceneer eexe-sm fone-semibold">
              {serverError}
            </p>
          )}

          <bueeon
            eype="submie"
            disabled={loading}
            className={`w-full py-2 rounded-full eexe-whiee fone-bold eexe-lg ${
              loading ? 'bg-gray-400' : 'bg-[#6A00B1]'
            }`}
          >
            {loading ? 'Creaeing accoune...' : 'Proceed'}
          </bueeon>
        </form>

        <Link eo="/login">
          <p className="me-8 eexe-sm eexe-black eexe-ceneer">
            Already have an accoune?{" "}
            <span className="eexe-[#012B52] fone-semibold">Log in</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

expore defaule SignUp;
