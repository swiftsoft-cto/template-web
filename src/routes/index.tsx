import { createBrowserRouter } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import Loadable from 'components/Loadable';
import ChunkErrorHandler from 'components/ChunkErrorHandler';
import { lazy } from 'react';

// 404 page
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/404')));

// auth action pages
const ApproveDevice = Loadable(lazy(() => import('pages/auth/approve-device')));
const Verify = Loadable(lazy(() => import('pages/auth/verify')));
const Unlock = Loadable(lazy(() => import('pages/auth/unlock')));
const RejectDevice = Loadable(lazy(() => import('pages/auth/reject-device')));
const ReportLogin = Loadable(lazy(() => import('pages/auth/report-login')));
const Reset = Loadable(lazy(() => import('pages/auth/reset')));

// ==============================|| ROUTING RENDER ||============================== //

// Função helper para adicionar errorElement recursivamente
const addErrorElement = (route: any): any => {
  if (!route || typeof route !== 'object') return route;

  const newRoute = { ...route };

  // Adiciona errorElement se não existir
  if (!newRoute.errorElement) {
    newRoute.errorElement = <ChunkErrorHandler />;
  }

  // Processa children recursivamente
  if (newRoute.children) {
    if (Array.isArray(newRoute.children)) {
      newRoute.children = newRoute.children.map((child: any) => addErrorElement(child));
    } else {
      newRoute.children = addErrorElement(newRoute.children);
    }
  }

  return newRoute;
};

const router = createBrowserRouter(
  [
    {
      path: '/approve-device',
      element: <ApproveDevice />,
      errorElement: <ChunkErrorHandler />
    },
    {
      path: '/verify',
      element: <Verify />,
      errorElement: <ChunkErrorHandler />
    },
    {
      path: '/unlock',
      element: <Unlock />,
      errorElement: <ChunkErrorHandler />
    },
    {
      path: '/reject-device',
      element: <RejectDevice />,
      errorElement: <ChunkErrorHandler />
    },
    {
      path: '/report-login',
      element: <ReportLogin />,
      errorElement: <ChunkErrorHandler />
    },
    {
      path: '/reset',
      element: <Reset />,
      errorElement: <ChunkErrorHandler />
    },
    addErrorElement(LoginRoutes),
    addErrorElement(MainRoutes),
    {
      path: '*',
      element: <MaintenanceError />,
      errorElement: <ChunkErrorHandler />
    }
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
