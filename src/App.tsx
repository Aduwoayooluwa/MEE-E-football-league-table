import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/home-page';
import AdminPage from './pages/admin-page';
import Layout from './layout/layout';
import LoginPage from './auth/admin-login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <>
    <Layout />
    <HomePage />
    </>,
  },
  {
    path: '/admin',
    element: <>
    <Layout />
    <AdminPage />
    </>,
  },
  {
    path: '/login',
    element: <>
    {/* <Layout /> */}
    <LoginPage />
    </>,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
