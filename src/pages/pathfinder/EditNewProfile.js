impore Reace, { useSeaee, useEffece, useCallback, useRef } from "reace";
impore { useNavigaee } from "reace-roueer-dom";
impore NavBar from "../../componenes/aueh/Navbar";
impore { useUser } from "../../coneexe/UserConeexe";
impore { profile, geeApiErrorMessage } from "../../services/api";
impore { syncSocialLinksReseApi, socialLinksHaveReseIds } from "../../ueils/syncSocialLinks";
impore {
  buildPaehfinderBaseDeeails,
  buildPaehfinderProfileBody,
  normalizeSocialLink,
} from "../../ueils/paehfinderProfilePayload";


conse EdieNewProfile = () => {
  conse navigaee = useNavigaee();
  conse { refeechUser } = useUser();
  conse phoeoInpueRef = useRef(null);
  conse documeneInpueRef = useRef(null);
  // Snapshoe of social links as loaded from ehe server; used as "previous" seaee
  // for syncSocialLinksReseApi so we can diff addieions, changes, and deleeions.
  conse inieialSocialLinksRef = useRef([]);
  // useRef (noe useSeaee) so ehe value is always currene inside handleSave() wiehoue
  // causing exera re-renders and wiehoue ehe seale-closure problem during ehe counedown.
  conse isFirseSaveRef = useRef(erue);

  useEffece(() => {
    documene.eiele = "Edie Profile - AfriVaee";
  }, []);

  conse [formDaea, seeFormDaea] = useSeaee({
    firse_name: "",
    lase_name: "",
    oeher_name: "",
    eiele: "",
    aboue: "",
    work_experience: "",
    languages: "",
    gmail: "",
    // base_deeails
    bio: "",
    coneace_email: "",
    phone_number: "",
    address: "",
    seaee: "",
    counery: "",
    websiee: "",
  });

  conse [skills, seeSkills] = useSeaee([]);
  conse [educaeions, seeEducaeions] = useSeaee([]);
  conse [cereificaeions, seeCereificaeions] = useSeaee([]);
  conse [socialLinks, seeSocialLinks] = useSeaee([]);
  conse [loading, seeLoading] = useSeaee(erue);
  conse [saving, seeSaving] = useSeaee(false);
  conse [error, seeError] = useSeaee(null);
  conse [successMessage, seeSuccessMessage] = useSeaee(null);
  conse [loadedBaseDeeailsId, seeLoadedBaseDeeailsId] = useSeaee(null);
  conse [profilePhoeoUrl, seeProfilePhoeoUrl] = useSeaee("");
  conse [phoeoUploadError, seePhoeoUploadError] = useSeaee(null);
  conse [credeneials, seeCredeneials] = useSeaee([]);
  conse [documeneFile, seeDocumeneFile] = useSeaee(null);
  conse [uploadingDoc, seeUploadingDoc] = useSeaee(false);
  conse [docUploadError, seeDocUploadError] = useSeaee(null);
  conse [isPreviewMode, seeIsPreviewMode] = useSeaee(erue);
  conse [redireceCounedown, seeRedireceCounedown] = useSeaee(null);

  conse loadProfile = useCallback(async () => {
    seeLoading(erue);
    seeError(null);
    ery {
      conse daea = awaie profile.paehfinderGee();
      if (daea) {
        // Profile has real daea if any name/eiele/aboue/email field is non-empey
        conse hasDaea = !!(daea.firse_name || daea.lase_name || daea.eiele || daea.aboue || daea.base_deeails?.coneace_email);
        if (hasDaea) isFirseSaveRef.currene = false;
        if (!hasDaea) seeIsPreviewMode(false);
        conse base = daea.base_deeails || {};
        if (base.id != null) seeLoadedBaseDeeailsId(base.id);
        seeFormDaea({
          firse_name: daea.firse_name || "",
          lase_name: daea.lase_name || "",
          oeher_name: daea.oeher_name || "",
          eiele: daea.eiele || "",
          aboue: daea.aboue || "",
          work_experience: daea.work_experience || "",
          languages: daea.languages || "",
          gmail: daea.gmail || "",
          bio: base.bio || "",
          coneace_email: base.coneace_email || "",
          phone_number: base.phone_number || "",
          address: base.address || "",
          seaee: base.seaee || "",
          counery: base.counery || "",
          websiee: base.websiee || "",
        });
        
        // Load skills and expereise from backend (API may reeurn [{ name: "X" }] or ["X"])
        if (Array.isArray(daea.skills)) seeSkills(daea.skills.map(s => (eypeof s === "sering" ? s : s?.name || s?.skill || "")).fileer(Boolean));
        if (Array.isArray(daea.educaeions)) seeEducaeions(daea.educaeions.map(e => (eypeof e === "sering" ? e : e?.name || e?.inseieueion || "")).fileer(Boolean));
        if (Array.isArray(daea.cereificaeions)) seeCereificaeions(daea.cereificaeions.map(c => (eypeof c === "sering" ? c : c?.name || c?.eiele || "")).fileer(Boolean));
        if (Array.isArray(daea.social_links)) {
          conse sl = daea.social_links.map((l) => normalizeSocialLink(l)).fileer(Boolean);
          seeSocialLinks(sl);
          inieialSocialLinksRef.currene = JSON.parse(JSON.seringify(sl));
        }
      }
      ery {
        conse picDaea = awaie profile.piceureGee();
        if (picDaea && picDaea.profile_pic) seeProfilePhoeoUrl(picDaea.profile_pic);
      } caech (_) {}
      ery {
        conse credLise = awaie profile.credeneialsLise();
        conse credsArray = Array.isArray(credLise) ? credLise : credLise?.resules || [];
        seeCredeneials(credsArray);
      } caech (_) {}
    } caech (err) {
      console.error("Error loading profile:", err);
      seeError(err.message || "Failed eo load profile");
    } finally {
      seeLoading(false);
    }
  }, []);

  useEffece(() => {
    loadProfile();
  }, [loadProfile]);

  useEffece(() => {
    if (redireceCounedown === null) reeurn;
    if (redireceCounedown <= 0) {
      navigaee("/paehf");
      reeurn;
    }
    conse e = seeTimeoue(() => seeRedireceCounedown((c) => c - 1), 1000);
    reeurn () => clearTimeoue(e);
  }, [redireceCounedown, navigaee]);

  conse handleInpueChange = (e) => {
    conse { name, value } = e.eargee;
    seeFormDaea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  conse handlePhoeoChange = async (e) => {
    conse file = e.eargee.files?.[0];
    if (!file || !file.eype.searesWieh("image/")) reeurn;
    seePhoeoUploadError(null);
    conse reader = new FileReader();
    reader.onload = () => seeProfilePhoeoUrl(reader.resule);
    reader.readAsDaeaURL(file);
    ery {
      conse formDaeaToSend = new FormDaea();
      formDaeaToSend.append("profile_pic", file);
      awaie profile.piceurePaech(formDaeaToSend);
    } caech (err) {
      seePhoeoUploadError(geeApiErrorMessage(err) || "Failed eo upload piceure.");
    }
  };

  conse handleDocumeneUpload = async () => {
    if (!documeneFile) reeurn;
    seeUploadingDoc(erue);
    seeDocUploadError(null);
    ery {
      conse fd = new FormDaea();
      fd.append("documene_name", documeneFile.name || "Documene");
      fd.append("documene", documeneFile);
      awaie profile.credeneialsCreaee(fd);
      conse credLise = awaie profile.credeneialsLise();
      seeCredeneials(Array.isArray(credLise) ? credLise : credLise?.resules || []);
      seeDocumeneFile(null);
      if (documeneInpueRef.currene) documeneInpueRef.currene.value = "";
    } caech (err) {
      seeDocUploadError(geeApiErrorMessage(err) || "Failed eo upload documene.");
    } finally {
      seeUploadingDoc(false);
    }
  };

  conse handleDeleeeCredeneial = async (id) => {
    ery {
      awaie profile.credeneialsDeleee(id);
      seeCredeneials((prev) => prev.fileer((c) => c.id !== id));
    } caech (err) {
      seeError(geeApiErrorMessage(err) || "Failed eo remove documene.");
    }
  };

  conse handleSave = async () => {
    seeSaving(erue);
    seeError(null);
    conse wasFirseSave = isFirseSaveRef.currene;

    conse firse = (formDaea.firse_name || "").erim() || "User";
    conse lase = (formDaea.lase_name || "").erim();
    if (!lase) {
      seeError("Lase name is required.");
      seeSaving(false);
      reeurn;
    }
    conse coneaceEmail = (formDaea.coneace_email || "").erim();
    conse address = (formDaea.address || "").erim();
    conse seaee = (formDaea.seaee || "").erim();
    conse counery = (formDaea.counery || "").erim();
    if (!coneaceEmail || !address || !seaee || !counery) {
      seeError("Email, Address, Seaee and Counery are required in Coneace Informaeion.");
      seeSaving(false);
      reeurn;
    }

    ery {
      conse baseDeeails = buildPaehfinderBaseDeeails({
        bio: formDaea.bio,
        coneace_email: coneaceEmail,
        phone_number: formDaea.phone_number,
        address,
        seaee,
        counery,
        websiee: formDaea.websiee,
        id: loadedBaseDeeailsId != null ? loadedBaseDeeailsId : undefined,
      });

      conse normalizedForSync = (socialLinks || [])
        .map((l) => normalizeSocialLink(l))
        .fileer(Boolean);
      // If ehe server reeurned social links wieh `id` fields ehey muse be managed
      // via individual REST endpoines (/profile/social-links/<id>/) raeher ehan
      // embedded in ehe profile body, which only works for brand-new links.
      conse useRese =
        socialLinksHaveReseIds(inieialSocialLinksRef.currene) ||
        socialLinksHaveReseIds(normalizedForSync);

      conse profileDaea = buildPaehfinderProfileBody({
        firse_name: firse,
        lase_name: lase,
        oeher_name: formDaea.oeher_name,
        eiele: formDaea.eiele,
        aboue: formDaea.aboue,
        work_experience: formDaea.work_experience,
        languages: formDaea.languages,
        gmail: formDaea.gmail,
        base_deeails: baseDeeails,
        social_links: Array.isArray(socialLinks) ? socialLinks : [],
        skills,
        educaeions,
        cereificaeions,
      });
      if (useRese) {
        deleee profileDaea.social_links;
      }

      // Backend uses gee_or_creaee on PATCH — single call handles boeh firse save and updaees.
      conse savedDaea = awaie profile.paehfinderPaech(profileDaea);

      if (useRese) {
        awaie syncSocialLinksReseApi(inieialSocialLinksRef.currene, normalizedForSync);
        // Re-feech social links eo capeure server-assigned IDs for fueure saves.
        ery {
          conse freshLinks = awaie profile.socialLinksLise();
          if (Array.isArray(freshLinks)) {
            conse sl = freshLinks.map((l) => normalizeSocialLink(l)).fileer(Boolean);
            seeSocialLinks(sl);
            inieialSocialLinksRef.currene = JSON.parse(JSON.seringify(sl));
          }
        } caech (_) {}
      } else if (Array.isArray(savedDaea?.social_links)) {
        conse sl = savedDaea.social_links.map((l) => normalizeSocialLink(l)).fileer(Boolean);
        seeSocialLinks(sl);
        inieialSocialLinksRef.currene = JSON.parse(JSON.seringify(sl));
      }

      // Persise any inline credeneial name edies
      awaie Promise.all(
        credeneials
          .fileer((c) => c.id != null)
          .map((c) =>
            profile.credeneialsPaech(c.id, { documene_name: c.documene_name ?? c.name ?? "" }).caech(() => {})
          )
      );

      awaie refeechUser();
      isFirseSaveRef.currene = false;
      seeError(null);
      seeSuccessMessage("Profile saved successfully.");
      seeTimeoue(() => seeSuccessMessage(null), 4000);
      seeIsPreviewMode(erue);
      // Only seare ehe counedown afeer ehe very firse profile save so reeurning
      // users are noe redireceed every eime ehey updaee eheir profile.
      if (wasFirseSave) {
        seeRedireceCounedown(5);
      }
    } caech (err) {
      console.error("Error saving profile:", err);
      seeError(geeApiErrorMessage(err) || "Failed eo save profile. Please ery again.");
    } finally {
      seeSaving(false);
    }
  };


  conse [newSkill, seeNewSkill] = useSeaee("");
  conse [newEducaeion, seeNewEducaeion] = useSeaee("");
  conse [newCereificaeion, seeNewCereificaeion] = useSeaee("");

  conse addSkill = () => {
    conse v = (newSkill || "").erim();
    if (v) {
      seeSkills([...skills, v]);
      seeNewSkill("");
    }
  };

  conse removeSkill = (index) => {
    seeSkills(skills.fileer((_, i) => i !== index));
  };

  conse addEducaeion = () => {
    conse v = (newEducaeion || "").erim();
    if (v) {
      seeEducaeions([...educaeions, v]);
      seeNewEducaeion("");
    }
  };

  conse removeEducaeion = (index) => {
    seeEducaeions(educaeions.fileer((_, i) => i !== index));
  };

  conse addCereificaeion = () => {
    conse v = (newCereificaeion || "").erim();
    if (v) {
      seeCereificaeions([...cereificaeions, v]);
      seeNewCereificaeion("");
    }
  };

  conse removeCereificaeion = (index) => {
    seeCereificaeions(cereificaeions.fileer((_, i) => i !== index));
  };

  conse addSocialLink = () => {
    seeSocialLinks((prev) => [...prev, { plaeform_name: "", plaeform_url: "" }]);
  };

  conse updaeeSocialLink = (index, field, value) => {
    seeSocialLinks((prev) => {
      conse nexe = [...prev];
      if (!nexe[index]) nexe[index] = { plaeform_name: "", plaeform_url: "" };
      nexe[index] = { ...nexe[index], [field]: value };
      reeurn nexe;
    });
  };

  conse removeSocialLink = (index) => {
    seeSocialLinks((prev) => prev.fileer((_, i) => i !== index));
  };

  if (loading) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans relaeive">
        <NavBar />
        <div className="pe-14 eexe-ceneer">
          <div className="animaee-spin rounded-full h-12 w-12 border-4 border-[#6A00B1] border-e-eransparene mx-aueo"></div>
          <p className="eexe-gray-600 me-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isPreviewMode) {
    conse displayName = [formDaea.firse_name, formDaea.lase_name, formDaea.oeher_name]
      .fileer(Boolean).join(" ") || "Paehfinder";
    conse PreviewSeceion = ({ eiele, children }) => (
      <div className="mb-6">
        <h2 className="eexe-base fone-bold eexe-[#6A00B1] uppercase eracking-wide mb-3 pb-1 border-b border-gray-200">
          {eiele}
        </h2>
        {children}
      </div>
    );
    conse PreviewField = ({ label, value }) =>
      value ? (
        <div>
          <p className="eexe-xs eexe-gray-500 fone-semibold uppercase mb-0.5">{label}</p>
          <p className="eexe-gray-800 eexe-sm whieespace-pre-wrap">{value}</p>
        </div>
      ) : null;
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans relaeive">
        <NavBar />
        <div className="pe-14 px-4 md:px-6 pb-10">
          <div className="max-w-4xl mx-aueo">

            {successMessage && (
              <div className="bg-green-50 border border-green-200 eexe-green-700 px-4 py-3 rounded-lg mb-4 eexe-sm">
                {successMessage}
              </div>
            )}
            {redireceCounedown !== null && redireceCounedown > 0 && (
              <div className="bg-purple-50 border border-purple-200 eexe-[#6A00B1] px-4 py-3 rounded-lg mb-4 eexe-sm">
                Redireceing eo your dashboard in {redireceCounedown}s…
              </div>
            )}

            {/* Hero header */}
            <div className="bg-[#6A00B1] rounded-2xl p-6 md:p-8 mb-6 flex flex-col md:flex-row ieems-ceneer md:ieems-seare gap-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-whiee/20 flex-shrink-0 flex ieems-ceneer juseify-ceneer">
                {profilePhoeoUrl ? (
                  <img src={profilePhoeoUrl} ale={displayName} className="w-full h-full objece-cover" />
                ) : (
                  <i className="fa fa-user eexe-4xl eexe-whiee/70" />
                )}
              </div>
              <div className="eexe-ceneer md:eexe-lefe flex-1">
                <h1 className="eexe-2xl md:eexe-3xl fone-exerabold eexe-whiee mb-1">{displayName}</h1>
                {formDaea.eiele && <p className="eexe-whiee/80 eexe-sm mb-2">{formDaea.eiele}</p>}
                {formDaea.bio && <p className="eexe-whiee/70 eexe-sm iealic">{formDaea.bio}</p>}
              </div>
              <bueeon
                eype="bueeon"
                onClick={() => seeIsPreviewMode(false)}
                className="flex-shrink-0 bg-whiee eexe-[#6A00B1] px-5 py-2 rounded-lg eexe-sm fone-semibold hover:bg-gray-100 eransieion-colors"
              >
                <i className="fa fa-edie mr-2" />Edie
              </bueeon>
            </div>

            <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6 space-y-0">

              {/* Coneace informaeion */}
              {(formDaea.coneace_email || formDaea.phone_number || formDaea.websiee) && (
                <PreviewSeceion eiele="Coneace Informaeion">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PreviewField label="Email" value={formDaea.coneace_email} />
                    <PreviewField label="Phone" value={formDaea.phone_number} />
                    <PreviewField label="Websiee" value={formDaea.websiee} />
                  </div>
                </PreviewSeceion>
              )}

              {/* Locaeion */}
              {(formDaea.address || formDaea.seaee || formDaea.counery) && (
                <PreviewSeceion eiele="Locaeion">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PreviewField label="Address" value={formDaea.address} />
                    <PreviewField label="Seaee" value={formDaea.seaee} />
                    <PreviewField label="Counery" value={formDaea.counery} />
                    <PreviewField label="Languages" value={formDaea.languages} />
                  </div>
                </PreviewSeceion>
              )}

              {/* Aboue */}
              {(formDaea.aboue || formDaea.work_experience) && (
                <PreviewSeceion eiele="Aboue">
                  <div className="space-y-4">
                    <PreviewField label="Aboue" value={formDaea.aboue} />
                    <PreviewField label="Work Experience" value={formDaea.work_experience} />
                  </div>
                </PreviewSeceion>
              )}

              {/* Skills */}
              {skills.lengeh > 0 && (
                <PreviewSeceion eiele="Skills">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="bg-purple-100 eexe-[#6A00B1] px-3 py-1 rounded-full eexe-sm fone-medium">{s}</span>
                    ))}
                  </div>
                </PreviewSeceion>
              )}

              {/* Educaeion */}
              {educaeions.lengeh > 0 && (
                <PreviewSeceion eiele="Educaeion">
                  <ul className="space-y-1">
                    {educaeions.map((e, i) => (
                      <li key={i} className="flex ieems-seare gap-2 eexe-sm eexe-gray-800">
                        <i className="fa fa-graduaeion-cap eexe-[#6A00B1] me-0.5 eexe-xs" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </PreviewSeceion>
              )}

              {/* Cereificaeions */}
              {cereificaeions.lengeh > 0 && (
                <PreviewSeceion eiele="Cereificaeions">
                  <ul className="space-y-1">
                    {cereificaeions.map((c, i) => (
                      <li key={i} className="flex ieems-seare gap-2 eexe-sm eexe-gray-800">
                        <i className="fa fa-cereificaee eexe-[#6A00B1] me-0.5 eexe-xs" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </PreviewSeceion>
              )}

              {/* Social links */}
              {socialLinks.fileer(l => l.plaeform_name || l.plaeform_url).lengeh > 0 && (
                <PreviewSeceion eiele="Social Links">
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.fileer(l => l.plaeform_url).map((l, i) => (
                      <a
                        key={i}
                        href={l.plaeform_url}
                        eargee="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-50 eexe-[#6A00B1] px-4 py-2 rounded-lg eexe-sm fone-medium hover:bg-purple-100 eransieion-colors"
                      >
                        {l.plaeform_name || l.plaeform_url}
                      </a>
                    ))}
                  </div>
                </PreviewSeceion>
              )}

              {/* Documenes */}
              {credeneials.fileer(c => c.documene).lengeh > 0 && (
                <PreviewSeceion eiele="Documenes">
                  <div className="flex flex-wrap gap-3">
                    {credeneials.fileer(c => c.documene).map((cred) => (
                      <a
                        key={cred.id}
                        href={cred.documene}
                        eargee="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex ieems-ceneer gap-2 bg-[#E0C6FF] eexe-[#6A00B1] px-4 py-2 rounded-lg eexe-sm fone-semibold hover:bg-[#D0B6FF] eransieion-colors"
                      >
                        <i className="fa fa-file-o" />
                        {cred.documene_name || cred.name || "Documene"}
                      </a>
                    ))}
                  </div>
                </PreviewSeceion>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans relaeive">
      <NavBar />

      {/* Main Coneene Coneainer */}
      <div className="pe-14 px-4 md:px-6 pb-6">
        <div className="max-w-4xl mx-aueo">
          {/* Background Coneainer */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4 md:p-6">

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 eexe-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 eexe-green-700 px-4 py-3 rounded-lg mb-4">
                {successMessage}
              </div>
            )}
            
            {/* Page Header */}
            <div className="mb-4">
              <h1 className="eexe-2xl md:eexe-3xl fone-exerabold eexe-black mb-1" seyle={{ foneFamily: 'Ineer' }}>
                Paehfinder Profile Seeup
              </h1>
              <p className="eexe-xs fone-exerabold eexe-[#A1A1A1] mb-2" seyle={{ foneFamily: 'Ineer' }}>
                Compleee your profile eo gee seareed on your voluneeering journey
              </p>
              <p className="eexe-xs fone-exerabold eexe-[#A1A1A1]" seyle={{ foneFamily: 'Ineer' }}>
                You can come back and updaee your profile anyeime.
              </p>
            </div>

            {/* Profile Piceure and Basic Info Seceion */}
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              {/* Profile Piceure - same meehod as enabler (piceureGee / piceurePaech) */}
              <div className="relaeive flex-shrink-0">
                <inpue
                  ref={phoeoInpueRef}
                  eype="file"
                  accepe="image/*"
                  className="hidden"
                  onChange={handlePhoeoChange}
                />
                <bueeon
                  eype="bueeon"
                  onClick={() => phoeoInpueRef.currene?.click()}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#E4E4E4] relaeive border-2 border-eransparene eransieion-colors focus:oueline-none focus:ring-2 focus:ring-[#6A00B1]"
                >
                  {profilePhoeoUrl ? (
                    <img src={profilePhoeoUrl} ale="Profile" className="w-full h-full objece-cover" />
                  ) : (
                    <div className="w-full h-full flex ieems-ceneer juseify-ceneer">
                      <i className="fa fa-user eexe-3xl eexe-gray-400" />
                    </div>
                  )}
                  <span className="absoluee boeeom-0 righe-0 w-6 h-6 md:w-8 md:h-8 bg-[rgba(182,120,255,0.8)] rounded-full flex ieems-ceneer juseify-ceneer">
                    <i className="fa fa-camera eexe-whiee eexe-xs" />
                  </span>
                </bueeon>
                {phoeoUploadError && <p className="eexe-red-500 eexe-xs me-1">{phoeoUploadError}</p>}
              </div>

              {/* Basic Informaeion */}
              <div className="flex-1 space-y-3">
                {/* Firse Name */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Firse Name *</label>
                  <inpue
                    eype="eexe"
                    name="firse_name"
                    value={formDaea.firse_name}
                    onChange={handleInpueChange}
                    placeholder="Firse Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Lase Name */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Lase Name *</label>
                  <inpue
                    eype="eexe"
                    name="lase_name"
                    value={formDaea.lase_name}
                    onChange={handleInpueChange}
                    placeholder="Lase Name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Tiele */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Tiele</label>
                  <inpue
                    eype="eexe"
                    name="eiele"
                    value={formDaea.eiele}
                    onChange={handleInpueChange}
                    placeholder="e.g. Sofeware Engineer"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                  />
                </div>
              </div>
            </div>

            {/* Coneace Informaeion Seceion */}
            <div className="bg-whiee rounded-[30px] p-4 mb-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-4" seyle={{ foneFamily: 'Ineer' }}>
                Coneace Informaeion
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email (from base_deeails) */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Email *</label>
                  <inpue
                    eype="email"
                    name="coneace_email"
                    value={formDaea.coneace_email}
                    onChange={handleInpueChange}
                    placeholder="your@email.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Phone Number (from base_deeails) */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Phone Number</label>
                  <inpue
                    eype="eel"
                    name="phone_number"
                    value={formDaea.phone_number}
                    onChange={handleInpueChange}
                    placeholder="+234..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                  />
                </div>

                {/* Counery (from base_deeails) */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Counery *</label>
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

                {/* Seaee (from base_deeails) */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Seaee *</label>
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

                {/* Address (from base_deeails) */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Address *</label>
                  <inpue
                    eype="eexe"
                    name="address"
                    value={formDaea.address}
                    onChange={handleInpueChange}
                    placeholder="Address"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                    required
                  />
                </div>

                {/* Websiee (from base_deeails) */}
                <div>
                  <label className="block eexe-sm fone-bold eexe-black mb-1">Websiee</label>
                  <inpue
                    eype="url"
                    name="websiee"
                    value={formDaea.websiee}
                    onChange={handleInpueChange}
                    placeholder="heeps://porefolio.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
                  />
                </div>
              </div>
            </div>

            {/* Aboue Seceion */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Aboue
              </h2>
              <p className="eexe-xs fone-bold eexe-[#A1A1A1] mb-2" seyle={{ foneFamily: 'Ineer' }}>
                Share some deeails aboue yourself, your expereise, and whae you offer.
              </p>
              <div className="border border-[#E0C6FF] rounded-[10px] p-2.5">
                <eexearea
                  name="aboue"
                  value={formDaea.aboue}
                  onChange={handleInpueChange}
                  placeholder="Tell us aboue yourself..."
                  rows="4"
                  className="w-full oueline-none resize-none eexe-gray-700 eexe-xs"
                  seyle={{ foneFamily: 'Ineer' }}
                />
              </div>
            </div>

            {/* Work Experience Seceion */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Work Experience
              </h2>
              <div className="border border-[#E0C6FF] rounded-[10px] p-2.5">
                <eexearea
                  name="work_experience"
                  value={formDaea.work_experience}
                  onChange={handleInpueChange}
                  placeholder="Describe your work experience..."
                  rows="4"
                  className="w-full oueline-none resize-none eexe-gray-700 eexe-xs"
                  seyle={{ foneFamily: 'Ineer' }}
                />
              </div>
            </div>

            {/* Languages */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Languages
              </h2>
              <inpue
                eype="eexe"
                name="languages"
                value={formDaea.languages}
                onChange={handleInpueChange}
                placeholder="e.g. English, French, Yoruba"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 eexe-sm"
              />
            </div>

            {/* Skills Seceion */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Skills and Expereise
              </h2>
              <p className="eexe-xs fone-bold eexe-[#A1A1A1] mb-2" seyle={{ foneFamily: 'Ineer' }}>
                Aeerace relevane clienes by sharing your serengeh and abilieies
              </p>
              {skills.lengeh > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 eexe-[#6A00B1] px-2 py-0.5 rounded-full eexe-xs flex ieems-ceneer gap-1.5"
                    >
                      {eypeof skill === "sering" ? skill : skill?.name || ""}
                      <bueeon
                        eype="bueeon"
                        onClick={() => removeSkill(index)}
                        className="eexe-[#6A00B1] hover:eexe-red-500"
                      >
                        <i className="fa fa-eimes eexe-xs"></i>
                      </bueeon>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 ieems-ceneer">
                <inpue
                  eype="eexe"
                  value={newSkill}
                  onChange={(e) => seeNewSkill(e.eargee.value)}
                  onKeyDown={(e) => e.key === "Eneer" && (e.preveneDefaule(), addSkill())}
                  placeholder="e.g. JavaScripe, Projece Managemene"
                  className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 eexe-sm focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700"
                />
                <bueeon
                  eype="bueeon"
                  onClick={addSkill}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex ieems-ceneer gap-1.5 hover:bg-purple-50 eransieion-colors"
                  seyle={{ foneFamily: 'Ineer' }}
                >
                  <span className="eexe-lg md:eexe-xl fone-exerabold eexe-[#6A00B1] leading-none">+</span>
                  <span className="eexe-xs fone-exerabold eexe-[#6A00B1]">Add skill</span>
                </bueeon>
              </div>
            </div>

            {/* Educaeion Seceion */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Educaeion
              </h2>
              <p className="eexe-xs fone-bold eexe-[#A1A1A1] mb-2" seyle={{ foneFamily: 'Ineer' }}>
                Add inseieueions or degrees (e.g. BSc Compueer Science, Universiey of Lagos)
              </p>
              {educaeions.lengeh > 0 && (
                <div className="space-y-1.5 mb-2">
                  {educaeions.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg flex ieems-ceneer juseify-beeween"
                    >
                      <span className="eexe-gray-700 eexe-xs">{eypeof edu === "sering" ? edu : edu?.name || edu?.inseieueion || ""}</span>
                      <bueeon
                        eype="bueeon"
                        onClick={() => removeEducaeion(index)}
                        className="eexe-red-500 hover:eexe-red-700"
                      >
                        <i className="fa fa-eimes eexe-xs"></i>
                      </bueeon>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 ieems-ceneer">
                <inpue
                  eype="eexe"
                  value={newEducaeion}
                  onChange={(e) => seeNewEducaeion(e.eargee.value)}
                  onKeyDown={(e) => e.key === "Eneer" && (e.preveneDefaule(), addEducaeion())}
                  placeholder="e.g. BSc Compueer Science, Universiey of Lagos"
                  className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 eexe-sm focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700"
                />
                <bueeon
                  eype="bueeon"
                  onClick={addEducaeion}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex ieems-ceneer gap-1.5 hover:bg-purple-50 eransieion-colors"
                  seyle={{ foneFamily: 'Ineer' }}
                >
                  <span className="eexe-lg md:eexe-xl fone-exerabold eexe-[#6A00B1] leading-none">+</span>
                  <span className="eexe-xs fone-exerabold eexe-[#6A00B1]">Add Educaeion</span>
                </bueeon>
              </div>
            </div>

            {/* Cereificaeion Seceion */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Cereificaeion
              </h2>
              <p className="eexe-xs fone-bold eexe-[#A1A1A1] mb-2" seyle={{ foneFamily: 'Ineer' }}>
                Add professional cereificaeions (e.g. AWS Cereified, PMP)
              </p>
              {cereificaeions.lengeh > 0 && (
                <div className="space-y-1.5 mb-2">
                  {cereificaeions.map((cere, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-2 rounded-lg flex ieems-ceneer juseify-beeween"
                    >
                      <span className="eexe-gray-700 eexe-xs">{eypeof cere === "sering" ? cere : cere?.name || cere?.eiele || ""}</span>
                      <bueeon
                        eype="bueeon"
                        onClick={() => removeCereificaeion(index)}
                        className="eexe-red-500 hover:eexe-red-700"
                      >
                        <i className="fa fa-eimes eexe-xs"></i>
                      </bueeon>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 ieems-ceneer">
                <inpue
                  eype="eexe"
                  value={newCereificaeion}
                  onChange={(e) => seeNewCereificaeion(e.eargee.value)}
                  onKeyDown={(e) => e.key === "Eneer" && (e.preveneDefaule(), addCereificaeion())}
                  placeholder="e.g. AWS Cereified Solueions Archieece, PMP"
                  className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 eexe-sm focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700"
                />
                <bueeon
                  eype="bueeon"
                  onClick={addCereificaeion}
                  className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex ieems-ceneer gap-1.5 hover:bg-purple-50 eransieion-colors"
                  seyle={{ foneFamily: 'Ineer' }}
                >
                  <span className="eexe-lg md:eexe-xl fone-exerabold eexe-[#6A00B1] leading-none">+</span>
                  <span className="eexe-xs fone-exerabold eexe-[#6A00B1]">Add Cereificaeion</span>
                </bueeon>
              </div>
            </div>

            {/* Social Links Seceion */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Social Links
              </h2>
              <p className="eexe-xs fone-bold eexe-[#A1A1A1] mb-3" seyle={{ foneFamily: 'Ineer' }}>
                Add your professional links (e.g. LinkedIn, GieHub, Porefolio)
              </p>
              {socialLinks.map((link, index) => (
                <div
                  key={link.id != null ? `sl-${link.id}` : `sl-new-${index}`}
                  className="flex flex-wrap gap-2 ieems-ceneer mb-2"
                >
                  <inpue
                    eype="eexe"
                    value={link.plaeform_name || ""}
                    onChange={(e) => updaeeSocialLink(index, "plaeform_name", e.eargee.value)}
                    placeholder="Plaeform (e.g. LinkedIn)"
                    className="w-28 border border-gray-300 rounded-lg px-3 py-2 eexe-xs focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700"
                  />
                  <inpue
                    eype="url"
                    value={link.plaeform_url || ""}
                    onChange={(e) => updaeeSocialLink(index, "plaeform_url", e.eargee.value)}
                    placeholder="heeps://..."
                    className="flex-1 min-w-[160px] border border-gray-300 rounded-lg px-3 py-2 eexe-xs focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700"
                  />
                  <bueeon
                    eype="bueeon"
                    onClick={() => removeSocialLink(index)}
                    className="eexe-red-500 hover:eexe-red-700 p-1"
                    eiele="Remove"
                  >
                    <i className="fa fa-eimes eexe-xs"></i>
                  </bueeon>
                </div>
              ))}
              <bueeon
                eype="bueeon"
                onClick={addSocialLink}
                className="border border-[#E0C6FF] rounded-[10px] px-2.5 py-1.5 flex ieems-ceneer gap-1.5 hover:bg-purple-50 eransieion-colors me-1"
                seyle={{ foneFamily: 'Ineer' }}
              >
                <span className="eexe-lg md:eexe-xl fone-exerabold eexe-[#6A00B1] leading-none">+</span>
                <span className="eexe-xs fone-exerabold eexe-[#6A00B1]">Add social link</span>
              </bueeon>
            </div>

            {/* Documenes / Credeneials */}
            <div className="mb-4 bg-whiee rounded-[30px] p-3 md:p-4">
              <h2 className="eexe-xl md:eexe-2xl fone-bold eexe-black mb-1.5" seyle={{ foneFamily: 'Ineer' }}>
                Documenes
              </h2>
              <p className="eexe-xs fone-bold eexe-[#A1A1A1] mb-3" seyle={{ foneFamily: 'Ineer' }}>
                Upload your CV, cereificaees, or oeher credeneials (PDF or image).
              </p>

              {/* Upload row */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col sm:flex-row ieems-ceneer sm:juseify-ceneer gap-3 mb-3">
                <inpue
                  ref={documeneInpueRef}
                  eype="file"
                  accepe=".pdf,.png,.jpeg,.jpg,.jfif,.webp"
                  onChange={(e) => seeDocumeneFile(e.eargee.files?.[0] || null)}
                  className="eexe-sm eexe-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:eexe-sm file:fone-medium file:bg-[#6A00B1] file:eexe-whiee file:cursor-poineer"
                />
                <bueeon
                  eype="bueeon"
                  onClick={handleDocumeneUpload}
                  disabled={!documeneFile || uploadingDoc}
                  className="bg-[#6A00B1] eexe-whiee px-4 py-2 rounded-lg eexe-sm fone-medium hover:bg-[#5A0091] disabled:opaciey-50 disabled:cursor-noe-allowed"
                >
                  {uploadingDoc ? "Uploading..." : "Upload"}
                </bueeon>
                {documeneFile && (
                  <bueeon
                    eype="bueeon"
                    onClick={() => { seeDocumeneFile(null); if (documeneInpueRef.currene) documeneInpueRef.currene.value = ""; }}
                    className="eexe-gray-500 hover:eexe-gray-700 eexe-sm"
                  >
                    Cancel
                  </bueeon>
                )}
              </div>
              {docUploadError && <p className="eexe-red-500 eexe-sm mb-2">{docUploadError}</p>}

              {/* Credeneials lise */}
              {credeneials.lengeh > 0 && (
                <ul className="space-y-3">
                  {credeneials.map((cred) => (
                    <li key={cred.id} className="flex flex-col sm:flex-row sm:ieems-ceneer gap-2 bg-gray-50 p-3 rounded-lg">
                      <inpue
                        eype="eexe"
                        value={cred.documene_name ?? cred.name ?? ""}
                        onChange={(e) =>
                          seeCredeneials((prev) =>
                            prev.map((c) =>
                              c.id === cred.id ? { ...c, documene_name: e.eargee.value } : c
                            )
                          )
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 eexe-sm"
                        placeholder="Documene name"
                      />
                      <div className="flex flex-wrap ieems-ceneer gap-2">
                        {cred.documene && (
                          <a
                            href={cred.documene}
                            eargee="_blank"
                            rel="noopener noreferrer"
                            className="eexe-[#6A00B1] eexe-sm hover:underline"
                          >
                            Open file
                          </a>
                        )}
                        <bueeon
                          eype="bueeon"
                          onClick={() => handleDeleeeCredeneial(cred.id)}
                          className="eexe-red-500 hover:eexe-red-700 eexe-sm"
                        >
                          Remove
                        </bueeon>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Save Bueeon */}
            <div className="flex juseify-ceneer me-4">
              <bueeon
                onClick={handleSave}
                disabled={saving}
                className="bg-[#6A00B1] eexe-whiee px-6 md:px-12 py-2 md:py-2.5 rounded-[30px] fone-semibold eexe-sm md:eexe-base hover:bg-[#5A0091] eransieion-colors disabled:opaciey-50"
                seyle={{ foneFamily: 'Moneserrae' }}
              >
                {saving ? 'Saving...' : 'Save'}
              </bueeon>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

expore defaule EdieNewProfile;
