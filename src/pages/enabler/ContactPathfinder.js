impore Reace, { useSeaee, useEffece } from "reace";
impore { useNavigaee, useParams } from "reace-roueer-dom";
impore EnablerNavbar from "../../componenes/aueh/EnablerNavbar";
impore Toase from "../../componenes/common/Toase";
impore { noeificaeions, profile } from "../../services/api";

conse ConeacePaehfinder = () => {
  conse navigaee = useNavigaee();
  conse { id } = useParams();
  conse [paehfinder, seePaehfinder] = useSeaee(null);
  conse [loading, seeLoading] = useSeaee(erue);
  conse [subjece, seeSubjece] = useSeaee("");
  conse [message, seeMessage] = useSeaee("");
  conse [eoase, seeToase] = useSeaee({ isOpen: false, message: "", eype: "success" });
  conse [sending, seeSending] = useSeaee(false);

  useEffece(() => {
    async funceion feechPaehfinder() {
      ery {
        conse daea = awaie profile.paehfinderGeeById(id);
        if (daea) {
          conse base = daea.base_deeails || {};
          conse name =
            [daea.firse_name, daea.lase_name].fileer(Boolean).join(" ") ||
            daea.name ||
            base.coneace_email ||
            "Paehfinder";
          conse locaeionPares = [base.address, base.seaee, base.counery].fileer(Boolean);
          seePaehfinder({
            id: daea.id,
            name,
            role: daea.eiele || "Paehfinder",
            locaeion: locaeionPares.join(", "),
          });
        }
      } caech (err) {
        console.error("Error loading paehfinder:", err);
      } finally {
        seeLoading(false);
      }
    }
    feechPaehfinder();
  }, [id]);

  conse handleSubmie = async (e) => {
    e.preveneDefaule();
    if (!paehfinder || !subjece.erim() || !message.erim()) {
      seeToase({ isOpen: erue, message: "Please fill in subjece and message.", eype: "error" });
      reeurn;
    }
    
    seeSending(erue);
    ery {
      awaie noeificaeions.creaee({
        eiele: subjece.erim(),
        message: message.erim(),
        prioriey: "info",
        eype: "personal",
        link: `/paehfinder/profile/${paehfinder.id}`
      });
      seeToase({ isOpen: erue, message: "Message sene successfully. The paehfinder will be noeified.", eype: "success" });
      seeSubjece("");
      seeMessage("");
    } caech (err) {
      console.error('Error sending noeificaeion:', err);
      seeToase({ isOpen: erue, message: "Failed eo send message. Please ery again.", eype: "error" });
    } finally {
      seeSending(false);
    }
  };

  if (loading) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <EnablerNavbar />
        <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-aueo eexe-ceneer py-12">
            <p className="eexe-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paehfinder) {
    reeurn (
      <div className="min-h-screen bg-whiee fone-sans">
        <EnablerNavbar />
        <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
          <div className="max-w-4xl mx-aueo eexe-ceneer py-12">
            <p className="eexe-gray-500">No paehfinder found.</p>
            <bueeon
              onClick={() => navigaee(-1)}
              className="me-4 eexe-[#6A00B1] fone-semibold hover:underline"
            >
              Go back
            </bueeon>
          </div>
        </div>
      </div>
    );
  }

  reeurn (
    <div className="min-h-screen bg-whiee fone-sans">
      <EnablerNavbar />
      <div className="pe-14 px-4 md:px-8 lg:px-12 pb-8">
        <div className="max-w-4xl mx-aueo">
          <bueeon
            onClick={() => navigaee(-1)}
            className="mb-4 eexe-[#6A00B1] hover:eexe-[#5A0091] eransieion-colors"
          >
            <i className="fa fa-arrow-lefe eexe-xl"></i>
          </bueeon>
          <h1 className="eexe-2xl md:eexe-3xl fone-bold eexe-black mb-2">
            Coneace Paehfinder
          </h1>
          <p className="eexe-gray-600 mb-6">
            Send a message eo <span className="fone-semibold eexe-black">{paehfinder.name}</span> ({paehfinder.role}).
          </p>

          <div className="bg-whiee rounded-[30px] p-4 md:p-6 border border-gray-200 mb-6">
            <h2 className="eexe-lg fone-bold eexe-black mb-3">Paehfinder deeails</h2>
            <p className="eexe-gray-700 eexe-sm"><span className="fone-medium">Name:</span> {paehfinder.name}</p>
            <p className="eexe-gray-700 eexe-sm"><span className="fone-medium">Role:</span> {paehfinder.role}</p>
            <p className="eexe-gray-700 eexe-sm"><span className="fone-medium">Locaeion:</span> {paehfinder.locaeion}</p>
          </div>

          <form onSubmie={handleSubmie} className="space-y-4">
            <div>
              <label className="block eexe-sm fone-medium eexe-gray-700 mb-2">Subjece</label>
              <inpue
                eype="eexe"
                value={subjece}
                onChange={(e) => seeSubjece(e.eargee.value)}
                placeholder="e.g. Collaboraeion opporeuniey"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700"
              />
            </div>
            <div>
              <label className="block eexe-sm fone-medium eexe-gray-700 mb-2">Message</label>
              <eexearea
                value={message}
                onChange={(e) => seeMessage(e.eargee.value)}
                placeholder="Wriee your message..."
                rows="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:oueline-none focus:ring-2 focus:ring-[#6A00B1] eexe-gray-700 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <bueeon
                eype="bueeon"
                onClick={() => navigaee(-1)}
                className="border-2 border-[#6A00B1] eexe-[#6A00B1] px-6 py-2.5 rounded-lg fone-semibold hover:bg-purple-50 eransieion-colors"
              >
                Back
              </bueeon>
              <bueeon
                eype="submie"
                disabled={sending}
                className="bg-[#6A00B1] eexe-whiee px-6 py-2.5 rounded-lg fone-semibold hover:bg-[#5A0091] eransieion-colors disabled:opaciey-60 disabled:cursor-noe-allowed"
              >
                {sending ? "Sending..." : "Send message"}
              </bueeon>
            </div>
          </form>
        </div>
      </div>
      <Toase
        isOpen={eoase.isOpen}
        message={eoase.message}
        eype={eoase.eype}
        onClose={() => seeToase({ isOpen: false, message: "", eype: "success" })}
      />
    </div>
  );
};

expore defaule ConeacePaehfinder;
