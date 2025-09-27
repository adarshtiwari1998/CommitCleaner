import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Users, RotateCcw } from "lucide-react";

interface CleanupConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repositoryName: string;
  commitCount: number;
  onConfirm?: () => void;
}

export function CleanupConfirmation({
  open,
  onOpenChange,
  repositoryName,
  commitCount,
  onConfirm
}: CleanupConfirmationProps) {
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [teamNotified, setTeamNotified] = useState(false);
  const [consequencesUnderstood, setConsequencesUnderstood] = useState(false);

  const allChecked = backupConfirmed && teamNotified && consequencesUnderstood;

  const handleConfirm = () => {
    if (!allChecked) return;
    console.log('Cleanup confirmed for:', repositoryName);
    onConfirm?.();
    onOpenChange(false);
    // Reset checkboxes for next time
    setBackupConfirmed(false);
    setTeamNotified(false);
    setConsequencesUnderstood(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset checkboxes
    setBackupConfirmed(false);
    setTeamNotified(false);
    setConsequencesUnderstood(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl" data-testid="dialog-cleanup-confirmation">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirm Destructive Operation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            You are about to permanently remove <Badge variant="destructive">{commitCount} commits</Badge> from{" "}
            <span className="font-medium">{repositoryName}</span>. This operation cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will rewrite Git history and require force-pushing to the remote repository.
              All collaborators will need to re-clone or reset their local repositories.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h4 className="font-medium">Before proceeding, please confirm:</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="backup-confirmed"
                  checked={backupConfirmed}
                  onCheckedChange={(checked) => setBackupConfirmed(checked === true)}
                  data-testid="checkbox-backup-confirmed"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="backup-confirmed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    I have created a backup of this repository
                  </label>
                  <p className="text-xs text-muted-foreground">
                    A backup ensures you can restore the original state if needed
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="team-notified"
                  checked={teamNotified}
                  onCheckedChange={(checked) => setTeamNotified(checked === true)}
                  data-testid="checkbox-team-notified"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="team-notified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    I have notified all team members about this operation
                  </label>
                  <p className="text-xs text-muted-foreground">
                    All collaborators must re-clone after history rewrite
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consequences-understood"
                  checked={consequencesUnderstood}
                  onCheckedChange={(checked) => setConsequencesUnderstood(checked === true)}
                  data-testid="checkbox-consequences-understood"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="consequences-understood" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    I understand this operation is irreversible
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Once history is rewritten and force-pushed, it cannot be undone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} data-testid="button-cancel-cleanup">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!allChecked}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-cleanup"
          >
            Proceed with Cleanup
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}