import { RepositoryCard, type Repository } from '../RepositoryCard';

const sampleRepositories: Repository[] = [
  {
    id: "1",
    name: "my-awesome-project",
    owner: "john-doe",
    url: "https://github.com/john-doe/my-awesome-project",
    status: "needs_cleanup",
    lastScanned: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    replitCommitsFound: 5,
    private: false,
  },
  {
    id: "2",
    name: "private-repo",
    owner: "jane-smith",
    url: "https://github.com/jane-smith/private-repo",
    status: "clean",
    lastScanned: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    replitCommitsFound: 0,
    private: true,
  },
  {
    id: "3",
    name: "scanning-repo",
    owner: "dev-team",
    url: "https://github.com/dev-team/scanning-repo",
    status: "scanning",
    private: false,
  },
];

export default function RepositoryCardExample() {
  return (
    <div className="p-6 space-y-4 max-w-md">
      {sampleRepositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  );
}