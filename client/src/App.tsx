import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import Repositories from "@/pages/Repositories";
import AddRepository from "@/pages/AddRepository";
import ActivityLogPage from "@/pages/ActivityLogPage";
import Settings from "@/pages/Settings";

function App() {
  const [activeView, setActiveView] = useState("repositories");

  const renderCurrentView = () => {
    switch (activeView) {
      case "repositories":
        return <Repositories />;
      case "add":
        return <AddRepository />;
      case "activity":
        return <ActivityLogPage />;
      case "settings":
        return <Settings />;
      default:
        return <Repositories />;
    }
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar activeView={activeView} onViewChange={setActiveView} />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  {renderCurrentView()}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
