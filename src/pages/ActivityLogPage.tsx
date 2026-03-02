import { useState } from "react";
import { useAuth, ActivityEntry } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollText, LogIn, Shield, Pencil, Filter } from "lucide-react";

const TYPE_CONFIG: Record<ActivityEntry["type"], { icon: typeof LogIn; label: string; color: string }> = {
  login: { icon: LogIn, label: "Login", color: "bg-info/10 text-info" },
  consent_update: { icon: Shield, label: "Consent", color: "bg-primary/10 text-primary" },
  data_modification: { icon: Pencil, label: "Data Change", color: "bg-warning/10 text-warning" },
};

type FilterType = "all" | ActivityEntry["type"];

const ActivityLogPage = () => {
  const { activities } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "login", label: "Logins" },
    { key: "consent_update", label: "Consents" },
    { key: "data_modification", label: "Data Changes" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete history of logins, consent changes, and data modifications.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1.5 opacity-70">
                  ({activities.filter((a) => a.type === f.key).length})
                </span>
              )}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">History</CardTitle>
            </div>
            <CardDescription>{filtered.length} events found</CardDescription>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No activity found for this filter.</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />
                
                <div className="space-y-4">
                  {filtered.map((entry) => {
                    const config = TYPE_CONFIG[entry.type];
                    const Icon = config.icon;
                    return (
                      <div key={entry.id} className="flex items-start gap-4 relative">
                        <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{entry.description}</p>
                            <Badge variant="secondary" className="text-[10px] h-5 shrink-0">{config.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {new Date(entry.timestamp).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Activity logs are retained for 180 days as per DPDP Act compliance</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogPage;
