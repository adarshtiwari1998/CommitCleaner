import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusType } from "./StatusBadge";
import { GitBranch, Calendar, Trash2, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Repository {
  id: string;
  url: string;
  name: string;
  owner: string;
  status: StatusType;
  lastScanned?: Date;
  replitCommitsFound?: number;
  private: boolean;
}

interface RepositoryCardProps {
  repository: Repository;
  onScan?: (id: string) => void;
  onRemove?: (id: string) => void;
  onCleanup?: (id: string) => void;
}

export function RepositoryCard({ repository, onScan, onRemove, onCleanup }: RepositoryCardProps) {
  const handleScan = () => {
    console.log('Scan triggered for:', repository.name);
    onScan?.(repository.id);
  };

  const handleRemove = () => {
    console.log('Remove triggered for:', repository.name);
    onRemove?.(repository.id);
  };

  const handleCleanup = () => {
    console.log('Cleanup triggered for:', repository.name);
    onCleanup?.(repository.id);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-repository-${repository.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium truncate" data-testid={`text-repo-name-${repository.id}`}>
                {repository.owner}/{repository.name}
              </h3>
              {repository.private && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  Private
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate" data-testid={`text-repo-url-${repository.id}`}>
              {repository.url}
            </p>
          </div>
          <StatusBadge status={repository.status} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {repository.lastScanned && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span data-testid={`text-last-scanned-${repository.id}`}>
                Last scanned {formatDistanceToNow(repository.lastScanned, { addSuffix: true })}
              </span>
            </div>
          )}
          
          {repository.replitCommitsFound !== undefined && repository.replitCommitsFound > 0 && (
            <div className="text-sm">
              <span className="text-destructive font-medium" data-testid={`text-commits-found-${repository.id}`}>
                {repository.replitCommitsFound} Replit commits found
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleScan}
              disabled={repository.status === 'scanning' || repository.status === 'processing'}
              data-testid={`button-scan-${repository.id}`}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {repository.status === 'scanning' ? 'Scanning...' : 'Scan'}
            </Button>
            
            {repository.status === 'needs_cleanup' && repository.replitCommitsFound && repository.replitCommitsFound > 0 && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleCleanup}
                data-testid={`button-cleanup-${repository.id}`}
              >
                Clean Up
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleRemove}
              data-testid={`button-remove-${repository.id}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}