import { format } from "date-fns";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import BackgroundImage from "../../../assets/background/bg-zumar.png";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import Pagination from "../../components/Pagination";
import DateRangeFilterReport from "../../../components/date-range-filter-report";
import { generateInventoryRelocationReport } from "../../../utils/pdfGenerator";
import { getInventoryRelocations } from "../../../api/Inventory/inventoryRelocation";
import { getWarehouses } from "../../../api/Inventory/inventoryWarehouse";
import { isWithinDateRange } from "../../../utils";
import { ChevronDownIcon, PrinterIcon } from "@heroicons/react/24/solid";

const PAGE_LIMIT = 10;

function CustomDropdown({ label, options, value, onChange, placeholder, searchPlaceholder = 'Cari...', labelMinWidth = '70px', width = '150px', mdWidth = '160px', height = '38px' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center w-auto">
      <span className="px-4 py-2 bg-[#295B5B] text-white font-bold rounded-l-xl border border-[#295B5B] border-r-0 text-base flex items-center justify-center" style={{height:height, minWidth: labelMinWidth, lineHeight:height}}>{label}</span>
      <div className="relative" style={{ width: width, minWidth: width, maxWidth: mdWidth }}>
        <button
          ref={btnRef}
          type="button"
          className="appearance-none w-full px-3 py-2 border border-[#295B5B] border-l-0 bg-white text-[#BDBDBD] font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[38px] text-sm flex items-center justify-between"
          onClick={() => setOpen(o => !o)}
        >
          <span className={`${value ? 'text-black' : 'text-[#BDBDBD]'} truncate block flex-1 text-left mr-2`}>
            {value ? selectedOption?.label : placeholder}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-[#BDBDBD] flex-shrink-0" />
        </button>
        {open && (
          <div ref={dropdownRef} className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto focus:outline-none">
            <div className="p-2 sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none text-sm"
                autoFocus
              />
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-400 text-sm">Tidak ditemukan</div>
            )}
            {filteredOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-4 py-2 cursor-pointer ${String(opt.value) === String(value) ? 'bg-secondaryColor/10 text-black' : 'text-black'} hover:bg-secondaryColor/20`}
                onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const InventoryRelocationReport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allRelocations, setAllRelocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [error, setError] = useState('');

  // Filter states
  const [selectedWarehouseFrom, setSelectedWarehouseFrom] = useState('');
  const [selectedWarehouseTo, setSelectedWarehouseTo] = useState('');
  const [userHasSelectedDate, setUserHasSelectedDate] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const handleDateChange = useCallback((selectedDateRange) => {
    setDateRange(selectedDateRange);
    setUserHasSelectedDate(true);
    setPage(1);
  }, []);

  const fetchRelocationData = useCallback(async () => {
    if (!userHasSelectedDate) {
      setAllRelocations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = { pageLimit: -1 };

      if (selectedWarehouseFrom) {
        params.filterIwIdFrom = selectedWarehouseFrom;
      }
      if (selectedWarehouseTo) {
        params.filterIwIdTo = selectedWarehouseTo;
      }

      const res = await getInventoryRelocations(params);
      const data = Array.isArray(res.data.data.listData) ? res.data.data.listData : [];
      data.sort((a, b) => new Date(a.irCreatedAt) - new Date(b.irCreatedAt));
      setAllRelocations(data);
    } catch (err) {
      console.error('Error fetching relocations:', err);
      setError('Gagal memuat data transfer inventory');
    }
    setLoading(false);
  }, [userHasSelectedDate, selectedWarehouseFrom, selectedWarehouseTo]);

  const filteredRelocations = useMemo(() => {
    if (!userHasSelectedDate || !dateRange.startDate || !dateRange.endDate) return [];
    return allRelocations.filter((rel) =>
      isWithinDateRange(rel.irCreatedAt, dateRange.startDate, dateRange.endDate)
    );
  }, [allRelocations, userHasSelectedDate, dateRange]);

  const totalPage = useMemo(
    () => Math.max(1, Math.ceil(filteredRelocations.length / PAGE_LIMIT)),
    [filteredRelocations]
  );

  const relocations = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filteredRelocations.slice(start, start + PAGE_LIMIT);
  }, [filteredRelocations, page]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPage) {
      setPage(newPage);
    }
  }, [totalPage]);

  useEffect(() => {
    if (page > totalPage) setPage(totalPage);
  }, [page, totalPage]);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      const warehousesRes = await getWarehouses({ pageLimit: -1 });
      setWarehouses(Array.isArray(warehousesRes.data.data.listData) ? warehousesRes.data.data.listData : []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    fetchRelocationData();
  }, [fetchRelocationData]);


  const getStatusText = (statusCode) => {
    switch (statusCode) {
      case 1:
        return 'Menunggu Konfirmasi';
      case 2:
        return 'Approve';
      case 3:
        return 'Reject';
      default:
        return '-';
    }
  };

  const formatTanggal = (value) => (value ? format(new Date(value), 'dd/MM/yyyy') : '-');

  const formatTanggalKeputusan = (rel) => {
    if (rel.irApprovalStatus === 2) return `Disetujui ${formatTanggal(rel.irUpdatedAt)}`;
    if (rel.irApprovalStatus === 3) return `Ditolak ${formatTanggal(rel.irUpdatedAt)}`;
    return 'Belum ada keputusan';
  };

  const getStatusBadge = (statusCode) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (statusCode) {
      case 1:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 2:
        return `${baseClasses} bg-green-100 text-green-800`;
      case 3:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleGeneratePDF = () => {
    if (!userHasSelectedDate) {
      alert('Silakan pilih periode tanggal terlebih dahulu');
      return;
    }

    if (filteredRelocations.length === 0) {
      alert('Tidak ada data transfer untuk digenerate');
      return;
    }

    try {
      const filterInfo = {
        dateRange,
        selectedWarehouseFrom,
        selectedWarehouseTo
      };

      generateInventoryRelocationReport(filteredRelocations, filterInfo, warehouses);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal generate PDF. Silakan coba lagi.');
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '1000px auto',
        backgroundPosition: 'center',
      }}
    >
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="max-w-7xl mx-auto py-10 px-4">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2 font-montserrat">LAPORAN TRANSFER INVENTORY</h1>
          <p className="text-center text-gray-800 mb-8 font-montserrat">Berikut adalah laporan transfer inventory yang terdaftar dalam sistem.</p>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Date Range Filter */}
            <DateRangeFilterReport onDateChange={handleDateChange} />
            
            {/* Filter Gudang Asal */}
            <CustomDropdown
              label="Gudang Asal"
              options={warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))}
              value={selectedWarehouseFrom}
              onChange={val => { setSelectedWarehouseFrom(val); setPage(1); }}
              placeholder="Semua Gudang"
              searchPlaceholder="Cari gudang asal..."
              labelMinWidth="110px"
            />
            
            {/* Filter Gudang Tujuan */}
            <CustomDropdown
              label="Gudang Tujuan"
              options={warehouses.map(wh => ({ value: wh.iwId, label: wh.iwName }))}
              value={selectedWarehouseTo}
              onChange={val => { setSelectedWarehouseTo(val); setPage(1); }}
              placeholder="Semua Gudang"
              searchPlaceholder="Cari gudang tujuan..."
              labelMinWidth="120px"
            />
          </div>


          <div className="flex justify-start mb-6">
            <button
              onClick={handleGeneratePDF}
              className="bg-primaryColor hover:bg-secondaryColor text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Relokasi
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 overflow-x-auto font-montserrat">
            {!userHasSelectedDate ? (

              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Laporan Inventory Relocation
                </h3>
                <p className="text-gray-500">
                  Historical Data: Inventory Relocation
                </p>
                <p className="text-gray-400 mt-4">
                  Silakan pilih periode tanggal untuk melihat data transfer inventory.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-primaryColor font-semibold">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[1000px]">
                <thead>
                  <tr className="text-primaryColor">
                    <th className="px-4 py-3">Tanggal Dibuat</th>
                    <th className="px-4 py-3">Tanggal Keputusan</th>
                    <th className="px-4 py-3">Kode Item</th>
                    <th className="px-4 py-3">Gudang Asal</th>
                    <th className="px-4 py-3">Gudang Tujuan</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3">Satuan</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {relocations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-gray-400">Tidak ada data transfer inventory</td>
                    </tr>
                  ) : (
                    relocations.map((rel) => (
                      <tr key={rel.irId} className="bg-gray-100 hover:bg-secondaryColor/10 rounded-lg shadow-sm">
                        <td className="px-4 py-3">{formatTanggal(rel.irCreatedAt)}</td>
                        <td className="px-4 py-3">{formatTanggalKeputusan(rel)}</td>
                        <td className="px-4 py-3 font-medium">{rel.iCode}</td>
                        <td className="px-4 py-3">{rel.iwNameFrom || '-'}</td>
                        <td className="px-4 py-3">{rel.iwNameTo || '-'}</td>
                        <td className="px-4 py-3">{rel.irAmount}</td>
                        <td className="px-4 py-3">{rel.iUnit || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadge(rel.irApprovalStatus)}>
                            {getStatusText(rel.irApprovalStatus)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {userHasSelectedDate && relocations.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryRelocationReport;