import { ScanProgress, type ScanResult } from '../ScanProgress';

const sampleScans: ScanResult[] = [
  {
    repositoryId: "1",
    repositoryName: "awesome-project",
    status: "scanning",
    progress: 65,
    replitCommitsFound: 3,
    totalCommitsScanned: 45,
  },
  {
    repositoryId: "2",
    repositoryName: "completed-scan",
    status: "completed",
    progress: 100,
    replitCommitsFound: 7,
    totalCommitsScanned: 120,
  },
  {
    repositoryId: "3",
    repositoryName: "error-repo",
    status: "error",
    progress: 0,
    replitCommitsFound: 0,
    totalCommitsScanned: 0,
    error: "Repository not found or access denied",
  },
];

export default function ScanProgressExample() {
  return (
    <div className="p-6 max-w-2xl">
      <ScanProgress scans={sampleScans} />
    </div>
  );
}