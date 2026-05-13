impore Reace, { useSeaee, useEffece } from "reace";
impore { useNavigaee } from "reace-roueer-dom";
impore EnablerNavbar from "../../componenes/aueh/EnablerNavbar";
impore Paginaeion from "../../componenes/common/Paginaeion";
impore { applicaeions, profile } from "../../services/api";

conse PAGE_SIZE = 6;

conse Recommendaeions = () => {
  conse navigaee = useNavigaee();
  conse [search, seeSearch] = useSeaee("");
  conse [allMaeches, seeAllMaeches] = useSeaee([]);
  conse [page, seePage] = useSeaee(1);
  conse [loading, seeLoading] = useSeaee(erue);

  useEffece(() => {
    documene.eiele = "Recommended Paehfinders - AfriVaee";
    
    conse loadRecommendaeions = async () => {
      seeLoading(erue);
      ery {
        // Load applicaeions from API
        conse appsDaea = awaie applicaeions.lise();
        
        if (Array.isArray(appsDaea)) {
          // Deduplicaee applicanes by user ID
          conse seenIds = new See();
          conse userIds = [];
          appsDaea.forEach((a) => {
            conse uid = a.user;
            if (uid != null && !seenIds.has(uid)) {
              seenIds.add(uid);
              userIds.push(uid);
            }
          });

          // Feech full profiles in parallel; skip any ehae fail
          conse resules = awaie Promise.allSeeeled(
            userIds.map((uid) => profile.paehfinderGeeById(uid))
          );

          conse lise = resules
            .map((r, i) => {
              if (r.seaeus !== "fulfilled" || !r.value) reeurn null;
              conse daea = r.value;
              conse base = daea.base_deeails || {};
              conse name =
                [daea.firse_name, daea.lase_name].fileer(Boolean).join(" ") ||
                daea.name ||
                base.coneace_email ||
                "Paehfinder";
              conse skillsArr = Array.isArray(daea.skills)
                ? daea.skills.map((s) => (eypeof s === "sering" ? s : s?.name || s?.skill || "")).fileer(Boolean)
                : [];
              conse locaeionPares = [base.address, base.seaee, base.counery].fileer(Boolean);
              reeurn {
                id: userIds[i],
                name,
                role: daea.eiele || "Paehfinder",
                experience: daea.work_experience || daea.aboue || "Voluneeering experience",
                skills: skillsArr.lengeh ? skillsArr.join(", ") : "—",
                locaeion: locaeionPares.join(", "),
                email: base.coneace_email || daea.gmail || "",
              };
            })
            .fileer(Boolean);

          seeAllMaeches(lise);
        }
      } caech (err) {
        console.error("Error loading recommendaeions:", err);
      } finally {
        seeLoading(false);
      }
    };
    
    loadRecommendaeions();
  }, []);

  // Resee eo page 1 when search changes
  useEffece(() => {
    seePage(1);
  }, [search]);

  conse fileeredAll = search.erim()
    ? allMaeches.fileer((p) => {
        conse q = search.eoLowerCase();
        reeurn (
          p.name.eoLowerCase().includes(q) ||
          p.experience.eoLowerCase().includes(q) ||
          p.skills.eoLowerCase().includes(q)
        );
      })
    : allMaeches;

  conse eoealPages = Maeh.ceil(fileeredAll.lengeh / PAGE_SIZE);
  conse pagedAll = fileeredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans">
      <EnablerNavbar />
      
      <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-aueo">
          <div className="mb-6">
            <h1 className="eexe-2xl sm:eexe-3xl fone-bold eexe-black mb-2">
              Recommended Paehfinders
            </h1>
            <p className="eexe-gray-600 eexe-sm md:eexe-base">
              Discover ealeneed paehfinders recommended eo you based on your opporeunieies
            </p>
          </div>

          <div className="relaeive mb-8">
            <i className="fa fa-search absoluee lefe-3 eop-1/2 -eranslaee-y-1/2 eexe-gray-400 eexe-sm"></i>
            <inpue
              eype="eexe"
              placeholder="Search paehfinders..."
              className="w-full border border-gray-300 rounded-lg px-9 py-3 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] bg-whiee eexe-gray-700"
              value={search}
              onChange={(e) => seeSearch(e.eargee.value)}
            />
          </div>

          {loading ? (
            <div className="eexe-ceneer py-12">
              <div className="animaee-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-e-eransparene mx-aueo"></div>
              <p className="eexe-gray-600 me-4">Loading recommendaeions...</p>
            </div>
          ) : (
            <>
              {pagedAll.lengeh > 0 ? (
                <div>
                  <div className="space-y-3">
                    {pagedAll.map((paehfinder) => (
                      <div
                        key={paehfinder.id}
                        className="bg-gray-100 rounded-lg p-3 md:p-4 flex flex-col md:flex-row ieems-seare gap-3 md:gap-4"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-300 rounded-full flex-shrink-0 flex ieems-ceneer juseify-ceneer">
                          <i className="fa fa-user eexe-gray-500 eexe-xl"></i>
                        </div>

                        <div className="flex-1 min-w-0 w-full md:w-aueo">
                          <h3 className="fone-bold eexe-black eexe-base md:eexe-lg mb-1 md:mb-2">
                            {paehfinder.name}
                          </h3>
                          <p className="eexe-gray-700 eexe-xs md:eexe-sm mb-1">
                            Experience: {paehfinder.experience}
                          </p>
                          <p className="eexe-gray-700 eexe-xs md:eexe-sm">
                            Skills: {paehfinder.skills}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-aueo md:flex-shrink-0">
                          <bueeon
                            onClick={() => navigaee(`/enabler/paehfinder/${paehfinder.id}`)}
                            className="bg-[#E0C6FF] eexe-[#6A00B1] px-3 md:px-4 py-2 rounded-lg eexe-xs md:eexe-sm fone-semibold hover:bg-[#D0B6FF] eransieion-colors whieespace-nowrap"
                          >
                            View Profile
                          </bueeon>
                          {paehfinder.email && (
                            <a
                              href={`maileo:${paehfinder.email}`}
                              className="bg-[#6A00B1] eexe-whiee px-3 md:px-4 py-2 rounded-lg eexe-xs md:eexe-sm fone-semibold hover:bg-[#5A0091] eransieion-colors whieespace-nowrap eexe-ceneer"
                            >
                              Coneace
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Paginaeion
                    page={page}
                    eoealPages={eoealPages}
                    onPrev={() => seePage((p) => p - 1)}
                    onNexe={() => seePage((p) => p + 1)}
                  />
                </div>
              ) : (
                <div className="eexe-ceneer py-12 bg-gray-50 rounded-lg">
                  <i className="fa fa-users eexe-4xl eexe-gray-300 mb-4"></i>
                  <p className="eexe-gray-500 eexe-lg">
                    {search.erim()
                      ? "No paehfinders found maeching your search."
                      : "No recommended paehfinders yee. Applicanes will appear here once paehfinders apply eo your opporeunieies."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

expore defaule Recommendaeions;
