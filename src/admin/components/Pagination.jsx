import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, maxVisible = 10 }) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    let startPage, endPage;

    if (totalPages <= maxVisible) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfVisible = Math.floor(maxVisible / 2);

      if (currentPage <= halfVisible) {
        startPage = 1;
        endPage = maxVisible;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisible + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfVisible;
        endPage = currentPage + halfVisible - 1;
      }
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50 font-semibold hover:bg-gray-100 transition-colors"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        title="First Page"
        type="button"
      >
        {'<<'}
      </button>

      <button
        className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50 font-semibold hover:bg-gray-100 transition-colors"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Previous Page"
        type="button"
      >
        {'<'}
      </button>

      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          className={`px-3 py-1 rounded border font-semibold transition-colors ${
            pageNum === currentPage
              ? 'bg-primaryColor text-white border-primaryColor'
              : 'border-gray-300 text-primaryColor hover:bg-gray-100'
          }`}
          onClick={() => handlePageChange(pageNum)}
          type="button"
        >
          {pageNum}
        </button>
      ))}

      <button
        className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50 font-semibold hover:bg-gray-100 transition-colors"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Next Page"
        type="button"
      >
        {'>'}
      </button>

      <button
        className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50 font-semibold hover:bg-gray-100 transition-colors"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        title="Last Page"
        type="button"
      >
        {'>>'}
      </button>
    </div>
  );
};

export default Pagination;
