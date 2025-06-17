import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}