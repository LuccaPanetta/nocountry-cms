import { LucideIcon } from 'lucide-react';

interface TestimonialCardProps {
  label: string;
  icon: LucideIcon;
  value: number;
  color: string;
}

export function TestimonialCard({ label, icon: Icon, value, color }: TestimonialCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-Neutro-1">{label}</p>
        <Icon className="h-5 w-5 text-Primary" />
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
