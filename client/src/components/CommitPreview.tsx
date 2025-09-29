import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCommit, Calendar, User, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ReplitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
  isReplitGenerated: boolean;
  replitPrompt?: string;
}

interface CommitPreviewProps {
  repositoryName: string;
  commits: ReplitCommit[];
  onSelectAll?: (selected: boolean) => void;
  onSelectCommit?: (sha: string, selected: boolean) => void;
  selectedCommits?: Set<string>;
}

export function CommitPreview({ 
  repositoryName, 
  commits, 
  onSelectAll, 
  onSelectCommit,
  selectedCommits = new Set()
}: CommitPreviewProps) {
  const replitCommits = commits.filter(c => c.isReplitGenerated);
  const allSelected = replitCommits.length > 0 && replitCommits.every(c => selectedCommits.has(c.sha));
  
  const handleSelectAll = () => {
    console.log('Select all toggled:', !allSelected);
    onSelectAll?.(!allSelected);
  };

  const handleSelectCommit = (sha: string) => {
    const isSelected = selectedCommits.has(sha);
    console.log('Commit selection toggled:', sha, !isSelected);
    onSelectCommit?.(sha, !isSelected);
  };

  if (commits.length === 0) {
    return null;
  }

  return (
    <Card data-testid="card-commit-preview">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit className="h-5 w-5" />
          Replit Commits in {repositoryName}
          <Badge variant="destructive">{replitCommits.length}</Badge>
        </CardTitle>
        {replitCommits.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">
              These commits will be permanently removed from Git history
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {replitCommits.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              data-testid="button-select-all-commits"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedCommits.size} of {replitCommits.length} selected
            </span>
          </div>
        )}
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {replitCommits.map((commit) => (
            <div 
              key={commit.sha} 
              className={`p-4 border rounded-lg hover-elevate cursor-pointer ${
                selectedCommits.has(commit.sha) ? 'border-destructive bg-destructive/5' : ''
              }`}
              onClick={() => handleSelectCommit(commit.sha)}
              data-testid={`commit-item-${commit.sha}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedCommits.has(commit.sha)}
                  onChange={(e) => handleSelectCommit(commit.sha)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                  data-testid={`checkbox-commit-${commit.sha}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-muted-foreground" data-testid={`text-commit-sha-${commit.sha}`}>
                      {commit.sha.substring(0, 7)}
                    </span>
                    <Badge variant="destructive">Replit</Badge>
                  </div>
                  
                  <p className="text-sm font-medium mb-2" data-testid={`text-commit-message-${commit.sha}`}>
                    {commit.message}
                  </p>
                  
                  {commit.replitPrompt && (
                    <div className="bg-muted p-2 rounded text-xs mb-2" data-testid={`text-replit-prompt-${commit.sha}`}>
                      <span className="font-medium">Replit Prompt:</span> {commit.replitPrompt}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span data-testid={`text-commit-author-${commit.sha}`}>{commit.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span data-testid={`text-commit-date-${commit.sha}`}>
                        {formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}