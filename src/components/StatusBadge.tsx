interface StatusBadgeProps {
  status: string;
  variant?: "default" | "order" | "conversation" | "priority";
}

const statusStyles: Record<string, Record<string, string>> = {
  default: {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
  },
  order: {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  },
  conversation: {
    open: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    waiting: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  },
  priority: {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  },
};

export default function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const styles = statusStyles[variant] || statusStyles.default;
  const style = styles[status.toLowerCase()] || "bg-gray-100 text-gray-700";

  const displayStatus = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {displayStatus}
    </span>
  );
}
