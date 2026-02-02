import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Plus, Clock } from 'lucide-react';
import { sync, reference } from '../services/api';

export default function Settings() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLog, setSyncLog] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [newCarrier, setNewCarrier] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [status, log, carriersData, customersData] = await Promise.all([
        sync.getStatus(),
        sync.getLog(10),
        reference.getCarriers(),
        reference.getCustomers(),
      ]);
      setSyncStatus(status);
      setSyncLog(log);
      setCarriers(carriersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to load settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarrier = async () => {
    if (!newCarrier.trim()) return;
    try {
      await reference.createCarrier({ name: newCarrier.trim() });
      setNewCarrier('');
      loadData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteCarrier = async (id) => {
    if (!confirm('Delete this carrier?')) return;
    try {
      await reference.deleteCarrier(id);
      loadData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.trim()) return;
    try {
      await reference.createCustomer({ name: newCustomer.trim() });
      setNewCustomer('');
      loadData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await reference.deleteCustomer(id);
      loadData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Sync Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Excel Sync Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Last Sync</p>
            <p className="font-medium">{formatDate(syncStatus?.last_sync)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium capitalize">{syncStatus?.sync_type || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Records</p>
            <p className="font-medium">{syncStatus?.records_processed ?? 'N/A'}</p>
          </div>
        </div>

        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Sync Log
        </h4>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {syncLog.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No sync history
                  </td>
                </tr>
              ) : (
                syncLog.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td className="capitalize">{log.sync_type}</td>
                    <td>
                      <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.records_processed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carriers & Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carriers */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Carriers</h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCarrier}
              onChange={(e) => setNewCarrier(e.target.value)}
              placeholder="New carrier name"
              className="input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCarrier()}
            />
            <button
              onClick={handleAddCarrier}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{carrier.name}</span>
                <button
                  onClick={() => handleDeleteCarrier(carrier.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {carriers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No carriers</p>
            )}
          </div>
        </div>

        {/* Customers */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Customers</h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              placeholder="New customer name"
              className="input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomer()}
            />
            <button
              onClick={handleAddCustomer}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{customer.name}</span>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No customers</p>
            )}
          </div>
        </div>
      </div>

      {/* File Path Info */}
      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Excel File Location</h3>
        <p className="text-sm text-blue-700 font-mono break-all">
          C:\Users\Zach\OneDrive - Ellingson Classic Cars\Desktop\Operations Data\Load Board 2026.xlsx
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Use the Import/Export buttons in the header to sync data between the app and Excel file.
        </p>
      </div>
    </div>
  );
}
