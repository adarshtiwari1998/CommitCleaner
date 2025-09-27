import { useState } from "react";
import { RepositoryCard, type Repository } from "@/components/RepositoryCard";
import { ScanProgress, type ScanResult } from "@/components/ScanProgress";
import { CommitPreview, type ReplitCommit } from "@/components/CommitPreview";
import { CleanupConfirmation } from "@/components/CleanupConfirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RefreshCw } from "lucide-react";

//todo: remove mock functionality - replace with real API calls
const mockRepositories: Repository[] = [
  {
    id: "1",
    name: "my-awesome-project",
    owner: "john-doe",
    url: "https://github.com/john-doe/my-awesome-project",
    status: "needs_cleanup",
    lastScanned: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replitCommitsFound: 5,
    private: false,
  },
  {
    id: "2",
    name: "private-repo",
    owner: "jane-smith", 
    url: "https://github.com/jane-smith/private-repo",
    status: "clean",
    lastScanned: new Date(Date.now() - 24 * 60 * 60 * 1000),
    replitCommitsFound: 0,
    private: true,
  },
  {
    id: "3",
    name: "team-project",
    owner: "dev-team",
    url: "https://github.com/dev-team/team-project",
    status: "pending",
    private: false,
  },
];

const mockCommits: ReplitCommit[] = [
  {
    sha: "abc123def456",
    message: "make careers header sticky and add partnership section to demo and login pages",
    author: "username",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isReplitGenerated: true,
    replitPrompt: "Add a sticky header to the careers page and include partnership information in the demo and login pages",
  },
  {
    sha: "def456ghi789", 
    message: "Replit Chatbox adf1be7",
    author: "username",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isReplitGenerated: true,
  },
];

export default function Repositories() {
  const [repositories, setRepositories] = useState<Repository[]>(mockRepositories);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
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

  const handleScanRepository = (id: string) => {
    const repo = repositories.find(r => r.id === id);
    if (!repo) return;

    console.log('Starting scan for repository:', repo.name);
    
    // Update repository status
    setRepositories(prev => prev.map(r => 
      r.id === id ? { ...r, status: "scanning" } : r
    ));

    // Add scan progress
    const scanResult: ScanResult = {
      repositoryId: id,
      repositoryName: repo.name,
      status: "scanning",
      progress: 0,
      replitCommitsFound: 0,
      totalCommitsScanned: 0,
    };
    
    setScanResults(prev => [...prev, scanResult]);

    // Simulate scanning progress
    //todo: remove mock functionality - replace with real scanning logic
    const interval = setInterval(() => {
      setScanResults(prev => prev.map(scan => {
        if (scan.repositoryId === id && scan.status === "scanning") {
          const newProgress = Math.min(scan.progress + 10, 100);
          const newCommitsScanned = Math.floor(newProgress * 1.2);
          const newReplitCommits = newProgress > 60 ? 5 : 0;
          
          if (newProgress === 100) {
            clearInterval(interval);
            
            // Update repository with final results
            setRepositories(prev => prev.map(r => 
              r.id === id ? { 
                ...r, 
                status: newReplitCommits > 0 ? "needs_cleanup" : "clean",
                lastScanned: new Date(),
                replitCommitsFound: newReplitCommits
              } : r
            ));
            
            return {
              ...scan,
              status: "completed",
              progress: 100,
              replitCommitsFound: newReplitCommits,
              totalCommitsScanned: newCommitsScanned,
            };
          }
          
          return {
            ...scan,
            progress: newProgress,
            totalCommitsScanned: newCommitsScanned,
            replitCommitsFound: newReplitCommits,
          };
        }
        return scan;
      }));
    }, 500);
  };

  const handleRemoveRepository = (id: string) => {
    console.log('Removing repository:', id);
    setRepositories(prev => prev.filter(r => r.id !== id));
    setScanResults(prev => prev.filter(scan => scan.repositoryId !== id));
  };

  const handleCleanupRepository = (id: string) => {
    const repo = repositories.find(r => r.id === id);
    if (!repo) return;
    
    setSelectedRepository(repo);
    setCleanupDialogOpen(true);
  };

  const handleConfirmCleanup = () => {
    if (!selectedRepository) return;
    
    console.log('Cleanup confirmed for:', selectedRepository.name);
    
    // Update repository status to processing
    setRepositories(prev => prev.map(r => 
      r.id === selectedRepository.id ? { ...r, status: "processing" } : r
    ));

    // Simulate cleanup process
    //todo: remove mock functionality - replace with real cleanup logic
    setTimeout(() => {
      setRepositories(prev => prev.map(r => 
        r.id === selectedRepository.id ? { 
          ...r, 
          status: "clean",
          replitCommitsFound: 0,
          lastScanned: new Date()
        } : r
      ));
    }, 3000);
  };

  const handleSelectAllCommits = (selected: boolean) => {
    if (selected) {
      setSelectedCommits(new Set(mockCommits.map(c => c.sha)));
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
        <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
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
            setRepositories(prev => prev.map(r => 
              r.id === repositoryId ? { ...r, status: "pending" } : r
            ));
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
            repositoryName="my-awesome-project"
            commits={mockCommits}
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