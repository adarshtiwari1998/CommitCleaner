import { useState } from 'react';
import { CommitPreview, type ReplitCommit } from '../CommitPreview';

const sampleCommits: ReplitCommit[] = [
  {
    sha: "abc123def456",
    message: "make careers header sticky and add partnership section to demo and login pages",
    author: "username",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isReplitGenerated: true,
    replitPrompt: "Add a sticky header to the careers page and include partnership information in the demo and login pages",
  },
  {
    sha: "def456ghi789",
    message: "Replit Chatbox adf1be7",
    author: "username",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isReplitGenerated: true,
  },
  {
    sha: "ghi789jkl012",
    message: "Fix authentication bug",
    author: "developer",
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isReplitGenerated: false,
  },
];

export default function CommitPreviewExample() {
  const [selectedCommits, setSelectedCommits] = useState<Set<string>>(new Set());

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCommits(new Set(sampleCommits.filter(c => c.isReplitGenerated).map(c => c.sha)));
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

  return (
    <div className="p-6 max-w-2xl">
      <CommitPreview 
        repositoryName="awesome-project"
        commits={sampleCommits}
        selectedCommits={selectedCommits}
        onSelectAll={handleSelectAll}
        onSelectCommit={handleSelectCommit}
      />
    </div>
  );
}