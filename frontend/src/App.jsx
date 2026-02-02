import { Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import Home from './pages/Home';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import SettingsPage from './pages/Settings';
import { dashboard, sync } from './services/api';

function App() {
  const [alerts, setAlerts] = useState({ inbound: 0, outbound: 0 });
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const stats = await dashboard.getStats();
      setAlerts({
        inbound: stats.pending_inbound + stats.overdue_inbound,
        outbound: stats.pending_outbound + stats.overdue_outbound,
      });
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleSync = async (type) => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = type === 'import'
        ? await sync.importFromExcel()
        : await sync.exportToExcel();
      setSyncMessage(result.message);
      loadAlerts();
    } catch (error) {
      setSyncMessage(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-red-600 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Sea Foam" className="h-12" />
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-red-600">Load Board</h1>
            </div>

            <div className="flex items-center gap-4">
              {syncMessage && (
                <span className={`text-sm ${syncMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {syncMessage}
                </span>
              )}
              <button
                onClick={() => handleSync('import')}
                disabled={syncing}
                className="btn btn-secondary flex items-center gap-2"
                title="Import from Excel"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Import
              </button>
              <button
                onClick={() => handleSync('export')}
                disabled={syncing}
                className="btn btn-primary flex items-center gap-2"
                title="Export to Excel"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-2">
            <NavLink to="/" className={navLinkClass}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </NavLink>
            <NavLink to="/inbound" className={navLinkClass}>
              <ArrowDownToLine className="w-5 h-5" />
              Inbound
              {alerts.inbound > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {alerts.inbound}
                </span>
              )}
            </NavLink>
            <NavLink to="/outbound" className={navLinkClass}>
              <ArrowUpFromLine className="w-5 h-5" />
              Outbound
              {alerts.outbound > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {alerts.outbound}
                </span>
              )}
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inbound" element={<Inbound />} />
          <Route path="/outbound" element={<Outbound />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
