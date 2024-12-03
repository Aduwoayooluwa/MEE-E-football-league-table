import PlayerForm from '../components/player-form';
import AdminPanel from '../components/admin-panel';
import LogoutButton from '../auth/logout-button';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function AdminPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const userAllowed = Cookies.get('adminSession');
        if (!userAllowed) {
            navigate('/login');
        }
    }, [])  ;
  return (
    <div className="containern mx-auto max-w-6xl w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <LogoutButton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
