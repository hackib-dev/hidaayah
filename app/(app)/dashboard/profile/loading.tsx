export default function Loading() {
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-background">
      <div className="h-16 border-b border-border bg-background/95" />
      <div className="pt-6 px-4 md:px-6 max-w-3xl mx-auto space-y-5">
        <div className="h-24 rounded-2xl shimmer" />
        <div className="grid grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
          <div className="h-48 rounded-2xl shimmer" />
        </div>
        <div className="h-48 rounded-2xl shimmer" />
      </div>
    </div>
  );
}
