import { memo, useState } from 'react';

const AddProgressDetailForm = memo(({ progress, saving, onSubmit, onCancel }) => {
  const [form, setForm] = useState({ opdAmount: '', opdFinishedAt: '' });
  const max = progress.opAmount - progress.opAmountDone;

  const handleAmountChange = (e) => {
    let value = Number(e.target.value);
    if (value > max) value = max;
    if (value < 0) value = 0;
    setForm(prev => ({ ...prev, opdAmount: value }));
  };

  return (
    <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
      <h6 className="font-medium text-green-800 mb-3">Tambah Finished Item</h6>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Jumlah Selesai <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            value={form.opdAmount}
            onChange={handleAmountChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Jumlah yang sudah selesai"
            max={max}
            onWheel={(e) => e.currentTarget.blur()}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Maks: {max} pcs</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Waktu Selesai <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            value={form.opdFinishedAt}
            onChange={(e) => setForm(prev => ({ ...prev, opdFinishedAt: e.target.value }))}
            onKeyDown={(e) => e.preventDefault()}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onSubmit(form)}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
          disabled={saving || !form.opdAmount || !form.opdFinishedAt}
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          disabled={saving}
        >
          Batal
        </button>
      </div>
    </div>
  );
});

AddProgressDetailForm.displayName = 'AddProgressDetailForm';
export default AddProgressDetailForm;
