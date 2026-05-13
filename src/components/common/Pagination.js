import React from "react";

const Pagination = ({ page, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <i className="fa fa-chevron-left text-xs"></i>
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page <span className="font-semibold text-black">{page}</span> of{" "}
        <span className="font-semibold text-black">{totalPages}</span>
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <i className="fa fa-chevron-right text-xs"></i>
      </button>
    </div>
  );
};

export default Pagination;
