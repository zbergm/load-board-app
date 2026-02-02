import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { outbound } from '../services/api';

export default function OutboundTable({ shipments, pagination, onPageChange, onRefresh, onEdit }) {
  const [loading, setLoading] = useState({});

  const handleMarkShipped = async (id) => {
    setLoading({ ...loading, [id]: true });
    try {
      await outbound.markShipped(id);
      onRefresh();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading({ ...loading, [id]: false });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;
    try {
      await outbound.delete(id);
      onRefresh();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Parse as local time to avoid timezone shift
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const isShipped = (shipment) => {
    return shipment.shipped === 1 || shipment.shipped === true;
  };

  const isDelayed = (shipment) => {
    return shipment.delayed === 1 || shipment.delayed === true;
  };

  const isOverdue = (shipment) => {
    if (isShipped(shipment)) return false;
    if (!shipment.ship_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return shipment.ship_date < today;
  };

  const isPendingRouting = (shipment) => {
    if (isShipped(shipment)) return false;
    return !shipment.reference_number || !shipment.ship_date || !shipment.carrier;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div>
      <div className="table-container rounded-lg border border-gray-200">
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Source</th>
              <th>Ship Date</th>
              <th>Reference #</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Carrier</th>
              <th>Pallets</th>
              <th>Pro</th>
              <th>Time</th>
              <th>Notes</th>
              <th className="sticky-col">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-8 text-gray-500">
                  No shipments found
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className={`
                    ${isOverdue(shipment) ? 'bg-red-50' : ''}
                    ${isToday(shipment.ship_date) && !isShipped(shipment) ? 'bg-yellow-50' : ''}
                  `}
                >
                  <td>
                    {isShipped(shipment) && isDelayed(shipment) ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <Truck className="w-3 h-3" />
                        Shipped/Late
                      </span>
                    ) : isShipped(shipment) ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <Truck className="w-3 h-3" />
                        Shipped
                      </span>
                    ) : isPendingRouting(shipment) ? (
                      <span className="badge badge-secondary flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        Pending Routing
                      </span>
                    ) : isOverdue(shipment) ? (
                      <span className="badge badge-danger flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        Overdue
                      </span>
                    ) : (
                      <span className="badge badge-warning flex items-center gap-1 w-fit">
                        Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">{shipment.source}</span>
                  </td>
                  <td className={isToday(shipment.ship_date) ? 'font-semibold' : ''}>
                    {formatDate(shipment.ship_date)}
                  </td>
                  <td className="font-medium">{shipment.reference_number || '-'}</td>
                  <td>{shipment.order_number || '-'}</td>
                  <td>{shipment.customer || '-'}</td>
                  <td>{shipment.carrier || '-'}</td>
                  <td>{shipment.pallets || '-'}</td>
                  <td>{shipment.pro || '-'}</td>
                  <td>{shipment.pickup_time || '-'}</td>
                  <td className="max-w-xs truncate" title={shipment.notes}>
                    {shipment.notes || '-'}
                  </td>
                  <td className="sticky-col">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(shipment)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!isShipped(shipment) && (
                        <button
                          onClick={() => handleMarkShipped(shipment.id)}
                          disabled={loading[shipment.id]}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Mark as Shipped"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(shipment.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <p className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.page_size) + 1} to{' '}
            {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn btn-secondary p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="btn btn-secondary p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
