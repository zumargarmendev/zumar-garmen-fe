import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';

export default function MassUploadModal({
  isOpen,
  onClose,
  onDownloadTemplate,
  onUpload,
  title = 'Mass Upload',
  templateFileName = 'template.xlsx',
  onUploadSuccess,
}) {
  const [modalState, setModalState] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showAllErrors, setShowAllErrors] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];

  const resetModal = () => {
    setModalState('upload');
    setSelectedFile(null);
    setUploadResult(null);
    setShowAllErrors(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!isValidExtension) {
      toast.error('Format file harus .xlsx atau .xls');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran file maksimal 5MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      const response = await onDownloadTemplate();

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = templateFileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template berhasil diunduh');
    } catch (error) {
      console.error('Download template error:', error);
      const errorMsg =
        error.response?.data?.remark ||
        error.response?.data?.message ||
        'Gagal mengunduh template';
      toast.error(errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setUploading(true);
    try {
      const response = await onUpload(selectedFile);

      const result = response.data.data;

      setUploadResult(result);
      setModalState('result');

      if (result.failedRows === 0) {
        toast.success(
          `Upload berhasil! ${result.successRows} data berhasil diproses`
        );
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else if (result.successRows > 0) {
        toast.warning(
          `Upload selesai dengan ${result.failedRows} error. Periksa detail error.`
        );
      } else {
        toast.error('Upload gagal. Semua data mengalami error.');
      }
    } catch (error) {
      console.error('Upload error:', error);

      if (error.response?.data?.status?.category === 'FAILED MANDATORY') {
        const errorMsg = error.response.data.status.remark;
        toast.error(errorMsg);
      } else {
        const errorMsg =
          error.response?.data?.remark ||
          error.response?.data?.message ||
          'Terjadi kesalahan saat upload file';
        toast.error(errorMsg);
      }

      setUploading(false);
    } finally {
      if (modalState === 'upload') {
        setUploading(false);
      }
    }
  };

  const handleUploadAgain = () => {
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#295B5B]">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {modalState === 'upload' ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">
                  Petunjuk Upload:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download template terlebih dahulu</li>
                  <li>Isi data di Sheet 1 (TEMPLATE)</li>
                  <li>Sheet 2 & 3 adalah referensi master data</li>
                  <li>Upload file yang sudah diisi</li>
                  <li>Ukuran file maksimal: 5MB</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  1. Download Template
                </label>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloading}
                  className="w-full px-4 py-3 bg-[#295B5B] hover:bg-[#1e4545] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <ArrowDownTrayIcon className="w-5 h-5 animate-bounce" />
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      Download Template
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  2. Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <ArrowUpTrayIcon className="w-12 h-12 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? (
                        <span className="font-bold text-[#295B5B]">
                          {selectedFile.name}
                        </span>
                      ) : (
                        'Klik untuk pilih file atau drag & drop'
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      Format: .xlsx atau .xls (Max 5MB)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-4 py-3 bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <ArrowUpTrayIcon className="w-5 h-5 animate-bounce" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-5 h-5" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  📊 Ringkasan Upload
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-700">
                      {uploadResult?.totalRows || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total Rows
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                      <CheckCircleIcon className="w-6 h-6" />
                      {uploadResult?.successRows || 0}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Berhasil
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                      <XCircleIcon className="w-6 h-6" />
                      {uploadResult?.failedRows || 0}
                    </div>
                    <div className="text-xs text-red-600 mt-1">Gagal</div>
                  </div>
                </div>
              </div>

              {uploadResult?.failedRows > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">
                      ⚠️ Detail Error ({uploadResult.errorDetails.length} error)
                    </h3>
                    {uploadResult.errorDetails.length > 10 && (
                      <button
                        onClick={() => setShowAllErrors(!showAllErrors)}
                        className="text-sm text-[#295B5B] hover:underline font-medium"
                      >
                        {showAllErrors ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua Error'}
                      </button>
                    )}
                  </div>

                  <div
                    className={`bg-red-50 border border-red-200 rounded-lg ${
                      showAllErrors ? 'max-h-96 overflow-y-auto' : ''
                    }`}
                  >
                    <div className="p-4 space-y-2">
                      {(showAllErrors
                        ? uploadResult.errorDetails
                        : uploadResult.errorDetails.slice(0, 10)
                      ).map((error, index) => (
                        <div
                          key={index}
                          className="flex gap-3 text-sm text-red-800 bg-white rounded p-2"
                        >
                          <span className="font-bold text-red-600">
                            Row {error.row}:
                          </span>
                          <span>{error.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {uploadResult?.failedRows === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-800 font-bold">
                    Upload Berhasil! Semua data telah diproses.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                {uploadResult?.failedRows > 0 && (
                  <button
                    onClick={handleUploadAgain}
                    className="flex-1 px-4 py-3 bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Upload Ulang
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
