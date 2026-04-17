export default function Loading() {
  return (
    <div className="min-h-screen pb-20 md:pb-8 bg-background">
      <div className="h-16 border-b border-border bg-background/95" />
      <div className="pt-6 px-4 md:px-6 max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl shimmer" />
          <div className="h-4 w-80 rounded-lg shimmer" />
        </div>
        <div className="h-10 w-48 rounded-xl shimmer" />
        <div className="grid md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
