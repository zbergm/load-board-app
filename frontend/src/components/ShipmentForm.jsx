import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { reference } from '../services/api';

export default function ShipmentForm({ type, onSubmit, onClose, initialData }) {
  const [formData, setFormData] = useState({
    source: 'TP',
    ...(type === 'inbound' ? {
      item_number: '',
      cases: '',
      po: '',
      carrier: '',
      bol_number: '',
      tp_receipt_number: '',
      ship_date: '',
      pallets: '',
      notes: '',
      received: false,
    } : {
      reference_number: '',
      order_number: '',
      customer: '',
      carrier: '',
      ship_date: '',
      pallets: '',
      pro: '',
      seal: '',
      notes: '',
      pickup_time: '',
      shipped: false,
    }),
    ...initialData,
  });

  const [carriers, setCarriers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [carriersData, customersData] = await Promise.all([
        reference.getCarriers(),
        reference.getCustomers(),
      ]);
      setCarriers(carriersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load reference data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === 'checkbox' ? checked :
              inputType === 'number' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clean up form data
    const cleanData = {};
    for (const [key, value] of Object.entries(formData)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    }

    try {
      await onSubmit(cleanData);
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit' : 'Add'} {type === 'inbound' ? 'Inbound' : 'Outbound'} Shipment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="select"
              >
                <option value="TP">TP</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ship Date
              </label>
              <input
                type="date"
                name="ship_date"
                value={formData.ship_date}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {type === 'inbound' ? (
            <>
              {/* Inbound-specific fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item #
                  </label>
                  <input
                    type="text"
                    name="item_number"
                    value={formData.item_number}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cases
                  </label>
                  <input
                    type="number"
                    name="cases"
                    value={formData.cases}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PO
                  </label>
                  <input
                    type="text"
                    name="po"
                    value={formData.po}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOL #
                  </label>
                  <input
                    type="text"
                    name="bol_number"
                    value={formData.bol_number}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              {formData.source === 'TP' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TP Receipt #
                  </label>
                  <input
                    type="text"
                    name="tp_receipt_number"
                    value={formData.tp_receipt_number}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Outbound-specific fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference #
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order #
                  </label>
                  <input
                    type="text"
                    name="order_number"
                    value={formData.order_number}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="select"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pro
                  </label>
                  <input
                    type="text"
                    name="pro"
                    value={formData.pro}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seal
                  </label>
                  <input
                    type="text"
                    name="seal"
                    value={formData.seal}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    name="pickup_time"
                    value={formData.pickup_time}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>
            </>
          )}

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrier
              </label>
              <select
                name="carrier"
                value={formData.carrier}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select carrier...</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pallets
              </label>
              <input
                type="number"
                name="pallets"
                step="0.5"
                value={formData.pallets}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input"
            />
          </div>

          {/* Status toggle - only show when editing */}
          {initialData && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={type === 'inbound' ? 'received' : 'shipped'}
                  checked={type === 'inbound' ? formData.received : formData.shipped}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {type === 'inbound' ? 'Mark as Received' : 'Mark as Shipped'}
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
