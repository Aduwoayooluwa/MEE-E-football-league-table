import { Link, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';
export default function Layout() {

    const userAuthenticated = Cookies.get('adminSession') !== undefined;
  return (
    <div className="w-full">
      <nav className="bg-blue-500 p-4 text-white w-full flex justify-between">
        <Link to="/" className="text-xl font-bold">
          MEE Football League
        </Link>
        <div className="space-x-4">
          <Link to="/">Home</Link>
          {userAuthenticated ? (
            <Link to="/admin">Admin</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
