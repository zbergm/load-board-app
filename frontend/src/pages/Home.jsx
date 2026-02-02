import Dashboard from '../components/Dashboard';
import Notifications from '../components/Notifications';

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <Notifications />
      <Dashboard />
    </div>
  );
}
