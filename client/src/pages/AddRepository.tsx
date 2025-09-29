import { useState } from "react";
import { AddRepositoryForm } from "@/components/AddRepositoryForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Github, Shield, Zap, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AddRepository() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddRepository = async (url: string) => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      console.log('Adding repository:', url);
      
      const response = await apiRequest('POST', '/api/repositories', { url });
      const repository = await response.json();

      setSuccessMessage(`Repository ${repository.owner}/${repository.name} has been added successfully!`);
    } catch (error: any) {
      console.error('Failed to add repository:', error);
      setErrorMessage(error.message || 'Failed to add repository');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Seamlessly connect with your GitHub repositories using secure OAuth authentication.",
    },
    {
      icon: Zap,
      title: "Automated Detection",
      description: "Automatically identify Replit-generated commits using advanced pattern recognition.",
    },
    {
      icon: Shield,
      title: "Safe Operations", 
      description: "Built-in backup creation and confirmation dialogs protect your repository history.",
    },
    {
      icon: CheckCircle,
      title: "Batch Processing",
      description: "Clean multiple repositories efficiently with bulk selection and processing.",
    },
  ];

  return (
    <div className="p-6 space-y-6" data-testid="page-add-repository">
      <div>
        <h1 className="text-3xl font-bold">Add Repository</h1>
        <p className="text-muted-foreground mt-1">
          Connect your GitHub repositories to start cleaning up Replit-generated commits
        </p>
      </div>

      {successMessage && (
        <Alert data-testid="alert-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" data-testid="alert-error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AddRepositoryForm onAdd={handleAddRepository} isLoading={isLoading} />
          
          <Alert data-testid="alert-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This tool performs destructive operations on Git history. 
              Always ensure you have backups and coordinate with your team before cleanup.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">1</Badge>
                  <div>
                    <p className="font-medium">Add Repository</p>
                    <p className="text-sm text-muted-foreground">
                      Enter your GitHub repository URL to connect it to the cleanup system.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">2</Badge>
                  <div>
                    <p className="font-medium">Scan for Replit Commits</p>
                    <p className="text-sm text-muted-foreground">
                      Our system analyzes your commit history to identify Replit-generated messages.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">3</Badge>
                  <div>
                    <p className="font-medium">Review and Select</p>
                    <p className="text-sm text-muted-foreground">
                      Review detected commits and choose which ones to remove from your history.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="mt-1">4</Badge>
                  <div>
                    <p className="font-medium">Safe Cleanup</p>
                    <p className="text-sm text-muted-foreground">
                      Automated backup creation and Git history rewriting with safety confirmations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <feature.icon className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}