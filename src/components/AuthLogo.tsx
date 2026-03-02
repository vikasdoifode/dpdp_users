import { Shield } from "lucide-react";

export const AuthLogo = () => (
  <div className="flex items-center gap-2.5 mb-2">
    <div className="relative">
      <Shield className="h-8 w-8 text-primary animate-shield-pulse" />
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
    </div>
    <span className="text-xl font-bold tracking-tight text-foreground">
      DPDP<span className="text-primary">Guard</span>
    </span>
  </div>
);
