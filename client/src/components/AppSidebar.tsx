import { GitBranch, Plus, Activity, Settings, Github } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

interface AppSidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

const menuItems = [
  {
    title: "Repositories",
    url: "repositories",
    icon: GitBranch,
  },
  {
    title: "Add Repository",
    url: "add",
    icon: Plus,
  },
  {
    title: "Activity Log",
    url: "activity",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
];

export function AppSidebar({ activeView = "repositories", onViewChange }: AppSidebarProps) {
  const handleViewChange = (view: string) => {
    console.log('View change:', view);
    onViewChange?.(view);
  };

  return (
    <Sidebar data-testid="sidebar-app">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Github className="h-6 w-6 text-primary" />
          <div>
            <h2 className="font-medium">Git Cleanup</h2>
            <p className="text-xs text-muted-foreground">Replit Commit Remover</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={activeView === item.url}
                    data-testid={`button-nav-${item.url}`}
                  >
                    <button onClick={() => handleViewChange(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}