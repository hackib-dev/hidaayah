export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-secondary" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground">Please wait</p>
        </div>
      </div>
    </div>
  );
}
