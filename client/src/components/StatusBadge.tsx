import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertTriangle, XCircle, Loader2 } from "lucide-react";

export type StatusType = "pending" | "scanning" | "clean" | "needs_cleanup" | "error" | "processing";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
    animate: false,
  },
  scanning: {
    label: "Scanning",
    icon: Loader2,
    variant: "default" as const,
    animate: true,
  },
  clean: {
    label: "Clean",
    icon: CheckCircle,
    variant: "secondary" as const,
    animate: false,
  },
  needs_cleanup: {
    label: "Needs Cleanup",
    icon: AlertTriangle,
    variant: "destructive" as const,
    animate: false,
  },
  error: {
    label: "Error",
    icon: XCircle,
    variant: "destructive" as const,
    animate: false,
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    variant: "default" as const,
    animate: true,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className} data-testid={`status-${status}`}>
      <Icon className={`h-3 w-3 mr-1 ${config.animate ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}