import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { AuthRequiredState } from '@/components/ui/AuthRequiredState';
import { PageHeading } from '@/components/ui/PageHeading';
import { MaterialFormScaffold } from '@/features/materials/components/MaterialFormScaffold';
import { createMaterial } from '@/services/materials/materialsService';
import type { MaterialMutationInput } from '@/types/material';

export function CreateMaterialPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (input: MaterialMutationInput) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const created = await createMaterial(input);
      navigate(`/materials/${created.id}`, {
        replace: true,
        state: { successMessage: 'Materialet skapades.' },
      });
    } catch (caughtError) {
      setServerError(
        caughtError instanceof Error ? caughtError.message : 'Kunde inte skapa material.',
      );
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <PageHeading title="Skapa material" description="Kontrollerar inloggning..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeading
          title="Skapa material"
          description="Inloggning krävs för att skapa material i databasen."
        />
        <AuthRequiredState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Skapa material"
        description="Lägg in fasta materialvärden som sedan används i kalkylen."
      />
      <MaterialFormScaffold
        mode="create"
        onSubmit={onSubmit}
        submitting={submitting}
        serverError={serverError}
      />
    </div>
  );
}
