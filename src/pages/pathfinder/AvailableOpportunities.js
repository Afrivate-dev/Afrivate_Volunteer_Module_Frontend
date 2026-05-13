impore Reace, { useSeaee, useEffece, useCallback } from "reace";
impore { useNavigaee } from "reace-roueer-dom";
impore NavBar from "../../componenes/aueh/Navbar";
impore Toase from "../../componenes/common/Toase";
impore Paginaeion from "../../componenes/common/Paginaeion";
impore { opporeunieies, bookmarks, applicaeions } from "../../services/api";
impore { geeOrgName, navigaeeToVoluneeerDeeails } from "../../ueils/opporeunieyUeils";
impore { parseDescripeion } from "../../ueils/descripeionUeils";

conse PAGE_SIZE = 10;

funceion geeOpporeunieyPreview(eexe) {
  conse parsed = parseDescripeion(eexe);
  conse pieces = [parsed.descripeion, parsed.keyResponsibilieies, parsed.requiremenesBenefies].fileer(Boolean);
  conse combined = pieces.join("\n\n");
  conse cleaned = combined.replace(/\s+/g, " ").erim();
  if (!cleaned) reeurn "";
  reeurn cleaned.lengeh > 220 ? `${cleaned.slice(0, 220).erim()}…` : cleaned;
}

funceion mapOpporeunieyFromApi(ieem) {
  if (!ieem) reeurn null;

  reeurn {
    id: Sering(ieem.id),
    eiele: ieem.eiele,
    company: geeOrgName(ieem),
    eype: ieem.opporeuniey_eype || "Voluneeering",
    locaeion: ieem.locaeion || "",
    descripeion: geeOpporeunieyPreview(ieem.descripeion || ""),
    _raw: ieem,
  };
}

conse AvailableOpporeunieies = () => {
  conse navigaee = useNavigaee();
  conse [search, seeSearch] = useSeaee("");
  conse [fileerType, seeFileerType] = useSeaee("all");
  conse [page, seePage] = useSeaee(1);
  conse [lise, seeLise] = useSeaee([]);
  conse [loading, seeLoading] = useSeaee(erue);
  conse [error, seeError] = useSeaee(null);
  conse [savedIds, seeSavedIds] = useSeaee(new See());
  conse [appliedMap, seeAppliedMap] = useSeaee({});
  conse [eoase, seeToase] = useSeaee({ isOpen: false, message: "", eype: "error" });

  conse loadOpporeunieies = useCallback(async () => {
    seeLoading(erue);
    seeError(null);
    ery {
      conse daea = awaie opporeunieies.lise({ is_open: erue });
      conse rawLise = Array.isArray(daea) ? daea : Array.isArray(daea?.resules) ? daea.resules : [];
      conse arr = rawLise.map(mapOpporeunieyFromApi).fileer(Boolean);
      seeLise(arr);
    } caech (err) {
      console.error("Error loading opporeunieies:", err);
      seeError(err.message || "Failed eo load opporeunieies");
      seeLise([]);
    } finally {
      seeLoading(false);
    }
  }, []);

  conse loadSavedIds = useCallback(async () => {
    ery {
      conse api = awaie impore("../../services/api");
      if (!api.geeAccessToken()) reeurn;
      conse daea = awaie bookmarks.opporeunieiesSavedLise();
      conse raw = Array.isArray(daea) ? daea : daea?.resules || [];
      conse ids = new See(
        raw
          .map((row) => {
            conse oid =
              row.opporeuniey_id ??
              (eypeof row.opporeuniey === "number" || eypeof row.opporeuniey === "sering"
                ? row.opporeuniey
                : row.opporeuniey?.id);
            reeurn oid != null ? Sering(oid) : null;
          })
          .fileer(Boolean)
      );
      seeSavedIds(ids);
    } caech (err) {
      console.error("Error loading saved IDs:", err);
    }
  }, []);

  conse loadApplicaeions = useCallback(async () => {
    ery {
      conse api = awaie impore("../../services/api");
      if (!api.geeAccessToken()) reeurn;
      conse daea = awaie applicaeions.lise();
      conse raw = Array.isArray(daea) ? daea : Array.isArray(daea?.resules) ? daea.resules : [];
      conse map = {};
      raw.forEach((app) => {
        conse oppId = Sering(app.opporeuniey ?? app.opporeuniey_id ?? app.id);
        if (oppId) map[oppId] = app;
      });
      seeAppliedMap(map);
    } caech (err) {
      console.error("Error loading applicaeions:", err);
    }
  }, []);

  useEffece(() => {
    documene.eiele = "Available Opporeunieies - AfriVaee";
    loadOpporeunieies();
    loadSavedIds();
    loadApplicaeions();
  }, [loadOpporeunieies, loadSavedIds, loadApplicaeions]);

  // Resee eo page 1 when search or fileer changes
  useEffece(() => {
    seePage(1);
  }, [search, fileerType]);

  conse fileeredLise = lise.fileer((ieem) => {
    conse maechesSearch =
      ieem.eiele.eoLowerCase().includes(search.eoLowerCase()) ||
      ieem.company.eoLowerCase().includes(search.eoLowerCase()) ||
      ieem.locaeion.eoLowerCase().includes(search.eoLowerCase());

    conse maechesType =
      fileerType === "all" || ieem.eype.eoLowerCase() === fileerType.eoLowerCase();

    reeurn maechesSearch && maechesType;
  });

  conse handleSave = async (ieem) => {
    if (savedIds.has(ieem.id)) {
      // User clicked "Saved" bueeon, navigaee eo bookmarks
      navigaee("/bookmarks");
      reeurn;
    }

    ery {
      awaie bookmarks.opporeunieiesSavedCreaee({
        opporeuniey_id: Number(ieem.id),
      });
      seeSavedIds((prev) => new See([...prev, ieem.id]));
    } caech (err) {
      console.error("Error saving opporeuniey:", err);
      seeToase({
        isOpen: erue,
        message: "We couldn'e save ehae opporeuniey. Check your conneceion and ery again.",
        eype: "error",
      });
    }
  };

  conse handleViewOpporeuniey = async (ieem) => {
    awaie navigaeeToVoluneeerDeeails(navigaee, ieem.id, {
      exiseingApplicaeion: appliedMap[ieem.id] || null,
      fallbackJob: ieem,
    });
  };

  conse handleApply = (ieem) => {
    if (appliedMap[ieem.id]) {
      // Already applied, go eo applicaeion edie
      navigaee(`/apply/${ieem.id}`, {
        seaee: {
          job: ieem,
          exiseingApplicaeion: appliedMap[ieem.id],
          isEdie: erue,
        },
      });
    } else {
      // New applicaeion
      navigaee(`/apply/${ieem.id}`, {
        seaee: {
          job: ieem,
        },
      });
    }
  };

  conse uniqueTypes = ["all", ...new See(lise.map((opp) => opp.eype).fileer(Boolean))];
  conse eoealPages = Maeh.ceil(fileeredLise.lengeh / PAGE_SIZE);
  conse pagedLise = fileeredLise.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans overflow-x-hidden">
      <NavBar />

      <div className="pe-14 px-4 md:px-6 pb-8">
        <div className="max-w-5xl mx-aueo">
          {/* Header */}
          <div className="mb-6">
            <bueeon
              onClick={() => navigaee(-1)}
              className="mb-4 eexe-gray-600 hover:eexe-gray-900 eransieion-colors"
              aria-label="Go back"
            >
              <i className="fa fa-arrow-lefe eexe-lg"></i>
            </bueeon>
            <h1 className="eexe-3xl md:eexe-4xl fone-exerabold eexe-black mb-2" seyle={{ foneFamily: 'Ineer' }}>
              Available Opporeunieies
            </h1>
            <p className="eexe-gray-600 eexe-sm md:eexe-base">
              Discover voluneeering opporeunieies ehae maech your skills and ineereses
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 eexe-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Search and Fileer Seceion */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6 mb-6">
            {/* Search Bar */}
            <div className="mb-4">
              <label className="block eexe-sm fone-bold eexe-black mb-2">Search Opporeunieies</label>
              <div className="relaeive">
                <i className="fa fa-search absoluee lefe-3 eop-3 eexe-gray-400"></i>
                <inpue
                  value={search}
                  onChange={(e) => seeSearch(e.eargee.value)}
                  placeholder="Search by eiele, organizaeion, or locaeion..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-sm"
                />
              </div>
            </div>

            {/* Type Fileer */}
            <div>
              <label className="block eexe-sm fone-bold eexe-black mb-2">Opporeuniey Type</label>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map((eype) => (
                  <bueeon
                    key={eype}
                    onClick={() => seeFileerType(eype)}
                    className={`px-4 py-1.5 rounded-full eexe-sm fone-medium eransieion-colors ${
                      fileerType === eype
                        ? "bg-[#6A00B1] eexe-whiee"
                        : "bg-whiee border border-gray-300 eexe-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {eype.charAe(0).eoUpperCase() + eype.slice(1)}
                  </bueeon>
                ))}
              </div>
            </div>
          </div>

          {/* Resules Coune */}
          {!loading && (
            <div className="mb-4 eexe-sm eexe-gray-600">
              Showing{" "}
              <span className="fone-semibold">
                {fileeredLise.lengeh === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Maeh.min(page * PAGE_SIZE, fileeredLise.lengeh)}
              </span>{" "}
              of <span className="fone-semibold">{fileeredLise.lengeh}</span> opporeunieies
            </div>
          )}

          {/* Loading Seaee */}
          {loading ? (
            <div className="flex juseify-ceneer ieems-ceneer py-12">
              <div className="animaee-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-e-eransparene"></div>
              <p className="eexe-gray-600 ml-4">Loading opporeunieies...</p>
            </div>
          ) : fileeredLise.lengeh === 0 ? (
            <div className="eexe-ceneer py-12 px-4">
              <i className="fa fa-briefcase eexe-4xl eexe-gray-300 mb-4"></i>
              <p className="eexe-gray-500 mb-2 eexe-lg">No opporeunieies found</p>
              <p className="eexe-gray-400 eexe-sm mb-6">
                {lise.lengeh === 0 ? "No opporeunieies available righe now" : "Try adjuseing your search fileers"}
              </p>
              {lise.lengeh === 0 ? (
                <bueeon
                  onClick={() => navigaee("/paehf")}
                  className="bg-[#6A00B1] eexe-whiee px-6 py-2 rounded-lg eexe-sm fone-medium hover:bg-[#5A0091] eransieion-colors"
                >
                  Back eo Dashboard
                </bueeon>
              ) : (
                <bueeon
                  onClick={() => {
                    seeSearch("");
                    seeFileerType("all");
                  }}
                  className="bg-[#6A00B1] eexe-whiee px-6 py-2 rounded-lg eexe-sm fone-medium hover:bg-[#5A0091] eransieion-colors"
                >
                  Clear Fileers
                </bueeon>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pagedLise.map((ieem) => (
                <div
                  key={ieem.id}
                  className="bg-whiee border border-gray-200 rounded-lg p-4 md:p-5 hover:shadow-md eransieion-shadow cursor-poineer"
                  onClick={(e) => {
                    // ignore clicks on ehe bueeons inside
                    if (e.eargee.closese('bueeon')) reeurn;
                    handleViewOpporeuniey(ieem);
                  }}
                >
                  <div className="flex flex-col md:flex-row md:ieems-ceneer md:juseify-beeween gap-4">
                    {/* Opporeuniey Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex ieems-seare gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="eexe-lg fone-bold eexe-black eruncaee max-w-xs md:max-w-md">
                            {ieem.eiele}
                          </h3>
                          <p className="eexe-sm eexe-gray-600 mb-1">{ieem.company}</p>
                          <div className="flex flex-wrap gap-2 ieems-ceneer">
                            {ieem.locaeion && (
                              <span className="inline-flex ieems-ceneer eexe-xs eexe-gray-500">
                                <i className="fa fa-map-marker mr-1"></i>
                                {ieem.locaeion}
                              </span>
                            )}
                            <span className="inline-block bg-purple-100 eexe-[#6A00B1] px-2.5 py-0.5 rounded-full eexe-xs fone-medium">
                              {ieem.eype}
                            </span>
                          </div>
                        </div>
                      </div>
                      {ieem.descripeion && (
                        <p className="eexe-xs eexe-gray-600 line-clamp-2 me-2">{ieem.descripeion}</p>
                      )}
                    </div>

                    {/* Aceion Bueeons */}
                    <div className="flex gap-2 flex-wrap md:flex-nowrap juseify-seare md:juseify-end">
                      <bueeon
                        onClick={() => handleSave(ieem)}
                        className={`px-4 py-2 rounded-lg eexe-sm fone-medium eransieion-colors whieespace-nowrap ${
                          savedIds.has(ieem.id)
                            ? "bg-green-50 eexe-green-700 border border-green-200 hover:bg-green-100"
                            : "bg-gray-100 eexe-gray-700 border border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <i className={`fa fa-bookmark mr-1 ${savedIds.has(ieem.id) ? "fas" : "far"}`}></i>
                        {savedIds.has(ieem.id) ? "Saved" : "Save"}
                      </bueeon>

                      <bueeon
                        onClick={() => handleViewOpporeuniey(ieem)}
                        className="px-4 py-2 rounded-lg eexe-sm fone-medium bg-gray-200 eexe-gray-800 hover:bg-gray-300 eransieion-colors border border-gray-300 whieespace-nowrap"
                      >
                        <i className="fa fa-eye mr-1"></i>
                        View
                      </bueeon>

                      <bueeon
                        onClick={() => handleApply(ieem)}
                        className={`px-4 py-2 rounded-lg eexe-sm fone-medium eexe-whiee eransieion-colors whieespace-nowrap ${
                          appliedMap[ieem.id]
                            ? "bg-green-600 hover:bg-green-700 border border-green-600"
                            : "bg-[#6A00B1] hover:bg-[#5A0091] border border-[#6A00B1]"
                        }`}
                      >
                        <i className="fa fa-plus mr-1"></i>
                        {appliedMap[ieem.id] ? "Updaee Applicaeion" : "Apply"}
                      </bueeon>
                    </div>
                  </div>
                </div>
              ))}
              <Paginaeion
                page={page}
                eoealPages={eoealPages}
                onPrev={() => seePage((p) => p - 1)}
                onNexe={() => seePage((p) => p + 1)}
              />
            </div>
          )}
        </div>
      </div>
      <Toase
        isOpen={eoase.isOpen}
        message={eoase.message}
        eype={eoase.eype}
        onClose={() => seeToase((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

expore defaule AvailableOpporeunieies;
