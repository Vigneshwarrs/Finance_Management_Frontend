import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Receipt,
  Wallet,
  Bell,
  BarChart3,
  UserCog,
  Shield,
  ClipboardList,
  UserCircle,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from '../../features/rbac/hooks/useUserPermissions';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  requiredPermission: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     path: '/',              icon: LayoutDashboard, requiredPermission: 'reports:read' },
  { label: 'Borrowers',     path: '/borrowers',     icon: Users,           requiredPermission: 'borrowers:read' },
  { label: 'Loans',         path: '/loans',         icon: CreditCard,      requiredPermission: 'loans:read' },
  { label: 'Applications',  path: '/applications',  icon: FileText,        requiredPermission: 'loans:apply' },
  { label: 'Repayments',    path: '/repayments',    icon: Receipt,         requiredPermission: 'repayments:read' },
  { label: 'Payments',      path: '/payments',      icon: Wallet,          requiredPermission: 'payments:initiate' },
  { label: 'Notifications', path: '/notifications', icon: Bell,            requiredPermission: 'notifications:read' },
  { label: 'Reports',       path: '/reports',       icon: BarChart3,       requiredPermission: 'reports:read' },
  { label: 'Users',         path: '/users',         icon: UserCog,         requiredPermission: 'users:read' },
  { label: 'Roles',         path: '/roles',         icon: Shield,          requiredPermission: 'roles:read' },
  { label: 'Audit Log',     path: '/audit',         icon: ClipboardList,   requiredPermission: 'audit:read' },
  { label: 'Profile',       path: '/profile',       icon: UserCircle,      requiredPermission: 'profile:read' },
];

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function AppShell() {
  const { theme, toggleTheme } = useUiStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) =>
    permissions.includes(item.requiredPermission)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1 font-semibold text-sidebar-foreground">
              Finance App
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <NavLink to={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-h-svh">
          {/* Top bar */}
          <header className="h-14 border-b bg-background flex items-center px-4 gap-2">
            <SidebarTrigger />
            <span className="flex-1" />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User avatar + dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user ? getInitials(user.userId) : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user?.userId}</span>
                    <span className="text-xs text-muted-foreground">{user?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
