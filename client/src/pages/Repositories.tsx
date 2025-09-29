import { useState, useEffect } from "react";
import { RepositoryCard, type Repository } from "@/components/RepositoryCard";
import { ScanProgress, type ScanResult } from "@/components/ScanProgress";
import { CommitPreview, type ReplitCommit } from "@/components/CommitPreview";
import { CleanupConfirmation } from "@/components/CleanupConfirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Repositories() {
  // Use React Query to fetch repositories
  const { data: repositories = [], isLoading, refetch } = useQuery<Repository[]>({
    queryKey: ['/api/repositories'],
  });

  // Mutations for repository operations
  const scanMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await apiRequest('POST', `/api/repositories/${repositoryId}/scan`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      await apiRequest('DELETE', `/api/repositories/${repositoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await apiRequest('POST', `/api/repositories/${repositoryId}/cleanup`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repositories'] });
    },
  });

  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentCommits, setCurrentCommits] = useState<ReplitCommit[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(new Set());
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repo.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || repo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleScanRepository = async (id: string) => {
    const repo = repositories.find(r => r.id === id);
    if (!repo) return;

    console.log('Starting scan for repository:', repo.name);
    
    try {
      const result = await scanMutation.mutateAsync(id);
      setCurrentCommits(result.commits || []);
      
      // Show scan completion
      const scanResult: ScanResult = {
        repositoryId: id,
        repositoryName: repo.name,
        status: "completed",
        progress: 100,
        replitCommitsFound: result.repository?.replitCommitsFound || 0,
        totalCommitsScanned: result.commits?.length || 0,
      };
      setScanResults(prev => [...prev, scanResult]);
      
    } catch (error) {
      console.error('Failed to scan repository:', error);
      
      // Show scan error
      const scanResult: ScanResult = {
        repositoryId: id,
        repositoryName: repo.name,
        status: "error",
        progress: 0,
        replitCommitsFound: 0,
        totalCommitsScanned: 0,
      };
      setScanResults(prev => [...prev, scanResult]);
    }
  };

  const handleRemoveRepository = async (id: string) => {
    console.log('Removing repository:', id);
    try {
      await deleteMutation.mutateAsync(id);
      setScanResults(prev => prev.filter(scan => scan.repositoryId !== id));
    } catch (error) {
      console.error('Failed to remove repository:', error);
    }
  };

  const handleCleanupRepository = (id: string) => {
    const repo = repositories.find(r => r.id === id);
    if (!repo) return;
    
    // Only allow cleanup if there are selected commits
    if (selectedCommits.size === 0) {
      console.log('No commits selected for cleanup');
      return;
    }
    
    setSelectedRepository(repo);
    setCleanupDialogOpen(true);
  };

  const handleConfirmCleanup = async () => {
    if (!selectedRepository) return;
    
    console.log('Cleanup confirmed for:', selectedRepository.name);
    console.log('Selected commits:', Array.from(selectedCommits));
    
    try {
      // Send the selected commit SHAs to the cleanup endpoint
      const response = await apiRequest('POST', `/api/repositories/${selectedRepository.id}/cleanup`, {
        commitShas: Array.from(selectedCommits)
      });
      const result = await response.json();
      
      console.log('Cleanup result:', result);
      
      // Clear selections and close dialog
      setSelectedCommits(new Set());
      setCurrentCommits([]);
      setCleanupDialogOpen(false);
      setSelectedRepository(null);
      
      // Refresh the repositories list
      refetch();
    } catch (error) {
      console.error('Failed to cleanup repository:', error);
    }
  };

  const handleSelectAllCommits = (selected: boolean) => {
    if (selected) {
      setSelectedCommits(new Set(currentCommits.map(c => c.sha)));
    } else {
      setSelectedCommits(new Set());
    }
  };

  const handleSelectCommit = (sha: string, selected: boolean) => {
    const newSelected = new Set(selectedCommits);
    if (selected) {
      newSelected.add(sha);
    } else {
      newSelected.delete(sha);
    }
    setSelectedCommits(newSelected);
  };

  const totalRepositories = repositories.length;
  const needsCleanup = repositories.filter(r => r.status === "needs_cleanup").length;
  const cleanRepositories = repositories.filter(r => r.status === "clean").length;

  return (
    <div className="p-6 space-y-6" data-testid="page-repositories">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Repositories</h1>
          <p className="text-muted-foreground mt-1">
            Manage and clean up your GitHub repositories
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" data-testid="button-refresh" disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold" data-testid="stat-total-repos">{totalRepositories}</div>
          <div className="text-sm text-muted-foreground">Total Repositories</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-destructive" data-testid="stat-needs-cleanup">{needsCleanup}</div>
          <div className="text-sm text-muted-foreground">Need Cleanup</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600" data-testid="stat-clean-repos">{cleanRepositories}</div>
          <div className="text-sm text-muted-foreground">Clean Repositories</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-repositories"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
            data-testid="select-status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scanning">Scanning</option>
            <option value="clean">Clean</option>
            <option value="needs_cleanup">Needs Cleanup</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Scan Progress */}
      {scanResults.length > 0 && (
        <ScanProgress 
          scans={scanResults}
          onCancel={(repositoryId) => {
            setScanResults(prev => prev.filter(scan => scan.repositoryId !== repositoryId));
            // Note: Repository status will be updated when the query refetches
            refetch();
          }}
        />
      )}

      {/* Repository Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Repositories</h2>
            <Badge variant="outline">{filteredRepositories.length}</Badge>
          </div>
          <div className="space-y-4">
            {filteredRepositories.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repository={repo}
                onScan={handleScanRepository}
                onRemove={handleRemoveRepository}
                onCleanup={handleCleanupRepository}
              />
            ))}
          </div>
        </div>

        {/* Commit Preview */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Commit Preview</h2>
          <CommitPreview
            repositoryName={selectedRepository?.name || "Repository"}
            commits={currentCommits}
            selectedCommits={selectedCommits}
            onSelectAll={handleSelectAllCommits}
            onSelectCommit={handleSelectCommit}
          />
        </div>
      </div>

      {/* Cleanup Confirmation Dialog */}
      <CleanupConfirmation
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        repositoryName={selectedRepository?.name || ""}
        commitCount={selectedRepository?.replitCommitsFound || 0}
        onConfirm={handleConfirmCleanup}
      />
    </div>
  );
}