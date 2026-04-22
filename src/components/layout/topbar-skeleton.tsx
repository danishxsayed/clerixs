export function TopbarSkeleton() {
  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-8 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
           <div className="h-3 w-24 bg-muted rounded" />
           <div className="h-2 w-16 bg-muted rounded" />
        </div>
        <div className="h-10 w-10 bg-muted rounded-full" />
      </div>
    </div>
  );
}
