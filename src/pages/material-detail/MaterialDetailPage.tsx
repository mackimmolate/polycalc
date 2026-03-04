import { Navigate, useLocation, useParams } from 'react-router-dom';

interface NavigationState {
  successMessage?: string;
}

export function MaterialDetailPage() {
  const { materialId } = useParams();
  const location = useLocation();
  const state = (location.state as NavigationState | null) ?? null;

  return (
    <Navigate
      to="/materials"
      replace
      state={{
        successMessage: state?.successMessage,
        expandMaterialId: materialId,
      }}
    />
  );
}
