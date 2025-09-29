import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export interface GitHubRepositoryInfo {
  name: string;
  owner: string;
  private: boolean;
  url: string;
  default_branch: string;
}

export interface ReplitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export async function getRepositoryInfo(url: string): Promise<GitHubRepositoryInfo> {
  const client = await getUncachableGitHubClient();
  
  // Extract owner and repo from GitHub URL
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');
  
  try {
    const { data } = await client.rest.repos.get({
      owner,
      repo: repoName,
    });
    
    return {
      name: data.name,
      owner: data.owner.login,
      private: data.private,
      url: data.html_url,
      default_branch: data.default_branch
    };
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error('Repository not found or you do not have access to it');
    }
    throw new Error(`Failed to fetch repository: ${error.message}`);
  }
}

export async function scanForReplitCommits(url: string): Promise<ReplitCommit[]> {
  const client = await getUncachableGitHubClient();
  
  // Extract owner and repo from GitHub URL
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');
  
  try {
    // Get commits from the repository
    const { data: commits } = await client.rest.repos.listCommits({
      owner,
      repo: repoName,
      per_page: 100, // Get up to 100 recent commits
    });
    
    // Filter commits that might be from Replit
    const replitCommits: ReplitCommit[] = [];
    
    for (const commit of commits) {
      const message = commit.commit.message.toLowerCase();
      const authorEmail = commit.commit.author?.email?.toLowerCase() || '';
      const authorName = commit.commit.author?.name?.toLowerCase() || '';
      
      // Check for Replit-related patterns
      const hasReplitPattern = (
        message.includes('replit') ||
        message.includes('repl.it') ||
        message.includes('auto-save') ||
        message.includes('autosave') ||
        authorEmail.includes('replit') ||
        authorEmail.includes('repl.it') ||
        authorName.includes('replit') ||
        // Check for common Replit commit patterns
        message.match(/^(created|updated|modified|added|deleted)\s+.*\.(js|py|ts|html|css|json)$/i) ||
        message === 'initial commit' ||
        message === 'update' ||
        message === 'save' ||
        message.length < 10 // Very short commit messages often from auto-save
      );
      
      if (hasReplitPattern) {
        replitCommits.push({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date || '',
          url: commit.html_url
        });
      }
    }
    
    return replitCommits;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error('Repository not found or you do not have access to it');
    }
    throw new Error(`Failed to scan commits: ${error.message}`);
  }
}

export async function deleteReplitCommits(url: string, commitShas: string[]): Promise<void> {
  // Note: This is a destructive operation that requires careful implementation
  // For now, we'll throw an error indicating this feature needs to be implemented
  // with proper safety measures and user confirmation
  throw new Error('Commit deletion feature is not yet implemented for safety reasons. This would require git rebase operations that could damage repository history.');
}