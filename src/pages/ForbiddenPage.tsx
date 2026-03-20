import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">403</h1>
      <h2 className="text-2xl font-semibold">Forbidden</h2>
      <p className="text-muted-foreground">You don't have permission to access this page.</p>
      <Button asChild>
        <Link to="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
