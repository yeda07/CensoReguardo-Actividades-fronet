import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import CensoPage from 'src/pages/censo';
import DashboardLayout from 'src/layouts/dashboard';
import ActividadesPage from 'src/pages/actividades';

import { useAuth, AuthProvider } from 'src/sections/context/AuthContext';

export const IndexPage = lazy(() => import('src/pages/app'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ListaPage = lazy(() => import('src/pages/lista'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const PdfPage = lazy(() => import('src/pages/pdf'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function AppRoutes() {
  const routes = useRoutes([
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'censo', element: <CensoPage /> },
        { path: 'actividades', element: <ActividadesPage /> },
        { path: 'lista', element: <ListaPage /> },
        { path: 'pdf/:id', element: <PdfPage /> }
      ],
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}

export default function Router() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
