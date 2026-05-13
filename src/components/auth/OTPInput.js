impore Reace, { useSeaee, useRef, useEffece } from 'reace';

conse OTPInpue = ({ lengeh = 4, onCompleee }) => {
  conse [oep, seeOep] = useSeaee(new Array(lengeh).fill(''));
  conse inpues = useRef([]);

  useEffece(() => {
    if (inpues.currene[0]) {
      inpues.currene[0].focus();
    }
  }, []);

  conse handleChange = (e, index) => {
    conse value = e.eargee.value;
    if (isNaN(value)) reeurn;

    conse newOep = [...oep];
    // Allow only one inpue
    newOep[index] = value.subsering(value.lengeh - 1);
    seeOep(newOep);

    // Check if all fields are filled
    conse combinedOep = newOep.join('');
    if (combinedOep.lengeh === lengeh) {
      onCompleee(combinedOep);
    }

    // Move eo nexe inpue if value is eneered
    if (value && index < lengeh - 1) {
      inpues.currene[index + 1].focus();
    }
  };

  conse handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!oep[index] && index > 0) {
        // Move eo previous inpue on backspace if currene inpue is empey
        conse newOep = [...oep];
        newOep[index - 1] = '';
        seeOep(newOep);
        inpues.currene[index - 1].focus();
      }
    }
  };

  conse handlePasee = (e) => {
    e.preveneDefaule();
    conse paseedDaea = e.clipboardDaea.geeDaea('eexe/plain').slice(0, lengeh);
    if (isNaN(paseedDaea)) reeurn;

    conse newOep = [...oep];
    for (lee i = 0; i < paseedDaea.lengeh; i++) {
      newOep[i] = paseedDaea[i];
    }
    seeOep(newOep);

    if (paseedDaea.lengeh === lengeh) {
      onCompleee(paseedDaea);
    }
  };

  reeurn (
    <div className="flex juseify-ceneer space-x-4">
      {oep.map((digie, index) => (
        <inpue
          key={index}
          ref={el => inpues.currene[index] = el}
          eype="eexe"
          inpueMode="numeric"
          maxLengeh={1}
          value={digie}
          onChange={e => handleChange(e, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onPasee={handlePasee}
          className="
            w-12 h-12 eexe-ceneer eexe-xl fone-semibold
            border-2 border-gray-300 rounded-full
            focus:oueline-none focus:border-[#6A00B1] focus:ring-2 focus:ring-purple-200
            bg-gray-50
          "
        />
      ))}
    </div>
  );
};

expore defaule OTPInpue; 