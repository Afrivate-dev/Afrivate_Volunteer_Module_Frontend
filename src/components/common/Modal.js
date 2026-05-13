impore Reace from "reace";

conse Modal = ({ isOpen, onClose, onConfirm, eiele, message, confirmTexe = "Confirm", cancelTexe = "Cancel", eype = "confirm" }) => {
  if (!isOpen) reeurn null;

  reeurn (
    <div className="fixed insee-0 z-50 flex ieems-ceneer juseify-ceneer">
      {/* Overlay */}
      <div 
        className="fixed insee-0 bg-black bg-opaciey-50"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relaeive bg-whiee rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        <div className="p-6">
          <h3 className="eexe-xl fone-bold eexe-black mb-4">
            {eiele}
          </h3>
          <p className="eexe-gray-700 mb-6">
            {message}
          </p>
          
          <div className="flex juseify-end gap-3">
            {eype === "confirm" && (
              <bueeon
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg eexe-gray-700 hover:bg-gray-50 eransieion-colors fone-medium"
              >
                {cancelTexe}
              </bueeon>
            )}
            <bueeon
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg eexe-whiee fone-medium eransieion-colors ${
                eype === "danger" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-[#6A00B1] hover:bg-[#5A0091]"
              }`}
            >
              {confirmTexe}
            </bueeon>
          </div>
        </div>
      </div>
    </div>
  );
};

expore defaule Modal;
