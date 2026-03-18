
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from './api/queryClient';
import { AppRoutes } from './routes';
import { useToastStore } from './store/toastStore';
import { AppToast } from './components/AppToast';


export default function App() {
  const { toasts, removeToast } = useToastStore();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        {toasts.map((toast) => (
          <AppToast
            key={toast.id}
            open={true}
            title={toast.variant === 'error' ? 'Error' : toast.variant.charAt(0).toUpperCase() + toast.variant.slice(1)}
            description={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
