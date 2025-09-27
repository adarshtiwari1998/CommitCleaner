import { useState } from "react";
import { ActivityLog, type LogEntry } from "@/components/ActivityLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, Calendar } from "lucide-react";

//todo: remove mock functionality - replace with real log data
const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: "cleanup",
    repository: "awesome-project",
    message: "Successfully cleaned 5 Replit commits from repository",
    details: "git rebase completed, force push successful",
  },
  {
    id: "2", 
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: "scan",
    repository: "my-web-app", 
    message: "Scan completed - found 3 Replit commits",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: "error",
    repository: "private-repo",
    message: "Failed to access repository", 
    details: "Error: Repository not found or access denied (HTTP 404)",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: "info",
    repository: "clean-repo",
    message: "Repository scan completed - no Replit commits found",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "cleanup",
    repository: "team-project",
    message: "Backup created successfully before cleanup operation",
    details: "Created backup tag: backup-20241027-14:30:00",
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: "scan",
    repository: "legacy-app",
    message: "Repository added and initial scan started",
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: "error",
    repository: "broken-repo",
    message: "Scan failed due to network timeout",
    details: "Error: connect ETIMEDOUT 140.82.112.3:443",
  },
];

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleClearLogs = () => {
    console.log('Clearing all logs');
    setLogs([]);
  };

  const handleExportLogs = () => {
    console.log('Exporting logs');
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const logCounts = {
    total: logs.length,
    scan: logs.filter(l => l.type === 'scan').length,
    cleanup: logs.filter(l => l.type === 'cleanup').length,
    error: logs.filter(l => l.type === 'error').length,
    info: logs.filter(l => l.type === 'info').length,
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-activity-log">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground mt-1">
            Track all repository operations and system activities
          </p>
        </div>
        <Button onClick={handleExportLogs} variant="outline" data-testid="button-export-logs">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" data-testid="stat-total-logs">{logCounts.total}</div>
            <div className="text-sm text-muted-foreground">Total Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-scan-logs">{logCounts.scan}</div>
            <div className="text-sm text-muted-foreground">Scans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-cleanup-logs">{logCounts.cleanup}</div>
            <div className="text-sm text-muted-foreground">Cleanups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600" data-testid="stat-error-logs">{logCounts.error}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600" data-testid="stat-info-logs">{logCounts.info}</div>
            <div className="text-sm text-muted-foreground">Info</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by repository or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-logs"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
            data-testid="select-type-filter"
          >
            <option value="all">All Types</option>
            <option value="scan">Scan</option>
            <option value="cleanup">Cleanup</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Showing</span>
        <Badge variant="outline">{filteredLogs.length}</Badge>
        <span className="text-sm text-muted-foreground">of {logs.length} log entries</span>
      </div>

      {/* Activity Log */}
      <ActivityLog logs={filteredLogs} onClear={handleClearLogs} />

      {filteredLogs.length === 0 && logs.length > 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-8 w-8 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No logs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find the logs you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}