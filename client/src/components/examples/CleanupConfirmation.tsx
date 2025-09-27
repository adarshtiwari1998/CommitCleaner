import { useState } from 'react';
import { CleanupConfirmation } from '../CleanupConfirmation';
import { Button } from '@/components/ui/button';

export default function CleanupConfirmationExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)} variant="destructive">
        Open Cleanup Confirmation
      </Button>
      
      <CleanupConfirmation
        open={open}
        onOpenChange={setOpen}
        repositoryName="my-awesome-project"
        commitCount={5}
      />
    </div>
  );
}