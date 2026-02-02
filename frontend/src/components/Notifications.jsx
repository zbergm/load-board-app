import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';
import { dashboard } from '../services/api';

export default function Notifications() {
  const [todayShipments, setTodayShipments] = useState({ inbound: [], outbound: [] });
  const [overdueShipments, setOverdueShipments] = useState({ inbound: [], outbound: [] });
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [today, overdue] = await Promise.all([
        dashboard.getTodayShipments(),
        dashboard.getOverdueShipments(),
      ]);
      setTodayShipments(today);
      setOverdueShipments(overdue);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = (id) => {
    setDismissed(new Set([...dismissed, id]));
  };

  const pendingInbound = todayShipments.inbound.filter(s => !s.received && !dismissed.has(`in-${s.id}`));
  const pendingOutbound = todayShipments.outbound.filter(s => !s.shipped && !dismissed.has(`out-${s.id}`));
  const overdueInbound = overdueShipments.inbound.filter(s => !dismissed.has(`ov-in-${s.id}`));
  const overdueOutbound = overdueShipments.outbound.filter(s => !dismissed.has(`ov-out-${s.id}`));

  if (loading) {
    return null;
  }

  const hasNotifications = pendingInbound.length > 0 || pendingOutbound.length > 0 ||
    overdueInbound.length > 0 || overdueOutbound.length > 0;

  if (!hasNotifications) {
    return (
      <div className="card mb-6 bg-green-50 border border-green-200">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span>All caught up! No pending or overdue shipments.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Overdue Shipments */}
      {(overdueInbound.length > 0 || overdueOutbound.length > 0) && (
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700 mb-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Overdue Shipments</span>
          </div>
          <div className="space-y-2">
            {overdueInbound.map((s) => (
              <div key={`ov-in-${s.id}`} className="flex items-center justify-between bg-white p-2 rounded border border-red-100">
                <div className="flex items-center gap-2">
                  <span className="badge badge-danger">INBOUND</span>
                  <span className="text-sm">{s.item_number || 'Unknown'}</span>
                  <span className="text-sm text-gray-500">Due: {s.ship_date}</span>
                  <span className="text-sm text-gray-500">Carrier: {s.carrier || 'N/A'}</span>
                </div>
                <button
                  onClick={() => dismiss(`ov-in-${s.id}`)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
            {overdueOutbound.map((s) => (
              <div key={`ov-out-${s.id}`} className="flex items-center justify-between bg-white p-2 rounded border border-red-100">
                <div className="flex items-center gap-2">
                  <span className="badge badge-danger">OUTBOUND</span>
                  <span className="text-sm">{s.reference_number || s.order_number || 'Unknown'}</span>
                  <span className="text-sm text-gray-500">Due: {s.ship_date}</span>
                  <span className="text-sm text-gray-500">Customer: {s.customer || 'N/A'}</span>
                </div>
                <button
                  onClick={() => dismiss(`ov-out-${s.id}`)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Pending */}
      {(pendingInbound.length > 0 || pendingOutbound.length > 0) && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700 mb-3">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Pending Today</span>
          </div>
          <div className="space-y-2">
            {pendingInbound.map((s) => (
              <div key={`in-${s.id}`} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-100">
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning">INBOUND</span>
                  <span className="text-sm">{s.item_number || 'Unknown'}</span>
                  <span className="text-sm text-gray-500">Carrier: {s.carrier || 'N/A'}</span>
                  <span className="text-sm text-gray-500">{s.cases ? `${s.cases} cases` : ''}</span>
                </div>
                <button
                  onClick={() => dismiss(`in-${s.id}`)}
                  className="p-1 hover:bg-yellow-100 rounded"
                >
                  <X className="w-4 h-4 text-yellow-600" />
                </button>
              </div>
            ))}
            {pendingOutbound.map((s) => (
              <div key={`out-${s.id}`} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-100">
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning">OUTBOUND</span>
                  <span className="text-sm">{s.reference_number || s.order_number || 'Unknown'}</span>
                  <span className="text-sm text-gray-500">Customer: {s.customer || 'N/A'}</span>
                  <span className="text-sm text-gray-500">{s.pickup_time ? `Time: ${s.pickup_time}` : ''}</span>
                </div>
                <button
                  onClick={() => dismiss(`out-${s.id}`)}
                  className="p-1 hover:bg-yellow-100 rounded"
                >
                  <X className="w-4 h-4 text-yellow-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
