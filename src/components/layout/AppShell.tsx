import { Outlet } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

function Sidebar({ open }: { open: boolean }) {
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Borrowers', path: '/borrowers' },
    { label: 'Loans', path: '/loans' },
    { label: 'Repayments', path: '/repayments' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Reports', path: '/reports' },
    { label: 'Users', path: '/users' },
  ];

  return (
    <aside
      className={`bg-gray-800 text-white transition-all duration-200 ${open ? 'w-56' : 'w-0 overflow-hidden'}`}
      aria-label="Sidebar navigation"
    >
      <div className="p-4 font-bold text-lg border-b border-gray-700">Finance App</div>
      <nav>
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="block px-4 py-2 hover:bg-gray-700 text-sm"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function TopBar() {
  const { theme, toggleTheme } = useUiStore();
  const { setSidebarOpen, sidebarOpen } = useUiStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-4">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        ☰
      </button>
      <span className="flex-1" />
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300">{user?.role}</span>
      <button
        onClick={handleLogout}
        className="text-sm text-red-500 hover:text-red-700"
        aria-label="Logout"
      >
        Logout
      </button>
    </header>
  );
}

export function AppShell() {
  const { sidebarOpen, theme } = useUiStore();

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
