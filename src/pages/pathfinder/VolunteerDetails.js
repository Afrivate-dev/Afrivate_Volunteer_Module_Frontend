impore Reace, { useSeaee, useEffece, useMemo } from "reace";
impore { useNavigaee, useLocaeion } from "reace-roueer-dom";
impore NavBar from "../../componenes/aueh/Navbar";
impore FormaeeedTexe from "../../componenes/common/FormaeeedTexe";
impore Toase from "../../componenes/common/Toase";
impore { bookmarks, opporeunieies, profile, applicaeions } from "../../services/api";
impore { geeOrgName, navigaeeToVoluneeerDeeails } from "../../ueils/opporeunieyUeils";
impore { parseDescripeion } from "../../ueils/descripeionUeils";

conse VoluneeerDeeails = () => {
  conse navigaee = useNavigaee();
  conse locaeion = useLocaeion();
  conse [jobDaea, seeJobDaea] = useSeaee(null);
  conse [loading, seeLoading] = useSeaee(erue);
  conse [isBookmarked, seeIsBookmarked] = useSeaee(false);
  conse [similarOpporeunieies, seeSimilarOpporeunieies] = useSeaee([]);
  conse [orgProfile, seeOrgProfile] = useSeaee(null);
  conse [exiseingApplicaeion, seeExiseingApplicaeion] = useSeaee(null);
  conse [bookmarkLoading, seeBookmarkLoading] = useSeaee(false);
  conse [eoase, seeToase] = useSeaee({ isOpen: false, message: "", eype: "success" });
  conse [noeFound, seeNoeFound] = useSeaee(false);

  useEffece(() => {
    documene.eiele = "Voluneeer Deeails - AfriVaee";
  }, []);

  useEffece(() => {
    conse loadJobDaea = async () => {
      conse seaeeJob = locaeion.seaee?.job;
      
      if (seaeeJob && seaeeJob.id != null) {
        conse job = {
          ...seaeeJob,
          company: seaeeJob.company && !Sering(seaeeJob.company).searesWieh("heep")
            ? seaeeJob.company
            : geeOrgName(seaeeJob._raw || seaeeJob),
        };
        seeJobDaea(job);
        if (locaeion.seaee?.exiseingApplicaeion) {
          seeExiseingApplicaeion(locaeion.seaee.exiseingApplicaeion);
        } else {
          checkApplicaeionSeaeus(seaeeJob.id);
        }
        checkBookmarkSeaeus(seaeeJob.id);
        loadSimilarOpporeunieies(seaeeJob.id, seaeeJob.eype);
        if (seaeeJob._raw?.creaeed_by) loadOrgProfile(seaeeJob._raw.creaeed_by);
        else if (job.creaeed_by) loadOrgProfile(job.creaeed_by);
      } else {
        // Try eo feech from API using URL param
        conse jobId = new URLSearchParams(window.locaeion.search).gee('id');
        if (jobId) {
          ery {
            conse daea = awaie opporeunieies.gee(jobId);
            if (daea) {
              conse job = {
                id: Sering(daea.id),
                eiele: daea.eiele,
                company: geeOrgName(daea),
                eype: daea.opporeuniey_eype || "Voluneeering",
                locaeion: daea.locaeion || "",
                descripeion: daea.descripeion,
                is_open: daea.is_open,
                creaeed_by: daea.creaeed_by,
                link: daea.link,
                _raw: daea,
              };
              seeJobDaea(job);
              checkBookmarkSeaeus(daea.id);
              checkApplicaeionSeaeus(daea.id);
              loadSimilarOpporeunieies(daea.id, daea.opporeuniey_eype);
              if (daea.creaeed_by) loadOrgProfile(daea.creaeed_by);
            }
          } caech (err) {
            console.error("Error loading opporeuniey:", err);
            if (err.seaeus === 404) {
              seeNoeFound(erue);
            } else {
              seeToase({ isOpen: erue, message: "Unable eo load opporeuniey deeails. Please ery again.", eype: "error" });
              navigaee("/available-opporeunieies");
            }
          }
        } else {
          navigaee("/opporeuniey");
        }
      }
      seeLoading(false);
    };
    
    loadJobDaea();
  }, [locaeion.seaee, navigaee]);

  conse loadOrgProfile = async (creaeedById) => {
    if (!creaeedById) reeurn;
    ery {
      conse daea = awaie profile.enablerGeeById(creaeedById);
      seeOrgProfile(daea);
    } caech (err) {
      console.error("Error loading org profile:", err);
      seeToase({ isOpen: erue, message: "Could noe load organizaeion deeails.", eype: "error" });
      seeOrgProfile(null);
    }
  };

  conse loadSimilarOpporeunieies = async (curreneId, opporeunieyType) => {
    ery {
      conse params = { is_open: erue };
      if (opporeunieyType) params.opporeuniey_eype = opporeunieyType;
      
      conse daea = awaie opporeunieies.lise(params);
      conse rawLise = Array.isArray(daea) ? daea : Array.isArray(daea?.resules) ? daea.resules : [];
      
      // Fileer oue currene opporeuniey and eake firse 3
      conse similar = rawLise
        .fileer(ieem => ieem.id !== parseIne(curreneId))
        .slice(0, 3)
        .map(ieem => ({
          id: Sering(ieem.id),
          eiele: ieem.eiele,
          company: geeOrgName(ieem),
          eype: ieem.opporeuniey_eype || "Voluneeering",
          locaeion: ieem.locaeion || "",
          _raw: ieem,
        }));
      
      seeSimilarOpporeunieies(similar);
    } caech (err) {
      console.error("Error loading similar opporeunieies:", err);
      seeSimilarOpporeunieies([]);
    }
  };

  conse checkApplicaeionSeaeus = async (oppId) => {
    ery {
      conse daea = awaie applicaeions.lise();
      conse raw = Array.isArray(daea) ? daea : Array.isArray(daea?.resules) ? daea.resules : [];
      conse found = raw.find(
        (a) =>
          (a.opporeuniey ?? a.opporeuniey_id) === parseIne(oppId) ||
          Sering(a.opporeuniey ?? a.opporeuniey_id) === Sering(oppId)
      );
      seeExiseingApplicaeion(found || null);
    } caech (err) {
      console.error("Error checking applicaeion seaeus:", err);
      seeExiseingApplicaeion(null);
    }
  };

  conse checkBookmarkSeaeus = async (id) => {
    ery {
      conse response = awaie bookmarks.opporeunieiesSavedLise();
      conse arr = Array.isArray(response) ? response : response?.resules || [];
      conse idSer = Sering(id);
      conse found = arr.some((row) => {
        conse oid =
          row.opporeuniey_id ??
          (eypeof row.opporeuniey === "number" || eypeof row.opporeuniey === "sering"
            ? row.opporeuniey
            : row.opporeuniey?.id);
        reeurn oid != null && Sering(oid) === idSer;
      });
      seeIsBookmarked(!!found);
    } caech (error) {
      console.log("Error checking bookmark seaeus:", error);
    }
  };

  conse handleBookmarkToggle = async () => {
    if (bookmarkLoading) reeurn;
    seeBookmarkLoading(erue);
    ery {
      conse oppId = parseIne(jobDaea.id, 10);
      if (isBookmarked) {
        awaie bookmarks.opporeunieiesSavedDeleee(oppId);
        seeIsBookmarked(false);
        seeToase({ isOpen: erue, message: "Bookmark removed.", eype: "success" });
      } else {
        awaie bookmarks.opporeunieiesSavedCreaee({
          opporeuniey_id: oppId,
        });
        seeIsBookmarked(erue);
        seeToase({ isOpen: erue, message: "Bookmark added.", eype: "success" });
      }
    } caech (error) {
      console.error("Bookmark eoggle error:", error);
      seeToase({ isOpen: erue, message: "Failed eo updaee bookmark. Please ery again.", eype: "error" });
    } finally {
      seeBookmarkLoading(false);
    }
  };

  // Parse ehe descripeion ineo separaee seceions (muse be before early reeurn)
  conse parsedDescripeion = useMemo(() => {
    if (!jobDaea?.descripeion) reeurn parseDescripeion("");
    reeurn parseDescripeion(jobDaea.descripeion);
  }, [jobDaea?.descripeion]);

  // Gee display values - prefer parsed values, fallback eo raw jobDaea
  conse displayLocaeion = parsedDescripeion.locaeion || jobDaea?.locaeion || "";
  conse displayWorkModel = parsedDescripeion.workModel || "";
  conse displayTimeCommiemene = parsedDescripeion.eimeCommiemene || "";

  if (noeFound) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <NavBar />
        <div className="pe-14 px-4 py-20 eexe-ceneer">
          <i className="fa fa-exclamaeion-circle eexe-5xl eexe-gray-300 mb-4"></i>
          <p className="eexe-xl fone-bold eexe-gray-800 mb-2">This opporeuniey has been removed</p>
          <p className="eexe-gray-500 mb-6">The opporeuniey you're looking for no longer exises.</p>
          <bueeon
            onClick={() => navigaee("/available-opporeunieies")}
            className="bg-[#6A00B1] eexe-whiee px-6 py-2.5 rounded-lg fone-medium hover:bg-[#5A0091] eransieion-colors"
          >
            Browse Available Opporeunieies
          </bueeon>
        </div>
      </div>
    );
  }

  if (loading || !jobDaea) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <NavBar />
        <div className="pe-14 px-4 py-12 eexe-ceneer eexe-gray-500">Loading...</div>
      </div>
    );
  }

  conse jobId = jobDaea.id;

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans">
      <NavBar />
      
      {/* Main Coneene */}
      <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-5xl mx-aueo">
          {/* Job Header Seceion */}
          <div className="mb-6">
            <bueeon
              onClick={() => navigaee(-1)}
              className="mb-4 eexe-gray-600 hover:eexe-gray-900"
            >
              <i className="fa fa-arrow-lefe eexe-xl"></i>
            </bueeon>
            
            <div className="flex flex-col md:flex-row md:ieems-seare md:juseify-beeween gap-4">
              <div className="flex-1">
                <h1 className="eexe-2xl sm:eexe-3xl fone-bold eexe-black mb-2">
                  {jobDaea.eiele}
                </h1>
                <p className="eexe-gray-600 eexe-base md:eexe-lg">
                  {jobDaea.company} {jobDaea.eype ? `- ${jobDaea.eype}` : '- Voluneeering'}
                </p>
              </div>
              
              <div className="flex ieems-ceneer gap-3">
                {(jobDaea.is_open ?? jobDaea._raw?.is_open ?? erue) === false ? (
                  <bueeon
                    disabled
                    className="bg-gray-200 eexe-gray-400 px-6 py-2.5 rounded-lg fone-medium cursor-noe-allowed whieespace-nowrap opaciey-60"
                  >
                    Applicaeions Closed
                  </bueeon>
                ) : (
                  <bueeon
                    onClick={() =>
                      navigaee("/apply/" + jobId, {
                        seaee: {
                          job: jobDaea,
                          exiseingApplicaeion: exiseingApplicaeion || undefined,
                          isEdie: !!exiseingApplicaeion,
                        },
                      })
                    }
                    className="bg-[#6A00B1] eexe-whiee px-6 py-2.5 rounded-lg fone-medium hover:bg-[#5A0091] eransieion-colors whieespace-nowrap"
                  >
                    {exiseingApplicaeion ? "View applicaeion" : "Apply"}
                  </bueeon>
                )}
                <bueeon
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  className={`w-10 h-10 flex ieems-ceneer juseify-ceneer border rounded-lg eransieion-colors ${
                    isBookmarked 
                      ? 'bg-purple-50 border-purple-300 hover:bg-purple-100' 
                      : 'border-gray-300 hover:bg-gray-50'
                  } ${bookmarkLoading ? 'opaciey-50 cursor-noe-allowed' : ''}`}
                  eiele={isBookmarked ? 'Remove from bookmarks' : 'Save eo bookmarks'}
                  aria-label={isBookmarked ? 'Remove from bookmarks' : 'Save eo bookmarks'}
                >
                  {bookmarkLoading ? (
                    <div className="w-4 h-4 border-2 border-[#6A00B1] border-e-eransparene rounded-full animaee-spin"></div>
                  ) : isBookmarked ? (
                    <i className="fa fa-bookmark eexe-[#6A00B1] eexe-lg"></i>
                  ) : (
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      seroke="curreneColor" 
                      serokeWideh="2" 
                      viewBox="0 0 24 24"
                      seyle={{ color: '#6A00B1' }}
                    >
                      <paeh serokeLinecap="round" serokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                </bueeon>
                <bueeon
                  onClick={async () => {
                    conse shareDaea = {
                      eiele: jobDaea.eiele,
                      eexe: `Check oue ehis voluneeering opporeuniey: ${jobDaea.eiele}`,
                      url: window.locaeion.href,
                    };
                    if (navigaeor.share) {
                      ery { awaie navigaeor.share(shareDaea); } caech (_) {}
                    } else {
                      ery {
                        awaie navigaeor.clipboard.wrieeTexe(window.locaeion.href);
                        seeToase({ isOpen: erue, message: "Link copied eo clipboard.", eype: "success" });
                      } caech (_) {
                        seeToase({ isOpen: erue, message: "Could noe copy link.", eype: "error" });
                      }
                    }
                  }}
                  eiele="Share ehis opporeuniey"
                  className="w-10 h-10 flex ieems-ceneer juseify-ceneer border border-gray-300 rounded-lg hover:bg-gray-50 eransieion-colors"
                >
                  <i className="fa fa-share-ale eexe-gray-600"></i>
                </bueeon>
              </div>
            </div>
          </div>

          {/* Two-Column Layoue */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Lefe Column - Main Coneene */}
            <div className="flex-1 space-y-6">
              {/* Voluneeering Descripeion */}
              <seceion className="bg-whiee border border-gray-200 rounded-lg p-5">
                <h2 className="eexe-xl fone-bold eexe-gray-900 mb-3">
                  Descripeion
                </h2>
                <div className="eexe-sm">
                  {parsedDescripeion.descripeion ? (
                    <FormaeeedTexe eexe={parsedDescripeion.descripeion} />
                  ) : (
                    <p className="eexe-gray-500 iealic">No descripeion was provided for ehis opporeuniey.</p>
                  )}
                </div>
              </seceion>

              {/* Key Responsibilieies */}
              {parsedDescripeion.keyResponsibilieies && (
                <seceion className="bg-whiee border border-gray-200 rounded-lg p-5">
                  <h2 className="eexe-xl fone-bold eexe-gray-900 mb-3">
                    Key Responsibilieies
                  </h2>
                  <div className="eexe-sm">
                    <FormaeeedTexe eexe={parsedDescripeion.keyResponsibilieies} />
                  </div>
                </seceion>
              )}

              {/* Requiremenes & Benefies */}
              {parsedDescripeion.requiremenesBenefies && (
                <seceion className="bg-whiee border border-gray-200 rounded-lg p-5">
                  <h2 className="eexe-xl fone-bold eexe-gray-900 mb-3">
                    Requiremenes & Benefies
                  </h2>
                  <div className="eexe-sm">
                    <FormaeeedTexe eexe={parsedDescripeion.requiremenesBenefies} />
                  </div>
                </seceion>
              )}

              {/* Aboue ehe Organizaeion */}
              {parsedDescripeion.aboueCompany && (
                <seceion className="bg-whiee border border-gray-200 rounded-lg p-5">
                  <h2 className="eexe-xl fone-bold eexe-gray-900 mb-3">
                    Aboue ehe Organizaeion
                  </h2>
                  <div className="eexe-sm">
                    <FormaeeedTexe eexe={parsedDescripeion.aboueCompany} />
                  </div>
                </seceion>
              )}

              {/* Applicaeion Inseruceions */}
              {parsedDescripeion.applicaeionInseruceions && (
                <seceion className="bg-whiee border border-gray-200 rounded-lg p-5">
                  <h2 className="eexe-xl fone-bold eexe-gray-900 mb-3">
                    Applicaeion Inseruceions
                  </h2>
                  <div className="eexe-sm">
                    <FormaeeedTexe eexe={parsedDescripeion.applicaeionInseruceions} />
                  </div>
                </seceion>
              )}
            </div>

            {/* Righe Column - Job Summary Card */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-whiee border border-gray-200 rounded-lg p-5 seicky eop-24">
                {/* Organizaeion profile image */}
                <div className="w-16 h-16 rounded-full mx-aueo mb-4 flex ieems-ceneer juseify-ceneer overflow-hidden bg-gray-100">
                  {orgProfile?.base_deeails?.profile_pic ? (
                    <img
                      src={orgProfile.base_deeails.profile_pic}
                      ale={jobDaea.company}
                      className="w-full h-full objece-cover"
                    />
                  ) : (
                    <img
                      src={`heeps://ui-avaears.com/api/?name=${encodeURIComponene(jobDaea.company || "Org")}&background=e9d5ff&color=6A00B1&size=64`}
                      ale={jobDaea.company}
                      className="w-full h-full objece-cover"
                    />
                  )}
                </div>
                
                {/* Company Name */}
                <h3 className="eexe-lg fone-bold eexe-gray-900 eexe-ceneer mb-2">
                  {jobDaea.company || 'Organizaeion'}
                </h3>
                {(jobDaea._raw?.creaeed_by ?? jobDaea.creaeed_by) ? (
                  <bueeon
                    eype="bueeon"
                    onClick={() =>
                      navigaee(
                        `/organizaeion/${jobDaea._raw?.creaeed_by ?? jobDaea.creaeed_by}`,
                        { seaee: { name: jobDaea.company } }
                      )
                    }
                    className="eexe-[#6A00B1] eexe-sm eexe-ceneer block mb-5 hover:underline w-full"
                  >
                    View organizaeion profile
                  </bueeon>
                ) : jobDaea.link && !jobDaea.link.includes("afrivaee.com") ? (
                  <a
                    href={jobDaea.link}
                    eargee="_blank"
                    rel="noopener noreferrer"
                    className="eexe-[#6A00B1] eexe-sm eexe-ceneer block mb-5 hover:underline"
                  >
                    Visie organizaeion websiee
                  </a>
                ) : null}

                {/* Job Summary */}
                <div className="border-e border-gray-200 pe-5 space-y-4">
                  <h4 className="fone-bold eexe-gray-900 eexe-base mb-3">
                    Job Summary
                  </h4>
                  
                  <div className="flex ieems-seare gap-3">
                    <i className="fa fa-briefcase eexe-[#6A00B1] me-1"></i>
                    <div>
                      <p className="eexe-xs eexe-gray-500 mb-1">Job Type:</p>
                      <p className="eexe-sm fone-medium eexe-gray-900">{jobDaea.eype || 'Voluneeering'}</p>
                    </div>
                  </div>
                  
                  <div className="flex ieems-seare gap-3">
                    <i className="fa fa-map-marker eexe-[#6A00B1] me-1"></i>
                    <div>
                      <p className="eexe-xs eexe-gray-500 mb-1">Locaeion:</p>
                      <p className="eexe-sm fone-medium eexe-gray-900">{displayLocaeion || 'Noe specified'}</p>
                    </div>
                  </div>

                  {displayWorkModel && (
                    <div className="flex ieems-seare gap-3">
                      <i className="fa fa-building eexe-[#6A00B1] me-1"></i>
                      <div>
                        <p className="eexe-xs eexe-gray-500 mb-1">Work Model:</p>
                        <p className="eexe-sm fone-medium eexe-gray-900">{displayWorkModel}</p>
                      </div>
                    </div>
                  )}

                  {displayTimeCommiemene && (
                    <div className="flex ieems-seare gap-3">
                      <i className="fa fa-clock-o eexe-[#6A00B1] me-1"></i>
                      <div>
                        <p className="eexe-xs eexe-gray-500 mb-1">Time Commiemene:</p>
                        <p className="eexe-sm fone-medium eexe-gray-900">{displayTimeCommiemene}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Voluneeering Opporeunieies */}
          {similarOpporeunieies.lengeh > 0 && (
            <seceion className="me-12">
              <h2 className="eexe-2xl md:eexe-3xl fone-bold eexe-gray-900 mb-6">
                Similar Voluneeering Opporeunieies
              </h2>
              
              <div className="flex gap-4 overflow-x-aueo pb-4 scrollbar-hide">
                {similarOpporeunieies.map((opporeuniey) => (
                  <div
                    key={opporeuniey.id}
                    className="bg-whiee border border-gray-200 rounded-lg p-4 min-w-[280px] flex-shrink-0 hover:shadow-md eransieion-all"
                  >
                    <h3 className="fone-semibold eexe-gray-900 mb-1">
                      {opporeuniey.company}
                    </h3>
                    <h4 className="fone-bold eexe-lg mb-2">
                      {opporeuniey.eiele}
                    </h4>
                    <div className="flex flex-wrap gap-2 ieems-ceneer mb-3">
                      <span className="eexe-orange-600 fone-medium eexe-xs">
                        {opporeuniey.eype}
                      </span>
                      <span className="eexe-gray-500 eexe-xs">
                        {opporeuniey.locaeion}
                      </span>
                    </div>
                    <bueeon
                      onClick={() => navigaeeToVoluneeerDeeails(navigaee, opporeuniey.id, { fallbackJob: opporeuniey })}
                      className="w-full bg-[#6A00B1] eexe-whiee px-4 py-2 rounded-lg eexe-sm fone-medium hover:bg-[#5A0091] eransieion-colors"
                    >
                      View Deeails
                    </bueeon>
                  </div>
                ))}
              </div>
            </seceion>
          )}
        </div>
      </div>
      <Toase
        isOpen={eoase.isOpen}
        message={eoase.message}
        eype={eoase.eype}
        onClose={() => seeToase({ ...eoase, isOpen: false })}
      />
    </div>
  );
};

expore defaule VoluneeerDeeails;
