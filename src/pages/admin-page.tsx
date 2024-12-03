import PlayerForm from '../components/player-form';
import AdminPanel from '../components/admin-panel';
import LogoutButton from '../auth/logout-button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button, Divider } from 'antd';

export default function AdminPage() {
  const navigate = useNavigate();
  const [isPlayerFormOpen, setIsPlayerFormOpen] = useState(false); // Collapsible state

  useEffect(() => {
    const userAllowed = Cookies.get('adminSession');
    if (!userAllowed) {
      navigate('/login');
    }
  }, []);

  const togglePlayerForm = () => {
    setIsPlayerFormOpen((prev) => !prev);
  };

  return (
    <div className="container mx-auto max-w-6xl bg-white w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <LogoutButton />
      </div>

      {/* Mobile Collapsible Section */}
      <div className="block lg:hidden">
        <Button
          type="primary"
          className="w-full mb-4"
          onClick={togglePlayerForm}
        >
          {isPlayerFormOpen ? 'Hide Add Player Form' : 'Add a player'}
        </Button>
        {isPlayerFormOpen && (
          <div className="bg-white p-4 rounded-lg mb-4">
            <PlayerForm />
          </div>
        )}
        <div className="bg-white p-4 rounded-lg">
          <Divider><h2 className="text-xl font-semibold mb-2">Record Match Scores</h2></Divider>
          <AdminPanel />
        </div>
      </div>

      {/* Desktop Two-Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        <div>
          <PlayerForm />
        </div>
        <div>
          <AdminPanel />
        </div>
      </div>
    </div>
  );
}
