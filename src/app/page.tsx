import Dashboard from '@/components/dashboard';
import { Route } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Route className="h-5 w-5" />
          </div>
          <span className="font-headline">Jakarta Traffic</span>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Dashboard />
      </main>
    </div>
  );
}
