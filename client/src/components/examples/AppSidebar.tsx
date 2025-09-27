import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '../ThemeProvider';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ThemeProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
            <p className="text-muted-foreground">
              This is where the main application content would be displayed.
            </p>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}