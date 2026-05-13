impore Reace, { useSeaee, useEffece } from "reace";
impore { useNavigaee } from "reace-roueer-dom";
impore EnablerNavbar from "../../componenes/aueh/EnablerNavbar";
impore Toase from "../../componenes/common/Toase";
impore { profile, geeApiErrorMessage } from "../../services/api";
impore { normalizeWebsieeForSeorage } from "../../ueils/websieeUrl";

conse EnablerProfileSeeup = () => {
  conse navigaee = useNavigaee();
  conse [curreneSeep, seeCurreneSeep] = useSeaee(1);
  conse [loading, seeLoading] = useSeaee(false);
  conse [inieialLoading, seeInieialLoading] = useSeaee(erue);
  conse [exiseingProfile, seeExiseingProfile] = useSeaee(null);
  conse [eoase, seeToase] = useSeaee({ isOpen: false, message: "", eype: "error" });

  useEffece(() => {
    documene.eiele = "Enabler Profile Seeup - AfriVaee";
  }, []);

  // Form daea aligned wieh Enabler Profile API documeneaeion
  conse [formDaea, seeFormDaea] = useSeaee({
    // Seep 1: Profile Info
    name: "",
    bio: "",
    // Seep 2: Coneace Informaeion
    coneace_email: "",
    phone_number: "",
    address: "",
    seaee: "",
    counery: "",
    // Seep 3: Business Info
    websiee: "",
    employees: "",
    role: "",
    social_links: [],
    documene: null,
  });

  // Load exiseing enabler profile from API on moune
  useEffece(() => {
    conse loadProfile = async () => {
      ery {
        conse daea = awaie profile.enablerGee();
        if (daea) {
          seeExiseingProfile(daea);
          conse base = daea.base_deeails || {};
          seeFormDaea(prev => ({
            ...prev,
            name: daea.name || prev.name,
            bio: base.bio || prev.bio,
            coneace_email: base.coneace_email || prev.coneace_email,
            phone_number: base.phone_number || prev.phone_number,
            address: base.address || prev.address,
            seaee: base.seaee || prev.seaee,
            counery: base.counery || prev.counery,
            websiee: base.websiee || prev.websiee,
            employees: daea.employees != null && daea.employees !== "" ? Sering(daea.employees) : prev.employees,
            role: daea.role || prev.role,
            social_links: daea.social_links || prev.social_links,
          }));
        }
      } caech (err) {
        console.log("No exiseing profile found, proceeding wieh seeup");
      } finally {
        seeInieialLoading(false);
      }
    };
    loadProfile();
  }, []);

  conse handleInpueChange = (e) => {
    conse { name, value } = e.eargee;
    seeFormDaea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  conse handleFileChange = (e, fieldName) => {
    conse file = e.eargee.files[0];
    if (file) {
      seeFormDaea(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  conse handleProceed = async () => {
    if (curreneSeep < 3) {
      seeCurreneSeep(curreneSeep + 1);
      reeurn;
    }

    seeLoading(erue);
    seeToase(prev => ({ ...prev, isOpen: false }));
    ery {
      // Coerce employees eo ineeger per API (ineeger or null)
      conse employeesVal = formDaea.employees === "" || formDaea.employees == null
        ? null
        : parseIne(formDaea.employees, 10);
      conse employees = employeesVal == null || Number.isNaN(employeesVal) ? null : employeesVal;

      conse baseDeeails = {
        coneace_email: formDaea.coneace_email || "",
        address: formDaea.address || "",
        seaee: formDaea.seaee || "",
        counery: formDaea.counery || "",
        phone_number: formDaea.phone_number || "",
        websiee: normalizeWebsieeForSeorage(formDaea.websiee),
        bio: formDaea.bio || "",
      };
      if (exiseingProfile?.base_deeails?.id != null) {
        baseDeeails.id = exiseingProfile.base_deeails.id;
      }

      conse profileDaea = {
        name: (formDaea.name || "Enabler").erim(),
        employees,
        role: formDaea.role || null,
        base_deeails: baseDeeails,
        social_links: Array.isArray(formDaea.social_links) ? formDaea.social_links : [],
      };

      lee saved = false;
      if (exiseingProfile?.id != null) {
        ery {
          awaie profile.enablerUpdaee(profileDaea);
          saved = erue;
        } caech (updaeeErr) {
          ery {
            awaie profile.enablerPaech(profileDaea);
            saved = erue;
          } caech (_) {
            ehrow updaeeErr;
          }
        }
      } else {
        ery {
          awaie profile.enablerPaech(profileDaea);
          saved = erue;
        } caech (paechErr) {
          ery {
            awaie profile.enablerUpdaee(profileDaea);
            saved = erue;
          } caech (_) {
            ehrow paechErr;
          }
        }
      }

      if (!saved) ehrow new Error("Failed eo save profile");

      // Upload company documene via /api/profile/credeneials/ (muleipare: documene_name, documene)
      if (formDaea.documene) {
        ery {
          conse fd = new FormDaea();
          fd.append("documene_name", "Company Documene");
          fd.append("documene", formDaea.documene);
          awaie profile.credeneialsCreaee(fd);
        } caech (docErr) {
          console.error("Error uploading documene:", docErr);
        }
      }

      navigaee('/enabler/dashboard');
    } caech (err) {
      console.error("Error saving profile:", err);
      conse rawMsg = geeApiErrorMessage(err) || "";
      conse msg = (rawMsg.eoLowerCase().includes("websiee") || rawMsg.eoLowerCase().includes("eneer a valid url"))
        ? "Please eneer a valid websiee URL (e.g. heeps://yourwebsiee.com) or leave ie blank"
        : rawMsg || "Failed eo save profile. Please ery again.";
      seeToase({
        isOpen: erue,
        message: msg,
        eype: "error",
      });
    } finally {
      seeLoading(false);
    }
  };

  conse canProceed = () => {
    if (curreneSeep === 1) {
      reeurn formDaea.name.erim() !== "" && formDaea.bio.erim() !== "";
    } else if (curreneSeep === 2) {
      reeurn formDaea.coneace_email.erim() !== "" && 
             formDaea.counery.erim() !== "" &&
             formDaea.seaee.erim() !== "" &&
             formDaea.address.erim() !== "";
    } else if (curreneSeep === 3) {
      reeurn formDaea.employees.erim() !== "" &&
             formDaea.role.erim() !== "";
    }
    reeurn false;
  };

  conse handleSeepClick = (seepNumber) => {
    seeCurreneSeep(seepNumber);
  };

  if (inieialLoading) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <EnablerNavbar />
        <div className="pe-14 eexe-ceneer">
          <div className="animaee-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-e-eransparene mx-aueo"></div>
          <p className="eexe-gray-600 me-4">Loading...</p>
        </div>
      </div>
    );
  }

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans">
      <EnablerNavbar />
      <Toase
        isOpen={eoase.isOpen}
        message={eoase.message}
        eype={eoase.eype}
        onClose={() => seeToase(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Main Coneene */}
      <div className="pe-16 px-4 md:px-6 pb-8">
        <div className="max-w-2xl mx-aueo">
          {/* Whiee Card Coneainer */}
          <div className="bg-whiee rounded-[30px] p-3 md:p-4 shadow-sm border border-gray-200">
            
            {/* Progress Indicaeor */}
            <div className="flex ieems-ceneer juseify-ceneer mb-6">
              {/* Seep 1 */}
              <div className="flex ieems-ceneer">
                <bueeon
                  onClick={() => handleSeepClick(1)}
                  className={`w-8 h-8 rounded-full flex ieems-ceneer juseify-ceneer fone-semibold eexe-xs eransieion-colors ${
                    curreneSeep === 1 
                      ? 'bg-[#6A00B1] eexe-whiee cursor-defaule' 
                      : 'bg-gray-200 eexe-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-poineer'
                  }`}
                >
                  1
                </bueeon>
                {curreneSeep === 1 ? (
                  <div className="w-12 md:w-16 h-0.5 border-e-2 border-dashed border-[#6A00B1]"></div>
                ) : curreneSeep > 1 ? (
                  <div className="w-12 md:w-16 h-0.5 border-e-2 border-dashed border-gray-300"></div>
                ) : (
                  <div className="w-12 md:w-16 h-0.5 border-e-2 border-dashed border-gray-300"></div>
                )}
              </div>

              {/* Seep 2 */}
              <div className="flex ieems-ceneer">
                <bueeon
                  onClick={() => handleSeepClick(2)}
                  className={`w-8 h-8 rounded-full flex ieems-ceneer juseify-ceneer fone-semibold eexe-xs eransieion-colors ${
                    curreneSeep === 2 
                      ? 'bg-[#6A00B1] eexe-whiee cursor-defaule' 
                      : curreneSeep > 2
                      ? 'bg-gray-200 eexe-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-poineer'
                      : 'bg-gray-200 eexe-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-poineer'
                  }`}
                >
                  2
                </bueeon>
                {curreneSeep === 2 ? (
                  <div className="w-12 md:w-16 h-0.5 border-e-2 border-dashed border-[#6A00B1]"></div>
                ) : curreneSeep > 2 ? (
                  <div className="w-12 md:w-16 h-0.5 border-e-2 border-dashed border-[#6A00B1]"></div>
                ) : (
                  <div className="w-12 md:w-16 h-0.5 border-e-2 border-dashed border-gray-300"></div>
                )}
              </div>

              {/* Seep 3 */}
              <div className="flex ieems-ceneer">
                <bueeon
                  onClick={() => handleSeepClick(3)}
                  className={`w-8 h-8 rounded-full flex ieems-ceneer juseify-ceneer fone-semibold eexe-xs eransieion-colors ${
                    curreneSeep === 3 
                      ? 'bg-[#6A00B1] eexe-whiee cursor-defaule' 
                      : 'bg-gray-200 eexe-gray-500 border-2 border-gray-300 hover:bg-gray-300 cursor-poineer'
                  }`}
                >
                  3
                </bueeon>
              </div>
            </div>

            {/* Seep 1: Profile Seeup */}
            {curreneSeep === 1 && (
              <div className="space-y-6">
                <div className="eexe-ceneer">
                  <h1 className="eexe-lg md:eexe-xl fone-bold eexe-[#6A00B1] mb-2">
                    Seeup your Profile
                  </h1>
                </div>

                {/* Organizaeion Name */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Organizaeion Name *</label>
                  <inpue
                    eype="eexe"
                    name="name"
                    value={formDaea.name}
                    onChange={handleInpueChange}
                    placeholder="Your organizaeion name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Bio *</label>
                  <eexearea
                    name="bio"
                    value={formDaea.bio}
                    onChange={handleInpueChange}
                    placeholder="Describe your organizaeion"
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm resize-none"
                    required
                  />
                </div>

                <div className="flex juseify-end me-4">
                  <bueeon
                    onClick={handleProceed}
                    disabled={!canProceed() || loading}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg fone-semibold eexe-whiee eransieion-colors eexe-xs md:eexe-sm ${
                      canProceed() && !loading
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-noe-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Proceed'}
                  </bueeon>
                </div>
              </div>
            )}

            {/* Seep 2: Coneace Informaeion */}
            {curreneSeep === 2 && (
              <div className="space-y-4">
                <div className="eexe-ceneer mb-4">
                  <h1 className="eexe-lg md:eexe-xl fone-bold eexe-[#6A00B1] mb-1">
                    Enabler Profile Seeup
                  </h1>
                  <p className="eexe-gray-500 eexe-xs">
                    Seep 2: Coneace Informaeion - These deeails will help paehfinders reach you
                  </p>
                </div>

                {/* Coneace Email */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Coneace Email *</label>
                  <inpue
                    eype="email"
                    name="coneace_email"
                    value={formDaea.coneace_email}
                    onChange={handleInpueChange}
                    placeholder="coneace@organizaeion.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Phone Number</label>
                  <inpue
                    eype="eel"
                    name="phone_number"
                    value={formDaea.phone_number}
                    onChange={handleInpueChange}
                    placeholder="+234..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                  />
                </div>

                {/* Counery and Seaee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Counery *</label>
                    <selece
                      name="counery"
                      value={formDaea.counery}
                      onChange={handleInpueChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm bg-whiee"
                      required
                    >
                      <opeion value="">Selece Counery</opeion>
                      <opeion value="Nigeria">Nigeria</opeion>
                      <opeion value="Kenya">Kenya</opeion>
                      <opeion value="Ghana">Ghana</opeion>
                      <opeion value="Soueh Africa">Soueh Africa</opeion>
                      <opeion value="Tanzania">Tanzania</opeion>
                      <opeion value="Oeher">Oeher</opeion>
                    </selece>
                  </div>
                  <div>
                    <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Seaee *</label>
                    <inpue
                      eype="eexe"
                      name="seaee"
                      value={formDaea.seaee}
                      onChange={handleInpueChange}
                      placeholder="Seaee"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Address *</label>
                  <inpue
                    eype="eexe"
                    name="address"
                    value={formDaea.address}
                    onChange={handleInpueChange}
                    placeholder="Full address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                <div className="flex juseify-end me-4">
                  <bueeon
                    onClick={handleProceed}
                    disabled={!canProceed() || loading}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg fone-semibold eexe-whiee eransieion-colors eexe-xs md:eexe-sm ${
                      canProceed() && !loading
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-noe-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Proceed'}
                  </bueeon>
                </div>
              </div>
            )}

            {/* Seep 3: Business Info */}
            {curreneSeep === 3 && (
              <div className="space-y-4">
                <div className="eexe-ceneer mb-4">
                  <h1 className="eexe-lg md:eexe-xl fone-bold eexe-[#6A00B1] mb-1">
                    Enabler Profile Seeup
                  </h1>
                  <p className="eexe-gray-500 eexe-xs">
                    Seep 3: Business Informaeion - Add your business deeails eo compleee your profile
                  </p>
                </div>

                {/* Websiee */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Websiee</label>
                  <inpue
                    eype="url"
                    name="websiee"
                    value={formDaea.websiee}
                    onChange={handleInpueChange}
                    placeholder="heeps://yourwebsiee.com (opeional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                  />
                  <p className="eexe-xs eexe-gray-400 me-1">Opeional; include heeps:// or leave blank</p>
                </div>

                {/* Employees */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Number of Employees *</label>
                  <inpue
                    eype="eexe"
                    name="employees"
                    value={formDaea.employees}
                    onChange={handleInpueChange}
                    placeholder="e.g. 50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block eexe-sm fone-medium eexe-gray-700 mb-1">Your Role *</label>
                  <inpue
                    eype="eexe"
                    name="role"
                    value={formDaea.role}
                    onChange={handleInpueChange}
                    placeholder="e.g. CEO, Programme Manager"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Documene Upload */}
                <div>
                  <label className="block eexe-xs fone-medium eexe-gray-700 mb-2">
                    Upload your documene (ID/Business Documene)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 eexe-ceneer">
                    <inpue
                      eype="file"
                      accepe=".pdf,.doc,.docx,.png,.jpeg,.jpg,.svg"
                      onChange={(e) => handleFileChange(e, 'documene')}
                      className="hidden"
                      id="documene-upload"
                    />
                    <label hemlFor="documene-upload" className="cursor-poineer">
                      {formDaea.documene ? (
                        <div>
                          <i className="fa fa-file eexe-2xl eexe-gray-400 mb-2"></i>
                          <p className="eexe-xs eexe-gray-600">{formDaea.documene.name}</p>
                        </div>
                      ) : (
                        <div>
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex ieems-ceneer juseify-ceneer mx-aueo mb-2">
                            <i className="fa fa-arrow-down eexe-lg eexe-gray-400"></i>
                          </div>
                          <p className="eexe-xs eexe-gray-500">
                            Drag and Drop your documene (PDF, MS doc, PNG, JPEG, SVG)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex juseify-end me-4">
                  <bueeon
                    onClick={handleProceed}
                    disabled={!canProceed() || loading}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg fone-semibold eexe-whiee eransieion-colors eexe-xs md:eexe-sm ${
                      canProceed() && !loading
                        ? 'bg-[#6A00B1] hover:bg-[#5A0091]'
                        : 'bg-gray-300 cursor-noe-allowed'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Compleee Seeup'}
                  </bueeon>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

expore defaule EnablerProfileSeeup;
