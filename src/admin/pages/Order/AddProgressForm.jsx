import { CheckCircleIcon, ExclamationTriangleIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { memo, useState } from 'react';
import SearchableDropdown from '../../../components/SearchableDropdown';

function groupByOisId(data) {
  return Object.values(
    data.reduce((acc, item) => {
      const key = item.oisId;
      if (!acc[key]) acc[key] = { oisId: key, opAmount: 0, opAmountDone: 0 };
      acc[key].opAmount += item.opAmount || 0;
      acc[key].opAmountDone += item.opAmountDone || 0;
      return acc;
    }, {})
  );
}

const AddProgressForm = memo(({
  progressMain,
  progressItems,
  orderItems,
  users,
  usersLoading,
  saving,
  orderData,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({ oisId: '', opAmount: '', opFee: '', opDeadlineAt: '', uId: '' });

  const grouped = groupByOisId(progressItems);
  const stageAllocated = progressItems.reduce((s, i) => s + (i.opAmount || 0), 0);
  const stageRemaining = (progressMain.opmAmountTotal || 0) - stageAllocated;

  const dropdownData = orderItems
    .filter(item => {
      const g = grouped.find(g => g.oisId === item.oisId);
      const oisRemaining = item.oisAmount - (g?.opAmount || 0);
      return oisRemaining > 0 && stageRemaining > 0;
    })
    .map(item => {
      const g = grouped.find(g => g.oisId === item.oisId);
      const oisRemaining = item.oisAmount - (g?.opAmount || 0);
      const remaining = Math.min(oisRemaining, stageRemaining);
      return {
        oisId: item.oisId,
        cpName: item.cpName || 'Item',
        sName: item.sName || 'No Size',
        remaining,
        displayText: `📦 ${item.cpName || 'Item'} | 📏 ${item.sName || 'No Size'} | 🔢 ${remaining} pcs`,
      };
    });

  const getMaxAmount = () => {
    const orderItem = orderItems.find(i => i.oisId === Number(form.oisId));
    if (!orderItem) return 0;
    const g = grouped.find(g => g.oisId === Number(form.oisId));
    const oisRemaining = orderItem.oisAmount - (g?.opAmount || 0);
    return Math.min(oisRemaining, stageRemaining);
  };

  const handleAmountChange = (e) => {
    const value = Number(e.target.value);
    const max = getMaxAmount();
    setForm(prev => ({ ...prev, opAmount: value > max ? max : value }));
  };

  const maxAmount = getMaxAmount();
  const isDisabled = saving || !form.oisId || !form.opAmount || !form.opFee || !form.opDeadlineAt || !form.uId;

  const progressPercentage = progressMain.opmAmountTotal > 0
    ? Math.min(100, Math.round(((progressMain.opmAmountTotalDone || 0) / progressMain.opmAmountTotal) * 100))
    : 0;

  const selectedOisId = Number(form.oisId);
  const selectedOrderItem = orderItems.find(i => i.oisId === selectedOisId);
  const selectedGrouped = grouped.find(g => g.oisId === selectedOisId);
  const oisRemaining = selectedOrderItem ? selectedOrderItem.oisAmount - (selectedGrouped?.opAmount || 0) : 0;

  const toLocalDateStr = (d) => {
    const date = d instanceof Date ? d : new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const todayStr = toLocalDateStr(new Date());
  const maxDateStr = orderData?.oDeadlineAt ? toLocalDateStr(new Date(orderData.oDeadlineAt)) : undefined;
  const minDateStr = maxDateStr && todayStr > maxDateStr ? undefined : todayStr;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <PlusIcon className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-lg text-blue-800">
          Tambah Progress ke: {progressMain.opmName}
        </h4>
      </div>

      {stageRemaining <= 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">
            Kapasitas stage penuh ({progressMain.opmAmountTotal} pcs sudah teralokasi). Tidak dapat menambah progress baru.
          </p>
        </div>
      )}

      {stageRemaining > 0 && stageRemaining <= 10 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
          <p className="text-sm text-amber-700">
            Sisa kapasitas stage: <strong>{stageRemaining} pcs</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order Item Size <span className="text-red-500 ml-1">*</span>
            </label>
            <SearchableDropdown
              data={dropdownData}
              labelKey="displayText"
              valueKey="oisId"
              value={form.oisId}
              placeholder="Pilih Item yang akan dikerjakan"
              required
              onChange={(selectedOisId) =>
                setForm(prev => ({ ...prev, oisId: selectedOisId, opAmount: '' }))
              }
              renderItem={(item) => (
                <div className="flex flex-col text-sm">
                  <span>📦 {item.cpName} | 📏 {item.sName} | 🔢 {item.remaining} pcs</span>
                </div>
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pilih item pesanan yang akan dikerjakan pada tahap {progressMain.opmName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Progress Amount <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={form.opAmount}
              onChange={handleAmountChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:bg-gray-100"
              placeholder="Masukkan jumlah yang akan dikerjakan"
              min="1"
              max={maxAmount}
              onWheel={(e) => e.currentTarget.blur()}
              required
              disabled={!form.oisId}
            />
            {form.oisId ? (
              <p className="text-xs text-gray-500 mt-1">
                Maks: <strong>{maxAmount} pcs</strong> (sisa item: {oisRemaining} | sisa stage: {stageRemaining})
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Pilih Order Item Size terlebih dahulu</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nilai Gaji <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={form.opFee}
              onChange={(e) => setForm(prev => ({ ...prev, opFee: Number(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Masukkan nilai gaji"
              min="1"
              onWheel={(e) => e.currentTarget.blur()}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Nilai gaji yang akan diberikan kepada pekerja ini untuk tiap item
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deadline Pengerjaan <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={form.opDeadlineAt}
              onChange={(e) => setForm(prev => ({ ...prev, opDeadlineAt: e.target.value }))}
              min={minDateStr}
              max={maxDateStr}
              onKeyDown={(e) => e.preventDefault()}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Target waktu penyelesaian pekerjaan</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned User <span className="text-red-500 ml-1">*</span>
            </label>
            {usersLoading ? (
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading users...</span>
              </div>
            ) : users.length > 0 ? (
              <SearchableDropdown
                data={users}
                labelKey="uName"
                valueKey="uId"
                value={form.uId}
                placeholder="Pilih Pekerja"
                onChange={(selectedId) => setForm(prev => ({ ...prev, uId: selectedId }))}
                renderItem={(user) => (
                  <>👤 {user.uName} ({user.uEmail || user.uId})</>
                )}
              />
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.uId}
                  onChange={(e) => setForm(prev => ({ ...prev, uId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="Masukkan User ID"
                  required
                />
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Users API tidak tersedia. Silakan masukkan User ID secara manual.
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Pekerja yang akan bertanggung jawab mengerjakan progress ini
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-blue-200">
        <button
          onClick={() => onSubmit(form)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          disabled={isDisabled}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Menyimpan Progress...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              Simpan Progress
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
          disabled={saving}
        >
          <XCircleIcon className="w-4 h-4" />
          Batal
        </button>
      </div>

      {/* Progress Summary */}
      <div className="mt-4 bg-white border border-blue-100 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">📊 Ringkasan Progress Main</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Target Total</p>
            <p className="font-semibold text-blue-600">{progressMain.opmAmountTotal || 0} pcs</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Progress Items</p>
            <p className="font-semibold text-blue-600">{progressItems.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Sisa Kapasitas</p>
            <p className={`font-semibold ${stageRemaining <= 0 ? 'text-red-600' : stageRemaining <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
              {stageRemaining} pcs
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Progress</p>
            <p className="font-semibold text-purple-600">{progressPercentage}%</p>
          </div>
        </div>
      </div>
    </div>
  );
});

AddProgressForm.displayName = 'AddProgressForm';
export default AddProgressForm;
