import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, Database, Eye, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

const AI_DATA_SHARED = [
  { label: "Usage patterns", description: "Anonymized interaction patterns to improve recommendations" },
  { label: "Preference signals", description: "Your stated preferences (never raw personal data)" },
  { label: "Aggregated metrics", description: "Statistical data combined with other users" },
];

const AITransparencyPage = () => {
  const { aiEnabled, toggleAI, consents } = useAuth();
  const aiConsent = consents.find((c) => c.type === "ai_processing");

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Transparency</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Understand and control how AI processes your data.
          </p>
        </div>

        {/* AI Status Card */}
        <Card className={aiEnabled ? "border-primary/30 bg-accent/20" : "border-border"}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Processing</CardTitle>
              </div>
              <Badge variant={aiEnabled ? "default" : "secondary"} className="text-xs">
                {aiEnabled ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Enabled</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Disabled</>
                )}
              </Badge>
            </div>
            <CardDescription>
              {aiEnabled
                ? "AI is currently processing your anonymized data to provide personalized features."
                : "AI processing is disabled. Your data is not being used by AI systems."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Enable AI Processing</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toggle to control whether AI systems can access your anonymized data
                </p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={toggleAI} />
            </div>
            {aiConsent && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Consent last updated: {new Date(aiConsent.updatedAt).toLocaleString("en-IN")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Data Shared with AI */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Data Shared with AI</CardTitle>
            </div>
            <CardDescription>Exactly what data AI models can access when enabled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_DATA_SHARED.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Badge variant={aiEnabled ? "default" : "secondary"} className="text-[10px] ml-auto shrink-0">
                  {aiEnabled ? "Shared" : "Not shared"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safeguards */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Privacy Safeguards</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                "Data is anonymized before AI processing — no raw PII is shared",
                "AI models do not store your individual data after processing",
                "You can disable AI processing at any time with immediate effect",
                "All AI processing complies with DPDP Act 2023 Section 8",
                "Regular audits ensure AI systems respect your consent boundaries",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AITransparencyPage;
