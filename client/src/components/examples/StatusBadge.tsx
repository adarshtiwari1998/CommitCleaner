import { StatusBadge } from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="p-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="pending" />
        <StatusBadge status="scanning" />
        <StatusBadge status="clean" />
        <StatusBadge status="needs_cleanup" />
        <StatusBadge status="error" />
        <StatusBadge status="processing" />
      </div>
    </div>
  );
}