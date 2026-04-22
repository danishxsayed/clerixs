import { Loader2 } from 'lucide-react';

export default function AppLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground/80">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-wide">Connecting...</p>
      </div>
    </div>
  );
}
