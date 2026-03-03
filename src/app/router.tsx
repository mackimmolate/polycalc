import { Navigate, createHashRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthPage } from '@/pages/auth/AuthPage';
import { CreateMaterialPage } from '@/pages/material-create/CreateMaterialPage';
import { EditMaterialPage } from '@/pages/material-edit/EditMaterialPage';
import { MaterialDetailPage } from '@/pages/material-detail/MaterialDetailPage';
import { MaterialsListPage } from '@/pages/materials/MaterialsListPage';
import { NotFoundPage } from '@/pages/not-found/NotFoundPage';

export const appRouter = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/materials" />,
      },
      {
        path: 'materials',
        element: <MaterialsListPage />,
      },
      {
        path: 'materials/new',
        element: <CreateMaterialPage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'materials/:materialId',
        element: <MaterialDetailPage />,
      },
      {
        path: 'materials/:materialId/edit',
        element: <EditMaterialPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
