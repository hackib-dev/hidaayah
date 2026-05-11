export default function Loading() {
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-background">
      <div className="h-16 border-b border-border bg-background/95" />
      <div className="pt-6 px-4 md:px-6 max-w-4xl mx-auto space-y-5">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl shimmer" />
          <div className="h-4 w-64 rounded-lg shimmer" />
        </div>
        <div className="h-12 rounded-xl shimmer" />
        <div className="flex gap-2">
          <div className="h-9 w-16 rounded-xl shimmer" />
          <div className="h-9 w-20 rounded-xl shimmer" />
          <div className="h-9 w-20 rounded-xl shimmer" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl shimmer" />
        ))}
      </div>
    </div>
  );
}
