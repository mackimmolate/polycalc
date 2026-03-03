import { PageHeading } from '@/components/ui/PageHeading';
import { MaterialFormScaffold } from '@/features/materials/components/MaterialFormScaffold';

export function CreateMaterialPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Skapa material"
        description="Skapa en ny materialprofil. Formulärstrukturen är klar, medan lagring kopplas in i Fas 2."
      />
      <MaterialFormScaffold mode="create" />
    </div>
  );
}
