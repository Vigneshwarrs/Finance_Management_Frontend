import { usePermissions, type Permission } from '../hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function groupByResource(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});
}

export function PermissionList() {
  const { data: permissions = [], isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const grouped = groupByResource(permissions);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([resource, perms]) => (
        <div key={resource}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {resource}
          </h3>
          <div className="flex flex-wrap gap-2">
            {perms.map((perm) => (
              <div
                key={perm.id}
                className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
              >
                <Badge variant="outline">{perm.name}</Badge>
                <span className="text-muted-foreground">{perm.description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
