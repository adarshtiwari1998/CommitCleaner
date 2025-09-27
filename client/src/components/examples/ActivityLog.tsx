import { ActivityLog, type LogEntry } from '../ActivityLog';

const sampleLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    type: "cleanup",
    repository: "awesome-project",
    message: "Successfully cleaned 5 Replit commits from repository",
    details: "git rebase completed, force push successful",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    type: "scan",
    repository: "my-web-app",
    message: "Scan completed - found 3 Replit commits",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    type: "error",
    repository: "private-repo",
    message: "Failed to access repository",
    details: "Error: Repository not found or access denied (HTTP 404)",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    type: "info",
    repository: "clean-repo",
    message: "Repository scan completed - no Replit commits found",
  },
];

export default function ActivityLogExample() {
  return (
    <div className="p-6 max-w-2xl">
      <ActivityLog logs={sampleLogs} />
    </div>
  );
}