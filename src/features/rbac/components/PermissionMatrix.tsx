import { Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoles } from '../hooks/useRoles';
import { usePermissions } from '../hooks/usePermissions';

export function PermissionMatrix() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permsLoading } = usePermissions();

  const isLoading = rolesLoading || permsLoading;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  // Group permissions by resource
  const grouped = permissions.reduce<Record<string, typeof permissions>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  const resources = Object.keys(grouped).sort();

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Permission</TableHead>
            {roles.map((role) => (
              <TableHead key={role.id} className="text-center min-w-[120px]">
                <Badge variant={role.isSystem ? 'outline' : 'default'}>{role.name}</Badge>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <>
              {/* Resource group header row */}
              <TableRow key={`group-${resource}`} className="bg-muted/50">
                <TableCell
                  colSpan={roles.length + 1}
                  className="font-semibold text-xs uppercase tracking-wide text-muted-foreground py-2 px-4"
                >
                  {resource}
                </TableCell>
              </TableRow>

              {/* Permission rows for this resource */}
              {grouped[resource].map((perm) => (
                <TableRow key={perm.id}>
                  <TableCell className="font-mono text-sm pl-6">{perm.name}</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role.id} className="text-center">
                      {role.permissions.includes(perm.name) ? (
                        <Check className="inline-block h-4 w-4 text-green-600" aria-label="Granted" />
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not granted">—</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ))}

          {permissions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={roles.length + 1}
                className="text-center text-muted-foreground py-8"
              >
                No permissions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
