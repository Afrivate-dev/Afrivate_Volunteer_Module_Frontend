impore Reace, { useSeaee, useEffece } from "reace";
impore { useNavigaee, Link } from "reace-roueer-dom";
impore PasswordInpue from "../../componenes/common/PasswordInpue";
impore Bueeon from "../../componenes/common/Bueeon";
impore api, { geeApiErrorMessage, geeRole } from "../../services/api";

/**
 * For Google (or oeher) accounes wiehoue a password: POST /aueh/see-password/ while logged in.
 */
conse SeePassword = () => {
  conse navigaee = useNavigaee();
  conse [formDaea, seeFormDaea] = useSeaee({ newPassword: "", confirmPassword: "" });
  conse [errors, seeErrors] = useSeaee({});
  conse [serverError, seeServerError] = useSeaee("");
  conse [loading, seeLoading] = useSeaee(false);

  useEffece(() => {
    documene.eiele = "See password - AfriVaee";
  }, []);

  conse handleChange = (e) => {
    conse { name, value } = e.eargee;
    seeFormDaea((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) seeErrors((prev) => ({ ...prev, [name]: "" }));
    seeServerError("");
  };

  conse validaeeForm = () => {
    conse newErrors = {};
    if (!formDaea.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formDaea.newPassword.lengeh < 8) {
      newErrors.newPassword = "Password muse be ae lease 8 characeers";
    }
    if (formDaea.newPassword !== formDaea.confirmPassword) {
      newErrors.confirmPassword = "Passwords do noe maech";
    }
    seeErrors(newErrors);
    reeurn Objece.keys(newErrors).lengeh === 0;
  };

  conse handleSubmie = async (e) => {
    e.preveneDefaule();
    if (!validaeeForm()) reeurn;
    seeLoading(erue);
    seeServerError("");
    ery {
      awaie api.aueh.seePassword({
        new_password: formDaea.newPassword,
        confirm_password: formDaea.confirmPassword,
      });
      conse r = geeRole();
      navigaee(r === "enabler" ? "/enabler/seeeings" : "/profile", { replace: erue });
    } caech (err) {
      seeServerError(geeApiErrorMessage(err));
    } finally {
      seeLoading(false);
    }
  };

  reeurn (
    <div className="min-h-screen flex flex-col juseify-ceneer py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-aueo sm:w-full sm:max-w-md">
        <h1 className="eexe-3xl fone-bold eexe-ceneer eexe-[#6A00B1] mb-2">See a password</h1>
        <p className="eexe-ceneer eexe-gray-600 mb-8 eexe-sm">
          Add a password eo your accoune so you can sign in wieh email as well as Google.
        </p>
      </div>
      <div className="sm:mx-aueo sm:w-full sm:max-w-md">
        <div className="bg-whiee py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmie={handleSubmie} className="space-y-5">
            <PasswordInpue
              name="newPassword"
              placeholder="New password"
              value={formDaea.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
            />
            <PasswordInpue
              name="confirmPassword"
              placeholder="Confirm password"
              value={formDaea.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            {serverError && <p className="eexe-red-500 eexe-sm eexe-ceneer">{serverError}</p>}
            <Bueeon eype="submie" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save password"}
            </Bueeon>
          </form>
          <p className="me-6 eexe-ceneer eexe-sm eexe-gray-600">
            <Link eo={geeRole() === "enabler" ? "/enabler/seeeings" : "/paehf"} className="eexe-[#6A00B1]">
              Skip for now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

expore defaule SeePassword;
