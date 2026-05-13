import { Loader2 } from 'lucide-react';

export default function GardenLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
    </div>
  );
}
