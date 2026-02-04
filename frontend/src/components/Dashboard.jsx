import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import { dashboard } from '../services/api';

const COLORS = ['#DC2626', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

function StatCard({ title, value, icon: Icon, color = 'blue', subValue }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subValue && <p className="text-sm text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [weeklyVolume, setWeeklyVolume] = useState([]);
  const [carrierData, setCarrierData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [autozonePallets, setAutozonePallets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, weekly, carriers, customers, autozone] = await Promise.all([
        dashboard.getStats(),
        dashboard.getWeeklyVolume(),
        dashboard.getShipmentsByCarrier(),
        dashboard.getShipmentsByCustomer(),
        dashboard.getAutozonePallets(),
      ]);

      setStats(statsData);
      setWeeklyVolume(weekly);
      setCarrierData(carriers.slice(0, 6));
      setCustomerData(customers.slice(0, 6));
      setAutozonePallets(autozone);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Inbound Today"
          value={stats?.total_inbound_today || 0}
          icon={Package}
          color="red"
          subValue={`${stats?.completed_inbound_today || 0} received`}
        />
        <StatCard
          title="Outbound Today"
          value={stats?.total_outbound_today || 0}
          icon={TrendingUp}
          color="green"
          subValue={`${stats?.completed_outbound_today || 0} shipped`}
        />
        <StatCard
          title="Pending"
          value={(stats?.pending_inbound || 0) + (stats?.pending_outbound || 0)}
          icon={Clock}
          color="yellow"
          subValue={`${stats?.pending_inbound || 0} in / ${stats?.pending_outbound || 0} out`}
        />
        <StatCard
          title="Overdue"
          value={(stats?.overdue_inbound || 0) + (stats?.overdue_outbound || 0)}
          icon={AlertTriangle}
          color="red"
          subValue={`${stats?.overdue_inbound || 0} in / ${stats?.overdue_outbound || 0} out`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Volume Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weekly Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inbound" fill="#3B82F6" name="Inbound" />
                <Bar dataKey="outbound" fill="#10B981" name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shipments by Carrier */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Carriers</h3>
          <div className="h-64">
            {carrierData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carrierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {carrierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No carrier data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row - This Week & AutoZone Pallets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Week Summary */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">This Week</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.shipments_this_week || 0}
            <span className="text-lg font-normal text-gray-500 ml-2">total shipments</span>
          </p>
        </div>

        {/* AutoZone Pallets */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">AutoZone Pallets {autozonePallets?.year}</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">
                Shipped so far in {autozonePallets?.current_month_name || 'this month'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {autozonePallets?.current_month_pallets?.toLocaleString() || 0}
                <span className="text-lg font-normal text-gray-500 ml-2">pallets</span>
              </p>
            </div>
            {autozonePallets?.previous_months?.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                {autozonePallets.previous_months.map((month) => (
                  <div key={month.month_name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total in {month.month_name}</span>
                    <span className="text-sm font-semibold text-gray-700">
                      {month.pallets.toLocaleString()} pallets
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
