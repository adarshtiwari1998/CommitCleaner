import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, CheckCircle, AlertTriangle } from "lucide-react";

export interface ScanResult {
  repositoryId: string;
  repositoryName: string;
  status: 'scanning' | 'completed' | 'error';
  progress: number;
  replitCommitsFound: number;
  totalCommitsScanned: number;
  error?: string;
}

interface ScanProgressProps {
  scans: ScanResult[];
  onCancel?: (repositoryId: string) => void;
}

export function ScanProgress({ scans, onCancel }: ScanProgressProps) {
  if (scans.length === 0) {
    return null;
  }

  const handleCancel = (repositoryId: string) => {
    console.log('Cancel scan triggered for:', repositoryId);
    onCancel?.(repositoryId);
  };

  return (
    <Card data-testid="card-scan-progress">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Scanning Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scans.map((scan) => (
          <div key={scan.repositoryId} className="space-y-3 p-4 border rounded-lg" data-testid={`scan-item-${scan.repositoryId}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" data-testid={`text-scan-repo-${scan.repositoryId}`}>
                  {scan.repositoryName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {scan.status === 'scanning' && (
                    <Badge variant="default">
                      <Search className="h-3 w-3 mr-1 animate-spin" />
                      Scanning...
                    </Badge>
                  )}
                  {scan.status === 'completed' && (
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {scan.status === 'error' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>
              </div>
              
              {scan.status === 'scanning' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCancel(scan.repositoryId)}
                  data-testid={`button-cancel-scan-${scan.repositoryId}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {scan.status === 'scanning' && (
              <div className="space-y-2">
                <Progress value={scan.progress} className="h-2" data-testid={`progress-scan-${scan.repositoryId}`} />
                <p className="text-sm text-muted-foreground" data-testid={`text-scan-progress-${scan.repositoryId}`}>
                  {scan.progress}% - Scanned {scan.totalCommitsScanned} commits
                </p>
              </div>
            )}
            
            {scan.status === 'completed' && (
              <div className="text-sm">
                {scan.replitCommitsFound > 0 ? (
                  <span className="text-destructive font-medium" data-testid={`text-commits-found-${scan.repositoryId}`}>
                    Found {scan.replitCommitsFound} Replit commits out of {scan.totalCommitsScanned} total
                  </span>
                ) : (
                  <span className="text-muted-foreground" data-testid={`text-no-commits-${scan.repositoryId}`}>
                    No Replit commits found in {scan.totalCommitsScanned} commits
                  </span>
                )}
              </div>
            )}
            
            {scan.status === 'error' && scan.error && (
              <p className="text-sm text-destructive" data-testid={`text-scan-error-${scan.repositoryId}`}>
                {scan.error}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}