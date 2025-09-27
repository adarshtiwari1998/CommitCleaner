import { ThemeProvider } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-6 space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Theme Provider Test</h3>
          <p className="text-muted-foreground mb-4">
            This component provides theme context for the entire application.
          </p>
          <Button>Sample Button</Button>
        </Card>
      </div>
    </ThemeProvider>
  );
}