import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Clock, CheckCircle, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'scan' | 'cleanup' | 'error' | 'info';
  repository: string;
  message: string;
  details?: string;
}

interface ActivityLogProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const typeConfig = {
  scan: {
    icon: Clock,
    variant: "default" as const,
    label: "Scan",
  },
  cleanup: {
    icon: CheckCircle,
    variant: "secondary" as const,
    label: "Cleanup",
  },
  error: {
    icon: XCircle,
    variant: "destructive" as const,
    label: "Error",
  },
  info: {
    icon: AlertTriangle,
    variant: "outline" as const,
    label: "Info",
  },
};

export function ActivityLog({ logs, onClear }: ActivityLogProps) {
  const handleClear = () => {
    console.log('Clear logs triggered');
    onClear?.();
  };

  return (
    <Card data-testid="card-activity-log">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          {logs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              data-testid="button-clear-logs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-logs">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Logs will appear here as you use the application</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {logs.map((log) => {
                const config = typeConfig[log.type];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={log.id} 
                    className="flex gap-3 p-3 border rounded-lg hover-elevate"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={config.variant}>
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium" data-testid={`text-log-repository-${log.id}`}>
                          {log.repository}
                        </span>
                        <span className="text-xs text-muted-foreground" data-testid={`text-log-time-${log.id}`}>
                          {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1" data-testid={`text-log-message-${log.id}`}>
                        {log.message}
                      </p>
                      
                      {log.details && (
                        <div className="text-xs bg-muted p-2 rounded font-mono" data-testid={`text-log-details-${log.id}`}>
                          {log.details}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}