import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { reference } from '../services/api';

export default function Filters({ type, filters, onChange }) {
  const [carriers, setCarriers] = useState([]);
  const [customers, setCustomers] = useState([]);

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

  const handleChange = (name, value) => {
    onChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      source: '',
      carrier: '',
      customer: '',
      status: '',
      start_date: '',
      end_date: '',
    });
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="card mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Source */}
        <select
          value={filters.source || ''}
          onChange={(e) => handleChange('source', e.target.value)}
          className="select"
        >
          <option value="">All Sources</option>
          <option value="TP">TP</option>
          <option value="OTHER">OTHER</option>
        </select>

        {/* Carrier */}
        <select
          value={filters.carrier || ''}
          onChange={(e) => handleChange('carrier', e.target.value)}
          className="select"
        >
          <option value="">All Carriers</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Customer (outbound only) */}
        {type === 'outbound' && (
          <select
            value={filters.customer || ''}
            onChange={(e) => handleChange('customer', e.target.value)}
            className="select"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
          className="select"
        >
          <option value="">All Status</option>
          {type === 'outbound' && (
            <option value="pending_routing">Pending Routing</option>
          )}
          <option value="pending">Pending</option>
          <option value="completed">
            {type === 'inbound' ? 'Received' : 'Shipped'}
          </option>
        </select>

        {/* Date Range */}
        <div>
          <input
            type="date"
            placeholder="Start Date"
            value={filters.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <input
            type="date"
            placeholder="End Date"
            value={filters.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            className="input"
          />
        </div>
      </div>
    </div>
  );
}
