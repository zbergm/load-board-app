import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import InboundTable from '../components/InboundTable';
import Filters from '../components/Filters';
import ShipmentForm from '../components/ShipmentForm';
import { inbound } from '../services/api';

export default function Inbound() {
  const [shipments, setShipments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 50,
    total: 0,
    total_pages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    source: '',
    carrier: '',
    status: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  const loadShipments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, page_size: 50 };

      if (filters.search) params.search = filters.search;
      if (filters.source) params.source = filters.source;
      if (filters.carrier) params.carrier = filters.carrier;
      if (filters.status === 'pending') params.received = false;
      if (filters.status === 'completed') params.received = true;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const data = await inbound.getAll(params);
      setShipments(data.items);
      setPagination({
        page: data.page,
        page_size: data.page_size,
        total: data.total,
        total_pages: data.total_pages,
      });
    } catch (error) {
      console.error('Failed to load shipments:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadShipments(1);
  }, [loadShipments]);

  const handlePageChange = (page) => {
    loadShipments(page);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreate = async (data) => {
    await inbound.create(data);
    loadShipments(1);
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setShowForm(true);
  };

  const handleUpdate = async (data) => {
    await inbound.update(editingShipment.id, data);
    loadShipments(pagination.page);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingShipment(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Inbound Shipments</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Shipment
        </button>
      </div>

      <Filters
        type="inbound"
        filters={filters}
        onChange={handleFilterChange}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <InboundTable
          shipments={shipments}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefresh={() => loadShipments(pagination.page)}
          onEdit={handleEdit}
        />
      )}

      {showForm && (
        <ShipmentForm
          type="inbound"
          onSubmit={editingShipment ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
          initialData={editingShipment}
        />
      )}
    </div>
  );
}
