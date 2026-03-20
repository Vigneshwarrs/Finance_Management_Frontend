import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RoleList } from './RoleList';
import { RoleForm } from './RoleForm';
import { PermissionMatrix } from './PermissionMatrix';

export function RoleManagementPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Role Management</h1>
          <p className="text-muted-foreground mt-1">Manage roles and their permissions.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create Role</Button>
      </div>

      <RoleList />

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Permission Matrix</h2>
          <p className="text-muted-foreground text-sm">Overview of which roles have which permissions.</p>
        </div>
        <PermissionMatrix />
      </div>

      <RoleForm open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
