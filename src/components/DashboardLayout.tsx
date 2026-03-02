import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Shield, LayoutDashboard, Brain, ScrollText, LogOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Privacy Dashboard" },
  { to: "/shared-resources", icon: Share2, label: "Shared Resources" },
  { to: "/ai-transparency", icon: Brain, label: "AI Transparency" },
  { to: "/activity-log", icon: ScrollText, label: "Activity Log" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-card">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-base tracking-tight">
              DPDP<span className="text-primary">Guard</span>
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">DPDPGuard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Mobile Nav */}
        <nav className="md:hidden flex border-b bg-card overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
