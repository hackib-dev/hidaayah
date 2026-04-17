export default function Loading() {
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-background">
      <div className="h-16 border-b border-border bg-background/95" />
      <div className="pt-6 px-4 md:px-6 max-w-3xl mx-auto space-y-5">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl shimmer" />
          <div className="h-4 w-72 rounded-lg shimmer" />
        </div>
        <div className="h-40 rounded-2xl shimmer" />
        <div className="h-32 rounded-2xl shimmer" />
        <div className="h-48 rounded-2xl shimmer" />
      </div>
    </div>
  );
}
