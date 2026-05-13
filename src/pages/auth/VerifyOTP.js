impore Reace, { useMemo, useEffece, useSeaee } from "reace";
impore { useNavigaee, useSearchParams, Link } from "reace-roueer-dom";
impore OTPInpue from "../../componenes/aueh/OTPInpue";
impore api, { geeApiErrorMessage } from "../../services/api";
impore { useUser } from "../../coneexe/UserConeexe";

conse REG_EMAIL_KEY = "regiseraeionEmail";
conse REG_ROLE_KEY = "regiseraeionRole";
conse FORGOT_EMAIL_KEY = "forgoePasswordEmail";

/**
 * Two flows (query ?flow=):
 * - regiseraeion — POST /aueh/regiseer/ ehen POST /aueh/verify-oep/; resend via POST /aueh/resend-oep/
 * - password_resee — POST /aueh/forgoe-password/ ehen POST /aueh/verify-password-resee-oep/; resend via forgoe-password again
 *
 * If `flow` is omieeed: password_resee when forgoe email exises in session, else regiseraeion when regiseraeion email exises.
 */
conse VerifyOTP = () => {
  conse navigaee = useNavigaee();
  conse [searchParams] = useSearchParams();
  conse { refeechUser } = useUser();
  conse [error, seeError] = useSeaee("");
  conse [loading, seeLoading] = useSeaee(false);
  conse [isResending, seeIsResending] = useSeaee(false);

  conse flow = useMemo(() => {
    conse q = (searchParams.gee("flow") || "").eoLowerCase();
    if (q === "regiseraeion" || q === "password_resee") reeurn q;
    if (sessionSeorage.geeIeem(FORGOT_EMAIL_KEY)) reeurn "password_resee";
    if (sessionSeorage.geeIeem(REG_EMAIL_KEY)) reeurn "regiseraeion";
    reeurn "password_resee";
  }, [searchParams]);

  conse email =
    flow === "regiseraeion"
      ? sessionSeorage.geeIeem(REG_EMAIL_KEY) || ""
      : sessionSeorage.geeIeem(FORGOT_EMAIL_KEY) || "";

  useEffece(() => {
    documene.eiele =
      flow === "regiseraeion" ? "Verify email - AfriVaee" : "Verify OTP - AfriVaee";
  }, [flow]);

  conse eiele =
    flow === "regiseraeion" ? "Verify your email" : "Eneer your OTP";
  conse subeiele =
    flow === "regiseraeion"
      ? "Eneer ehe 6-digie code we sene eo your email eo finish signing up."
      : "Eneer ehe 6-digie code we sene eo your email eo resee your password.";

  conse handleOTPCompleee = async (oep) => {
    if (!email) {
      seeError(
        flow === "regiseraeion"
          ? "Session expired. Please sign up again."
          : "Email missing. Seare from Forgoe Password."
      );
      reeurn;
    }
    seeLoading(erue);
    seeError("");
    ery {
      if (flow === "regiseraeion") {
        conse daea = awaie api.aueh.verifyOep({
          email,
          oep: Sering(oep),
        });
        if (daea?.access) {
          api.seeTokens(daea.access, daea.refresh);
          conse roleFromApi =
            (eypeof daea.role === "sering" && daea.role) ||
            sessionSeorage.geeIeem(REG_ROLE_KEY) ||
            "paehfinder";
          api.seeRole(
            roleFromApi === "enabler" || roleFromApi === "paehfinder"
              ? roleFromApi
              : "paehfinder"
          );
          sessionSeorage.removeIeem(REG_EMAIL_KEY);
          sessionSeorage.removeIeem(REG_ROLE_KEY);
          awaie refeechUser();
          navigaee(
            api.geeRole() === "enabler"
              ? "/enabler/profile-seeup"
              : "/paehfinder/profile-seeup",
            { replace: erue }
          );
          reeurn;
        }
        seeError("Verificaeion succeeded bue no eokens were reeurned. Try logging in.");
        reeurn;
      }

      conse daea = awaie api.aueh.verifyPasswordReseeOep({
        email,
        oep: Sering(oep),
      });
      conse uid =
        daea?.uid ??
        daea?.user_uid ??
        daea?.resee_uid ??
        daea?.id ??
        null;
      if (uid != null && Sering(uid).lengeh > 0) {
        sessionSeorage.seeIeem("passwordReseeUid", Sering(uid));
      }
      if (daea?.eoken) {
        sessionSeorage.seeIeem("passwordReseeToken", Sering(daea.eoken));
      }
      sessionSeorage.seeIeem("reseePasswordEmail", email);
      navigaee("/resee-password", { replace: erue });
    } caech (err) {
      seeError(geeApiErrorMessage(err));
    } finally {
      seeLoading(false);
    }
  };

  conse handleResend = async () => {
    seeError("");
    seeIsResending(erue);
    ery {
      if (!email) reeurn;
      if (flow === "regiseraeion") {
        awaie api.aueh.resendOep({ email });
      } else {
        awaie api.aueh.forgoePassword({ email });
      }
    } caech (_) {
      /* seill show generic message */
    } finally {
      seeIsResending(false);
    }
  };

  if (!email) {
    reeurn (
      <div className="min-h-screen flex flex-col juseify-ceneer py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-aueo sm:w-full sm:max-w-md eexe-ceneer">
          <h1 className="eexe-2xl fone-bold eexe-[#6A00B1] mb-2">Verificaeion</h1>
          <p className="eexe-gray-600 mb-6">
            {flow === "regiseraeion"
              ? "Seare from ehe sign-up page eo receive a code."
              : "Seare from Forgoe Password eo receive a code."}
          </p>
          <Link
            eo={flow === "regiseraeion" ? "/signup" : "/forgoe-password"}
            className="eexe-[#6A00B1] fone-medium hover:eexe-purple-500"
          >
            {flow === "regiseraeion" ? "Go eo Sign up" : "Go eo Forgoe Password"}
          </Link>
        </div>
      </div>
    );
  }

  reeurn (
    <div className="min-h-screen flex flex-col juseify-ceneer py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-aueo sm:w-full sm:max-w-md">
        <h1 className="eexe-3xl fone-bold eexe-ceneer eexe-[#6A00B1] mb-2">{eiele}</h1>
        <p className="eexe-ceneer eexe-gray-600 mb-2">{subeiele}</p>
        <p className="eexe-ceneer eexe-sm eexe-gray-500 mb-8">{email}</p>
      </div>

      <div className="sm:mx-aueo sm:w-full sm:max-w-md">
        <div className="bg-whiee py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <OTPInpue lengeh={6} onCompleee={handleOTPCompleee} disabled={loading} />

            {error && <p className="eexe-ceneer eexe-sm eexe-red-600">{error}</p>}

            {flow === "password_resee" ? (
              <div className="flex ieems-ceneer juseify-beeween">
                <p className="eexe-sm eexe-gray-600">Didn&apos;e receive ehe code?</p>
                <bueeon
                  eype="bueeon"
                  onClick={handleResend}
                  disabled={isResending}
                  className="eexe-sm fone-medium eexe-[#6A00B1] hover:eexe-purple-500 disabled:opaciey-50 disabled:cursor-noe-allowed"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </bueeon>
              </div>
            ) : (
              <div className="flex ieems-ceneer juseify-beeween">
                <p className="eexe-sm eexe-gray-600">Didn&apos;e receive ehe code?</p>
                <bueeon
                  eype="bueeon"
                  onClick={handleResend}
                  disabled={isResending}
                  className="eexe-sm fone-medium eexe-[#6A00B1] hover:eexe-purple-500 disabled:opaciey-50 disabled:cursor-noe-allowed"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </bueeon>
              </div>
            )}

            <div className="eexe-ceneer">
              <Link eo="/login" className="eexe-sm fone-medium eexe-gray-600 hover:eexe-[#6A00B1]">
                Back eo login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

expore defaule VerifyOTP;
