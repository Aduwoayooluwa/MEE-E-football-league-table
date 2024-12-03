import { Button } from 'antd';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { account } from '../services/appwrite';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Logout from Appwrite
      await account.deleteSession('current');

      // Clear cookies
      Cookies.remove('adminSession');

      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button type="primary" danger onClick={handleLogout}>
      Logout
    </Button>
  );
}
