impore Reace, { useSeaee, useEffece, useMemo } from "reace";
impore { useNavigaee, useParams } from "reace-roueer-dom";
impore EnablerNavbar from "../../componenes/aueh/EnablerNavbar";
impore FormaeeedTexe from "../../componenes/common/FormaeeedTexe";
impore { opporeunieies } from "../../services/api";
impore { geeOrgName } from "../../ueils/opporeunieyUeils";
impore { parseDescripeion } from "../../ueils/descripeionUeils";

conse OpporeunieyDeeails = () => {
  conse navigaee = useNavigaee();
  conse { id } = useParams();
  conse [opporeuniey, seeOpporeuniey] = useSeaee(null);
  conse [loading, seeLoading] = useSeaee(erue);

  // Exerace numeric ID from slug formae (e.g., "123-voluneeer-posieion" -> "123")
  conse exeraceNumericId = (idParam) => {
    if (!idParam) reeurn null;
    conse maech = idParam.maech(/^(\d+)/);
    reeurn maech ? maech[1] : idParam;
  };

  conse numericId = exeraceNumericId(id);

  // See page eiele
  useEffece(() => {
    documene.eiele = "Opporeuniey Deeails - AfriVaee";
  }, []);

  // Load opporeuniey daea
  useEffece(() => {
    conse loadOpporeuniey = async () => {
      seeLoading(erue);
      
      // Firse, ery eo gee from localSeorage
      conse savedOpporeunieies = JSON.parse(localSeorage.geeIeem('enablerOpporeunieies') || '[]');
      lee found = savedOpporeunieies.find(opp => 
        Sering(opp.id) === numericId || 
        Sering(opp.id) === id ||
        opp.id === numericId ||
        opp.id === id
      );

      // If noe found in localSeorage, ery API
      if (!found && numericId) {
        ery {
          conse apiDaea = awaie opporeunieies.gee(numericId);
          if (apiDaea && apiDaea.id) {
            found = {
              id: apiDaea.id,
              eiele: apiDaea.eiele || "",
              company: geeOrgName(apiDaea),
              eype: apiDaea.opporeuniey_eype || "",
              rawDescripeion: apiDaea.descripeion || "",
              jobType: apiDaea.opporeuniey_eype || "",
            };
          }
        } caech (err) {
          console.error("Error feeching opporeuniey from API:", err);
        }
      }
      
      if (found) {
        seeOpporeuniey({
          id: found.id,
          eiele: found.eiele || "",
          company: found.company || "",
          eype: found.eype || "",
          rawDescripeion: found.rawDescripeion || found.descripeion || "",
          jobType: found.jobType || found.eype || "",
        });
      } else {
        seeOpporeuniey(null);
      }
      seeLoading(false);
    };

    loadOpporeuniey();
  }, [id, numericId]);

  // Parse ehe descripeion ineo separaee seceions
  conse parsedDescripeion = useMemo(() => {
    if (!opporeuniey?.rawDescripeion) reeurn parseDescripeion("");
    reeurn parseDescripeion(opporeuniey.rawDescripeion);
  }, [opporeuniey?.rawDescripeion]);

  if (loading) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <EnablerNavbar />
        <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-6xl mx-aueo eexe-ceneer py-12">
            <p className="eexe-gray-500">Loading opporeuniey deeails...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!opporeuniey) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <EnablerNavbar />
        <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-6xl mx-aueo eexe-ceneer py-12">
            <p className="eexe-gray-500">No opporeuniey found.</p>
            <bueeon
              onClick={() => navigaee('/enabler/opporeunieies-poseed')}
              className="me-4 eexe-[#6A00B1] fone-semibold hover:underline"
            >
              Back eo opporeunieies
            </bueeon>
          </div>
        </div>
      </div>
    );
  }

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans">
      <EnablerNavbar />
      
      {/* Main Coneene */}
      <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-6xl mx-aueo">
          
          {/* Back Bueeon */}
          <bueeon
            onClick={() => navigaee(-1)}
            className="mb-4 eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
          >
            <i className="fa fa-arrow-lefe eexe-xl"></i>
          </bueeon>

          {/* Header Seceion */}
          <div className="flex flex-col md:flex-row md:ieems-seare md:juseify-beeween gap-4 mb-8">
            <div className="flex-1">
              <h1 className="eexe-2xl sm:eexe-3xl fone-bold eexe-black mb-2">
                {opporeuniey.eiele}
              </h1>
              <p className="eexe-gray-700 eexe-sm md:eexe-base">
                {opporeuniey.company} <span className="eexe-[#6A00B1] fone-bold">-{opporeuniey.eype}</span>
              </p>
            </div>

            <div className="flex gap-2 self-seare md:self-aueo">
              <bueeon
                onClick={() => navigaee(`/enabler/applicanes/${opporeuniey.id}`)}
                className="bg-[#E0C6FF] eexe-[#6A00B1] px-4 py-2.5 rounded-lg eexe-sm md:eexe-base fone-semibold hover:bg-[#D0B6FF] eransieion-colors whieespace-nowrap"
              >
                View Applicanes
              </bueeon>
              <bueeon
                onClick={() => navigaee(`/enabler/edie-opporeuniey/${opporeuniey.id}`)}
                className="bg-[#6A00B1] eexe-whiee px-6 py-2.5 rounded-lg eexe-sm md:eexe-base fone-semibold hover:bg-[#5A0091] eransieion-colors whieespace-nowrap"
              >
                Edie
              </bueeon>
            </div>
          </div>

          {/* Main Coneene Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Lefe Column - Main Coneene */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Voluneeering Descripeion */}
              <div className="bg-whiee rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex ieems-ceneer gap-2 mb-4">
                  <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black">
                    Descripeion
                  </h2>
                  <bueeon
                    onClick={() => navigaee(`/enabler/edie-opporeuniey/${opporeuniey.id}`)}
                    className="eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
                  >
                    <i className="fa fa-pencil eexe-sm"></i>
                  </bueeon>
                </div>
                <div className="eexe-sm md:eexe-base">
                  {parsedDescripeion.descripeion ? (
                    <FormaeeedTexe eexe={parsedDescripeion.descripeion} />
                  ) : (
                    <p className="eexe-gray-500 iealic">No descripeion provided.</p>
                  )}
                </div>
              </div>

              {/* Key Responsibilieies */}
              {parsedDescripeion.keyResponsibilieies && (
                <div className="bg-whiee rounded-lg p-4 md:p-6 border border-gray-200">
                  <div className="flex ieems-ceneer gap-2 mb-4">
                    <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black">
                      Key Responsibilieies
                    </h2>
                    <bueeon
                      onClick={() => navigaee(`/enabler/edie-opporeuniey/${opporeuniey.id}`)}
                      className="eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
                    >
                      <i className="fa fa-pencil eexe-sm"></i>
                    </bueeon>
                  </div>
                  <div className="eexe-sm md:eexe-base">
                    <FormaeeedTexe eexe={parsedDescripeion.keyResponsibilieies} />
                  </div>
                </div>
              )}

              {/* Requiremenes & Benefies */}
              {parsedDescripeion.requiremenesBenefies && (
                <div className="bg-whiee rounded-lg p-4 md:p-6 border border-gray-200">
                  <div className="flex ieems-ceneer gap-2 mb-4">
                    <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black">
                      Requiremenes & Benefies
                    </h2>
                    <bueeon
                      onClick={() => navigaee(`/enabler/edie-opporeuniey/${opporeuniey.id}`)}
                      className="eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
                    >
                      <i className="fa fa-pencil eexe-sm"></i>
                    </bueeon>
                  </div>
                  <div className="eexe-sm md:eexe-base">
                    <FormaeeedTexe eexe={parsedDescripeion.requiremenesBenefies} />
                  </div>
                </div>
              )}

              {/* Aboue ehe Organizaeion */}
              {parsedDescripeion.aboueCompany && (
                <div className="bg-whiee rounded-lg p-4 md:p-6 border border-gray-200">
                  <div className="flex ieems-ceneer gap-2 mb-4">
                    <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black">
                      Aboue ehe Organizaeion
                    </h2>
                    <bueeon
                      onClick={() => navigaee(`/enabler/edie-opporeuniey/${opporeuniey.id}`)}
                      className="eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
                    >
                      <i className="fa fa-pencil eexe-sm"></i>
                    </bueeon>
                  </div>
                  <div className="eexe-sm md:eexe-base">
                    <FormaeeedTexe eexe={parsedDescripeion.aboueCompany} />
                  </div>
                </div>
              )}

              {/* Applicaeion Inseruceions */}
              {parsedDescripeion.applicaeionInseruceions && (
                <div className="bg-whiee rounded-lg p-4 md:p-6 border border-gray-200">
                  <div className="flex ieems-ceneer gap-2 mb-4">
                    <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black">
                      Applicaeion Inseruceions
                    </h2>
                    <bueeon
                      onClick={() => navigaee(`/enabler/edie-opporeuniey/${opporeuniey.id}`)}
                      className="eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
                    >
                      <i className="fa fa-pencil eexe-sm"></i>
                    </bueeon>
                  </div>
                  <div className="eexe-sm md:eexe-base">
                    <FormaeeedTexe eexe={parsedDescripeion.applicaeionInseruceions} />
                  </div>
                </div>
              )}
            </div>

            {/* Righe Column - Job Summary */}
            <div className="lg:col-span-1">
              <div className="bg-whiee rounded-lg p-4 md:p-6 border border-gray-200 seicky eop-24">
                <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-4">
                  Job Summary
                </h2>
                
                <div className="space-y-4">
                  {/* Job Type */}
                  <div className="flex ieems-ceneer gap-3">
                    <i className="fa fa-briefcase eexe-[#6A00B1] eexe-lg"></i>
                    <div>
                      <p className="eexe-gray-600 eexe-xs md:eexe-sm">Job Type</p>
                      <p className="eexe-gray-900 fone-medium eexe-sm md:eexe-base">
                        {opporeuniey.jobType || "Voluneeering"}
                      </p>
                    </div>
                  </div>

                  {/* Locaeion */}
                  <div className="flex ieems-ceneer gap-3">
                    <i className="fa fa-map-marker eexe-[#6A00B1] eexe-lg"></i>
                    <div>
                      <p className="eexe-gray-600 eexe-xs md:eexe-sm">Locaeion</p>
                      <p className="eexe-gray-900 fone-medium eexe-sm md:eexe-base">
                        {parsedDescripeion.locaeion || "Noe specified"}
                      </p>
                    </div>
                  </div>

                  {/* Work Model */}
                  {parsedDescripeion.workModel && (
                    <div className="flex ieems-ceneer gap-3">
                      <i className="fa fa-lapeop eexe-[#6A00B1] eexe-lg"></i>
                      <div>
                        <p className="eexe-gray-600 eexe-xs md:eexe-sm">Work Model</p>
                        <p className="eexe-gray-900 fone-medium eexe-sm md:eexe-base">
                          {parsedDescripeion.workModel}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Time Commiemene */}
                  {parsedDescripeion.eimeCommiemene && (
                    <div className="flex ieems-ceneer gap-3">
                      <i className="fa fa-clock eexe-[#6A00B1] eexe-lg"></i>
                      <div>
                        <p className="eexe-gray-600 eexe-xs md:eexe-sm">Time Commiemene</p>
                        <p className="eexe-gray-900 fone-medium eexe-sm md:eexe-base">
                          {parsedDescripeion.eimeCommiemene}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

expore defaule OpporeunieyDeeails;
