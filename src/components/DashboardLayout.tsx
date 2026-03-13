import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  LayoutDashboard,
  Brain,
  ScrollText,
  LogOut,
  Share2,
  User,
  ShieldAlert,
  Settings,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/Branding";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Privacy Dashboard" },
  { to: "/shared-resources", icon: Share2, label: "Shared Resources" },
  { to: "/ai-transparency", icon: Brain, label: "AI Transparency" },
  { to: "/risk-score", icon: ShieldAlert, label: "Risk Score" },
  { to: "/activity-log", icon: ScrollText, label: "Activity Log" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, consents, updateConsent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-32">
      {/* ─── PREMIUM TOP HEADER ─── */}
      <header className="sticky top-0 z-50 h-16 border-b bg-blue-50/80 backdrop-blur-xl flex items-center px-6 md:px-10 justify-between shrink-0">
        <Logo
          className="cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-800">{user?.name}</span>
            <span className="text-[10px] font-medium text-slate-500">{user?.email}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-10 w-10 rounded-full bg-white border-2 border-primary/20 shadow-sm flex items-center justify-center overflow-hidden hover:scale-110 transition-transform cursor-pointer">
                <User className="h-5 w-5 text-slate-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 rounded-[1.5rem] mt-2 shadow-2xl border-blue-100 bg-blue-50/95 backdrop-blur-xl animate-in fade-in zoom-in-95" align="end">
              <DropdownMenuLabel className="px-4 py-3">
                <p className="text-sm font-black text-slate-800">{user?.name}</p>
                <p className="text-[10px] font-medium text-slate-400">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-2 bg-blue-100/50" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate("/user-consents")}
                  className="rounded-xl px-4 py-3 text-slate-700 focus:bg-primary/10 focus:text-primary transition-all duration-300 cursor-pointer justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black tracking-tight">User Consents</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="mx-2 bg-blue-100/50" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-xl px-4 py-2 text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-bold">Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
        {children}
      </main>

      {/* ─── POPPING HALF-CIRCLE NAVIGATION ─── */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <TooltipProvider delayDuration={0}>
          <nav className="relative flex items-center gap-2 p-2 rounded-[2rem] bg-blue-50/90 backdrop-blur-md border border-blue-100/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] ring-1 ring-primary/5 animate-in slide-in-from-bottom-12 duration-700 pointer-events-auto overflow-visible group/nav-container">

            {/* ─── OCEAN WAVE BACKGROUND (Restricted to bar) ─── */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 rounded-[2rem] overflow-hidden">
              <div className="water-wave water-wave-1"></div>
            </div>

            {/* ─── NAV ITEMS ─── */}
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      className="relative z-10 h-14 w-16 transition-all duration-500 group"
                    >
                      {/* The "Popping" Circle Background - Show only on Hover */}
                      <div className={`absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-full bg-blue-50 border border-blue-100 shadow-[0_-12px_24px_rgba(0,0,0,0.06)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] scale-0 group-hover:scale-100`} />

                      {/* The Icon Container - Shifted 3px right for absolute optical balance */}
                      <div className={`absolute left-1/2 -translate-x-1/2 ml-[3px] top-2 z-20 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-8 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 group-hover:bg-blue-50 group-hover:text-primary group-hover:shadow-md'}`}>
                        <item.icon className={`h-6 w-6 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                      </div>

                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest border-none py-1.5 px-3 rounded-lg mb-8 shadow-2xl animate-in slide-in-from-bottom-2">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .water-wave {
          position: absolute;
          bottom: 0;
          left: -100%;
          width: 400%;
          height: 100%;
          background-repeat: repeat-x;
        }

        .water-wave-1 {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,52.43,56.28,28.27,117.83,43.48,180.6,40.39,77.37-3.81,148.59-33.16,220.3-42,52.88-6.53,103.54,4.28,150.3,28.87V0Z" fill="%233b82f6" opacity="0.1"/></svg>');
          animation: wave 15s linear infinite;
        }

        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(25%); }
        }
      `}} />
    </div>
  );
};

export default DashboardLayout;
