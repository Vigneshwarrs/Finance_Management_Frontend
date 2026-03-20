import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePermissions, type Permission } from '../hooks/usePermissions';
import { useCreateRole, useUpdateRole, type RoleDefinition } from '../hooks/useRoles';

interface RoleFormProps {
  open: boolean;
  role?: RoleDefinition;
  onClose: () => void;
}

function groupByResource(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});
}

export function RoleForm({ open, role, onClose }: RoleFormProps) {
  const isEditing = !!role;
  const { data: permissions = [] } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPermissions(new Set(role.permissions));
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions(new Set());
    }
  }, [role, open]);

  function togglePermission(permName: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permName)) {
        next.delete(permName);
      } else {
        next.add(permName);
      }
      return next;
    });
  }

  function handleSubmit() {
    const permissionsArray = Array.from(selectedPermissions);
    if (isEditing && role) {
      updateRole.mutate(
        { id: role.id, description, permissions: permissionsArray },
        { onSuccess: onClose }
      );
    } else {
      createRole.mutate(
        { name, description, permissions: permissionsArray },
        { onSuccess: onClose }
      );
    }
  }

  const grouped = groupByResource(permissions);
  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit Role: ${role?.name}` : 'Create Role'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEditing && (
            <div className="space-y-1">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Auditor"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role"
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <ScrollArea className="h-64 rounded-md border p-3">
              <div className="space-y-4">
                {Object.entries(grouped).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {resource}
                    </p>
                    <div className="space-y-1">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={selectedPermissions.has(perm.name)}
                            onCheckedChange={() => togglePermission(perm.name)}
                          />
                          <label
                            htmlFor={`perm-${perm.id}`}
                            className="text-sm cursor-pointer select-none"
                          >
                            <span className="font-mono">{perm.name}</span>
                            {perm.description && (
                              <span className="text-muted-foreground ml-2">— {perm.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
