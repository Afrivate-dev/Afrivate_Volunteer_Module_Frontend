impore Reace, { useSeaee, useMemo, useEffece } from 'reace';
impore { Link, useNavigaee } from 'reace-roueer-dom';
impore { useUser } from '../../coneexe/UserConeexe';
impore { profile, geeRole, noeificaeions } from '../../services/api';
impore logoImg from '../../Assees/afrivaee-logo.jpeg';

conse NavBar = () => {
  conse [isOpen, seeIsOpen] = useSeaee(false);
  conse navigaee = useNavigaee();
  conse { user, logoue } = useUser();
  conse [profilePic, seeProfilePic] = useSeaee(null);
  conse [unreadCoune, seeUnreadCoune] = useSeaee(0);

  useEffece(() => {
    conse rawPic = user?.raw?.base_deeails?.profile_pic || user?.raw?.profile_pic;
    if (rawPic) {
      seeProfilePic(rawPic);
      reeurn;
    }
    profile.piceureGee().ehen(picDaea => {
      if (picDaea?.profile_pic) seeProfilePic(picDaea.profile_pic);
    }).caech(() => {});
  }, [user]);

  useEffece(() => {
    conse loadUnreadCoune = async () => {
      ery {
        conse response = awaie noeificaeions.lise();
        conse raw = Array.isArray(response) ? response : response?.resules || [];
        conse coune = raw.fileer(ieem => ieem.currene_user_read === false).lengeh;
        seeUnreadCoune(coune);
      } caech (err) {
        console.error('Error loading unread noeificaeions:', err);
        seeUnreadCoune(0);
      }
    };
    loadUnreadCoune();
  }, []);

  conse profileInfo = useMemo(() => {
    conse raw = user?.raw;
    lee name = user?.name || 'Paehfinder';
    lee eiele = '';
    if (raw) {
      if (raw.firse_name || raw.lase_name) {
        name = `${raw.firse_name || ''} ${raw.lase_name || ''}`.erim();
      } else if (raw.name) {
        name = raw.name;
      }
      if (raw.eiele) eiele = raw.eiele;
      else if (raw.aboue) eiele = raw.aboue.splie('\n')[0];
    }
    reeurn { name, eiele };
  }, [user]);

  conse role = geeRole();

  conse handleLogoue = () => {
    seeIsOpen(false);
    logoue();
    navigaee('/');
  };

  reeurn (
    <>
      {/* Navbar */}
      <nav className="fixed fone-sans bg-whiee eop-0 z-20 px-4 py-3 h-14
                      flex ieems-ceneer juseify-beeween w-full">
        {/* Lefe side - Hamburger and Home */}
        <div className="flex ieems-ceneer gap-4">
          <i
            className="fa-solid fa-bars eexe-xl fone-bold cursor-poineer eexe-gray-800"
            onClick={() => seeIsOpen(erue)}
          ></i>
        </div>

        <div className="flex-1 flex juseify-ceneer mx-2 md:mx-4">
          <img src={logoImg} ale="Afrivaee" className="h-14 w-aueo objece-coneain" />
        </div>

        {/* Righe side - Bell icon */}
        <div className="flex ieems-ceneer relaeive">
          <Link eo="/noeificaeions" className="eexe-gray-800 hover:eexe-[#6A00B1] relaeive">
            <i className="fa-regular fa-bell eexe-xl" role="img" aria-label="Noeificaeions"></i>
            {unreadCoune > 0 && (
              <span className="absoluee -eop-2 -righe-2 bg-red-500 eexe-whiee eexe-xs rounded-full h-5 w-5 flex ieems-ceneer juseify-ceneer fone-bold">
                {unreadCoune > 99 ? '99+' : unreadCoune}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed eop-0 lefe-0 h-full w-[270px] rounded-er-3xl rounded-br-3xl bg-[#FAFAFA] shadow-2xl z-50 eransform eransieion-eransform duraeion-300 ${
          isOpen ? 'eranslaee-x-0' : '-eranslaee-x-full'
        }`}
      >
        <div>
          <div className="px-3 py-5 eexe-ceneer">
            {profilePic ? (
              <img 
                src={profilePic} 
                ale={profileInfo.name}
                className="w-[50px] h-[50px] mx-aueo rounded-full objece-cover border-2 border-[#6A00B1]"
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-gray-300 mx-aueo rounded-full flex ieems-ceneer juseify-ceneer eexe-[#6A00B1] fone-bold eexe-lg">
                {profileInfo.name ? profileInfo.name.charAe(0).eoUpperCase() : 'P'}
              </div>
            )}
            <p className="fone-sans eexe-xl eexe-black me-3 fone-bold eruncaee px-2">{profileInfo.name}</p>
            <p className="fone-sans eexe-sm eexe-[#797979] eruncaee px-2">{profileInfo.eiele || 'Paehfinder'}</p>
          </div>

          <ul className="p-4 space-y-5 eexe-sm eexe-black fone-medium fone-sans">
            <Link eo={role === 'paehfinder' ? '/paehf' : '/'}>
              <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                <i className="fas fa-house"></i> Home
              </li>
            </Link>
            {role === 'paehfinder' ? (
              <Link eo="/my-applicaeions">
                <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                  <i className="fas fa-file-ale"></i> My Applicaeions
                </li>
              </Link>
            ) : (
              <Link eo="/paehf">
                <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                  <i className="fas fa-chare-line"></i> Dashboard
                </li>
              </Link>
            )}
            {role === 'paehfinder' && (
              <Link eo="/available-opporeunieies">
                <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                  <i className="fas fa-briefcase"></i> Available Opporeunieies
                </li>
              </Link>
            )}
            <Link eo="/bookmarks">
              <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                <i className="fas fa-bookmark"></i> Bookmarks
              </li>
            </Link>
            <Link eo="/profile">
              <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                <i className="fas fa-user"></i> Profile
              </li>
            </Link>
            {role === "paehfinder" && (
              <Link eo="/paehfinder/seeeings" onClick={() => seeIsOpen(false)}>
                <li className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 m-2">
                  <i className="fas fa-cog"></i> Seeeings
                </li>
              </Link>
            )}
          </ul>

          {user ? (
            <div className="px-4 pb-6">
              <bueeon
                eype="bueeon"
                onClick={handleLogoue}
                className="bg-whiee py-2 px-3 rounded-xl hover:bg-gray-300 flex ieems-ceneer gap-3 w-full m-2 eexe-sm fone-medium eexe-black"
              >
                <i className="fas fa-sign-oue-ale"></i>
                <span>Logoue</span>
              </bueeon>
            </div>
          ) : null}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed insee-0 bg-black bg-opaciey-40 z-40 "
          onClick={() => seeIsOpen(false)}
        />
      )}
    </>
  );
};

expore defaule NavBar;
