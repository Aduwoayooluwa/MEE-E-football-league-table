import PlayerForm from '../components/player-form';
import AdminPanel from '../components/admin-panel';
import SeasonManagement from '../components/season-management';
import LogoutButton from '../auth/logout-button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Tabs } from 'antd';

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const userAllowed = Cookies.get('adminSession');
    if (!userAllowed) {
      navigate('/login');
    }
  }, []);

  const tabItems = [
    {
      key: 'seasons',
      label: 'Season Management',
      children: <SeasonManagement />,
    },
    {
      key: 'players',
      label: 'Player Management',
      children: <PlayerForm />,
    },
    {
      key: 'matches',
      label: 'Match Results',
      children: <AdminPanel />,
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl bg-white w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <Tabs
          items={tabItems}
          type="card"
          className="mb-4"
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <Tabs
          items={tabItems}
          type="card"
          size="large"
        />
      </div>
    </div>
  );
}
