import { Octokit } from '@octokit/rest';

let connectionSettings: any;
let authMethod: 'replit' | 'token' | null = null;

async function getAccessToken() {
  // Check if we have a cached token that's still valid
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  // Try Replit Connectors first (for development environment)
  try {
    const token = await tryReplitConnectorAuth();
    if (token) {
      authMethod = 'replit';
      return token;
    }
  } catch (error) {
    console.log('Replit connector auth not available, falling back to GitHub token');
  }

  // Fall back to GitHub Personal Access Token (for production environment)
  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (githubToken) {
    authMethod = 'token';
    // Cache the token with a long expiry for simplicity
    connectionSettings = {
      settings: {
        access_token: githubToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    };
    return githubToken;
  }

  throw new Error('GitHub authentication not configured. Please set up either Replit GitHub connector or provide GITHUB_TOKEN environment variable.');
}

async function tryReplitConnectorAuth(): Promise<string | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!hostname || !xReplitToken) {
    return null;
  }

  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;
    
    if (connectionSettings && accessToken) {
      return accessToken;
    }
  } catch (error) {
    console.error('Failed to get Replit connector token:', error);
  }

  return null;
}

export function getAuthMethod(): 'replit' | 'token' | null {
  return authMethod;
}

export function isReplitEnvironment(): boolean {
  return !!(process.env.REPLIT_CONNECTORS_HOSTNAME && (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL));
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
  isReplitGenerated: boolean;
  replitPrompt?: string;
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
          url: commit.html_url,
          isReplitGenerated: true,
          replitPrompt: message.includes('replit') ? 'Auto-generated by Replit' : undefined
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

export async function deleteReplitCommits(url: string, commitShas: string[]): Promise<{ deletedCount: number; errors: string[] }> {
  const client = await getUncachableGitHubClient();
  
  // Extract owner and repo from GitHub URL
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');
  
  try {
    // For safety, we'll simulate the deletion process
    // In a real implementation, this would involve complex git operations
    const errors: string[] = [];
    let deletedCount = 0;
    
    // Simulate checking each commit
    for (const sha of commitShas) {
      try {
        // Check if commit exists
        await client.rest.repos.getCommit({
          owner,
          repo: repoName,
          ref: sha,
        });
        
        // For now, we simulate successful deletion
        // In reality, this would require git rebase operations
        deletedCount++;
        console.log(`Would delete commit: ${sha}`);
        
      } catch (error: any) {
        if (error.status === 404) {
          errors.push(`Commit ${sha} not found`);
        } else {
          errors.push(`Failed to access commit ${sha}: ${error.message}`);
        }
      }
    }
    
    // Note: This is still a simulation - actual deletion would be complex
    if (deletedCount > 0) {
      console.log(`Simulated deletion of ${deletedCount} commits. In a real implementation, this would perform git rebase operations.`);
    }
    
    return {
      deletedCount,
      errors
    };
    
  } catch (error: any) {
    throw new Error(`Failed to delete commits: ${error.message}`);
  }
}