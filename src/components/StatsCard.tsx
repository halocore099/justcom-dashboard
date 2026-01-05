import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className="mt-2 flex items-center text-sm">
              <span
                className={`font-medium ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && (
                <span className="ml-1 text-gray-500">{changeLabel}</span>
              )}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
    </div>
  );
}
