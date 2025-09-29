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

export async function cleanReplitCommitMessages(url: string, commitShas: string[]): Promise<{ cleanedCount: number; errors: string[] }> {
  const client = await getUncachableGitHubClient();
  
  // Extract owner and repo from GitHub URL
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format');
  }
  
  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');
  
  try {
    const errors: string[] = [];
    let cleanedCount = 0;
    
    console.log('🧹 Starting commit message cleanup - removing Replit auto-generated text...');
    
    // Step 1: Get repository info to find the default branch
    const { data: repoInfo } = await client.rest.repos.get({
      owner,
      repo: repoName,
    });
    const defaultBranch = repoInfo.default_branch;
    
    // Step 2: Get ALL commits on the default branch (up to 500 commits)
    const allCommits: any[] = [];
    let page = 1;
    const perPage = 100;
    
    while (allCommits.length < 500) { // Safety limit to prevent infinite loop
      const { data: commits } = await client.rest.repos.listCommits({
        owner,
        repo: repoName,
        sha: defaultBranch,
        per_page: perPage,
        page: page,
      });
      
      if (commits.length === 0) break;
      allCommits.push(...commits);
      
      // If we got all the commits we need, break
      if (commitShas.every(sha => allCommits.some(c => c.sha === sha))) {
        break;
      }
      
      page++;
    }
    
    // Step 3: Verify all target commits are found
    const missingCommits = commitShas.filter(sha => !allCommits.some(c => c.sha === sha));
    if (missingCommits.length > 0) {
      throw new Error(`Target commits not found in recent history: ${missingCommits.join(', ')}`);
    }
    
    // Step 4: Build the new commit chain from oldest to newest
    console.log(`📋 Processing ${allCommits.length} commits to rebuild chain...`);
    
    // Reverse to start from oldest commit
    const commitsToProcess = allCommits.reverse();
    let currentSha = '';
    
    for (let i = 0; i < commitsToProcess.length; i++) {
      const commit = commitsToProcess[i];
      const isTargetCommit = commitShas.includes(commit.sha);
      
      if (isTargetCommit) {
        try {
          // Get the full commit details
          const { data: fullCommit } = await client.rest.repos.getCommit({
            owner,
            repo: repoName,
            ref: commit.sha,
          });
          
          // Clean the commit message
          const cleanedMessage = cleanCommitMessage(fullCommit.commit.message);
          
          if (cleanedMessage !== fullCommit.commit.message) {
            console.log(`🧹 Cleaning commit ${commit.sha.substring(0, 8)}: "${fullCommit.commit.message.substring(0, 50)}..."`);
            console.log(`✨ Cleaned to: "${cleanedMessage.substring(0, 50)}..."`);
            
            // Create new commit with cleaned message
            const { data: newCommit } = await client.rest.git.createCommit({
              owner,
              repo: repoName,
              message: cleanedMessage,
              tree: fullCommit.commit.tree.sha,
              parents: currentSha ? [currentSha] : [], // Chain to previous commit or make it root
              author: {
                name: fullCommit.commit.author?.name || 'Unknown',
                email: fullCommit.commit.author?.email || 'unknown@example.com',
                date: fullCommit.commit.author?.date || new Date().toISOString()
              },
              committer: {
                name: fullCommit.commit.committer?.name || 'Unknown',
                email: fullCommit.commit.committer?.email || 'unknown@example.com',
                date: new Date().toISOString() // Use current time for committer
              }
            });
            
            currentSha = newCommit.sha;
            cleanedCount++;
          } else {
            // Message doesn't need cleaning, but still need to recreate to maintain chain
            const { data: newCommit } = await client.rest.git.createCommit({
              owner,
              repo: repoName,
              message: fullCommit.commit.message,
              tree: fullCommit.commit.tree.sha,
              parents: currentSha ? [currentSha] : [],
              author: {
                name: fullCommit.commit.author?.name || 'Unknown',
                email: fullCommit.commit.author?.email || 'unknown@example.com',
                date: fullCommit.commit.author?.date || new Date().toISOString()
              },
              committer: {
                name: fullCommit.commit.committer?.name || 'Unknown',
                email: fullCommit.commit.committer?.email || 'unknown@example.com',
                date: fullCommit.commit.committer?.date || new Date().toISOString()
              }
            });
            
            currentSha = newCommit.sha;
          }
          
        } catch (error: any) {
          console.error(`Failed to process commit ${commit.sha}:`, error);
          errors.push(`Failed to process commit ${commit.sha}: ${error.message}`);
          throw error; // Don't continue with broken chain
        }
      } else {
        // Not a target commit, still need to recreate to maintain chain integrity
        try {
          const { data: fullCommit } = await client.rest.repos.getCommit({
            owner,
            repo: repoName,
            ref: commit.sha,
          });
          
          const { data: newCommit } = await client.rest.git.createCommit({
            owner,
            repo: repoName,
            message: fullCommit.commit.message,
            tree: fullCommit.commit.tree.sha,
            parents: currentSha ? [currentSha] : [],
            author: {
              name: fullCommit.commit.author?.name || 'Unknown',
              email: fullCommit.commit.author?.email || 'unknown@example.com',
              date: fullCommit.commit.author?.date || new Date().toISOString()
            },
            committer: {
              name: fullCommit.commit.committer?.name || 'Unknown',
              email: fullCommit.commit.committer?.email || 'unknown@example.com',
              date: fullCommit.commit.committer?.date || new Date().toISOString()
            }
          });
          
          currentSha = newCommit.sha;
          
        } catch (error: any) {
          console.error(`Failed to recreate commit ${commit.sha}:`, error);
          errors.push(`Failed to recreate commit ${commit.sha}: ${error.message}`);
          throw error;
        }
      }
    }
    
    // Step 5: Update the branch to point to the new chain head
    if (currentSha) {
      try {
        console.log(`📌 Updating ${defaultBranch} branch to point to new commit chain head: ${currentSha}`);
        
        await client.rest.git.updateRef({
          owner,
          repo: repoName,
          ref: `heads/${defaultBranch}`,
          sha: currentSha,
          force: true
        });
        
        console.log(`✅ Successfully cleaned ${cleanedCount} commit messages out of ${allCommits.length} total commits!`);
        console.log(`⚠️  Note: History was rewritten. All collaborators should pull the changes.`);
        
      } catch (error: any) {
        console.error('Failed to update branch:', error);
        throw new Error(`Processed ${cleanedCount} commits but failed to update branch: ${error.message}`);
      }
    }
    
    return {
      cleanedCount,
      errors
    };
    
  } catch (error: any) {
    console.error('Commit message cleanup failed:', error);
    throw new Error(`Failed to clean commit messages: ${error.message}`);
  }
}

function cleanCommitMessage(originalMessage: string): string {
  // Remove Replit auto-generated text patterns
  let cleaned = originalMessage;
  
  // Remove Replit metadata patterns
  const replitPatterns = [
    /Replit-Commit-Author:.*?\n?/gi,
    /Replit-Commit-Session-Id:.*?\n?/gi,
    /Replit-Commit-Checkpoint-Type:.*?\n?/gi,
    /Replit Prompt:.*?\n?/gi,
    /Auto-generated by Replit.*?\n?/gi,
    /\n\s*\n\s*\n/g, // Remove multiple empty lines
  ];
  
  for (const pattern of replitPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Clean up extra whitespace and newlines
  cleaned = cleaned.trim();
  
  // If the message became empty or too short, provide a default
  if (!cleaned || cleaned.length < 5) {
    cleaned = 'Updated files'; // Basic fallback message
  }
  
  return cleaned;
}