import { PageHeading } from '@/components/ui/PageHeading';
import { MaterialFormScaffold } from '@/features/materials/components/MaterialFormScaffold';

export function CreateMaterialPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Create Material"
        description="Set up a new material profile. Form structure is ready, while persistence is added in Phase 2."
      />
      <MaterialFormScaffold mode="create" />
    </div>
  );
}
