import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";

interface AddRepositoryFormProps {
  onAdd?: (url: string) => void;
  isLoading?: boolean;
}

export function AddRepositoryForm({ onAdd, isLoading = false }: AddRepositoryFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateGitHubUrl = (url: string): boolean => {
    const githubUrlPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Repository URL is required");
      return;
    }

    if (!validateGitHubUrl(url.trim())) {
      setError("Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)");
      return;
    }

    console.log('Add repository triggered:', url);
    onAdd?.(url.trim());
    setUrl("");
  };

  return (
    <Card data-testid="form-add-repository">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Repository
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">GitHub Repository URL</Label>
            <Input
              id="repo-url"
              type="url"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              data-testid="input-repository-url"
            />
          </div>
          
          {error && (
            <Alert variant="destructive" data-testid="alert-repository-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            data-testid="button-add-repository"
          >
            {isLoading ? "Adding..." : "Add Repository"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}