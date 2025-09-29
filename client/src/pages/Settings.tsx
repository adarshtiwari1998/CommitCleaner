import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Github, 
  Shield, 
  Bell, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface GitHubStatus {
  connected: boolean;
  username?: string;
  name?: string;
  avatar?: string;
  permissions?: string[];
  error?: string;
  authMethod?: 'replit' | 'token' | null;
  isReplitEnvironment?: boolean;
  hasEnvironmentToken?: boolean;
}

export default function Settings() {
  // Fetch real GitHub connection status
  const { data: githubStatus, isLoading: isLoadingGithub } = useQuery<GitHubStatus>({
    queryKey: ['/api/github/status'],
  });
  const [autoBackup, setAutoBackup] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [batchSize, setBatchSize] = useState("10");
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    console.log('Saving settings:', {
      autoBackup,
      notifications,
      batchSize,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDisconnectGithub = () => {
    console.log('Disconnecting GitHub account');
    if (githubStatus?.authMethod === 'replit') {
      alert('GitHub disconnection must be done through Replit Settings');
    } else {
      alert('To disconnect, remove the GITHUB_TOKEN environment variable from your deployment settings');
    }
  };

  const handleConnectGithub = () => {
    console.log('Connecting GitHub account');
    if (githubStatus?.isReplitEnvironment) {
      alert('GitHub connection must be set up through Replit Connectors');
    } else {
      alert('For production deployment, set GITHUB_TOKEN or GITHUB_PERSONAL_ACCESS_TOKEN environment variable with your GitHub Personal Access Token');
    }
  };

  const handleClearAllData = () => {
    console.log('Clearing all application data');
    // This would show a confirmation dialog in real implementation
    alert('This would clear all application data. Feature not implemented in demo.');
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-settings">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your Git cleanup preferences and account settings
        </p>
      </div>

      {saved && (
        <Alert data-testid="alert-settings-saved">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-muted-foreground">
                  {isLoadingGithub ? 'Checking connection...' : 
                   githubStatus?.connected ? 'Connected to GitHub account' : 'Not connected'}
                </p>
              </div>
              <Badge variant={githubStatus?.connected ? "secondary" : "destructive"} data-testid="badge-github-status">
                {isLoadingGithub ? 'Loading...' : 
                 githubStatus?.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            {githubStatus?.connected ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Account: <span className="font-mono">{githubStatus.username || 'Unknown'}</span></p>
                  <p>Permissions: {githubStatus.permissions?.join(', ') || 'Repository access, User info'}</p>
                  <p>Auth Method: 
                    <Badge variant="outline" className="ml-2 text-xs">
                      {githubStatus.authMethod === 'replit' ? 'Replit Connector' : 'Personal Access Token'}
                    </Badge>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDisconnectGithub}
                  data-testid="button-disconnect-github"
                >
                  Disconnect GitHub
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {githubStatus?.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Connection Error:</strong> {githubStatus.error}
                      {githubStatus?.isReplitEnvironment && !githubStatus?.hasEnvironmentToken && (
                        <div className="mt-2">
                          <p>You're in a Replit environment. Click "Connect GitHub Account" to set up the integration.</p>
                        </div>
                      )}
                      {!githubStatus?.isReplitEnvironment && !githubStatus?.hasEnvironmentToken && (
                        <div className="mt-2">
                          <p>For production deployment, you need to set a <code className="text-xs bg-muted px-1 rounded">GITHUB_TOKEN</code> environment variable with your Personal Access Token.</p>
                          <a 
                            href="https://github.com/settings/tokens" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            Create Personal Access Token <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <Button 
                  onClick={handleConnectGithub}
                  data-testid="button-connect-github"
                  disabled={isLoadingGithub}
                >
                  <Github className="h-4 w-4 mr-2" />
                  {isLoadingGithub ? 'Checking...' : 'Connect GitHub Account'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Create backups before any destructive operations
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
                data-testid="switch-auto-backup"
              />
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended:</strong> Keep automatic backups enabled to protect your repository history.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about scan results and cleanup operations
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Processing Size</Label>
              <Input
                id="batch-size"
                type="number"
                min="1"
                max="50"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                data-testid="input-batch-size"
              />
              <p className="text-sm text-muted-foreground">
                Number of repositories to process simultaneously (1-50)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium">Clear Application Data</p>
                <p className="text-sm text-muted-foreground">
                  Remove all repository data and activity logs from this application
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleClearAllData}
                data-testid="button-clear-data"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" asChild data-testid="button-documentation">
                <a href="#" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Documentation
                </a>
              </Button>
              <Button variant="outline" asChild data-testid="button-github-issues">
                <a href="#" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  Report Issues
                </a>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Version: 1.0.0</p>
              <p>Built with React + Vite</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} data-testid="button-save-settings">
          Save Settings
        </Button>
      </div>
    </div>
  );
}