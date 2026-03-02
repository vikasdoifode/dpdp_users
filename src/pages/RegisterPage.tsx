import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthLogo } from "@/components/AuthLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, UserPlus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConsentItem {
  key: string;
  label: string;
  description: string;
  required: boolean;
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    key: "data_storage",
    label: "Data Storage Consent",
    description: "I consent to the storage of my personal data as described in the Privacy Policy, in compliance with DPDP Act Section 8.",
    required: true,
  },
  {
    key: "ai_processing",
    label: "AI Processing Consent",
    description: "I consent to having my anonymized data processed by AI systems for personalized recommendations.",
    required: false,
  },
  {
    key: "analytics",
    label: "Analytics Consent",
    description: "I consent to the collection of anonymized usage analytics to improve platform services.",
    required: false,
  },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({ data_storage: false, ai_processing: false, analytics: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleConsent = (key: string) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!consents.data_storage) {
      setError("Data Storage consent is mandatory to create an account.");
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, consents });
      navigate("/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-auth p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <AuthLogo />
          </div>
          <p className="text-surface-auth-foreground/70 text-sm">Create your privacy-protected account</p>
        </div>

        <Card className="border-surface-auth-muted bg-card/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>We only collect what's necessary</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 border border-destructive/20">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input id="reg-password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required autoComplete="new-password" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Hide password" : "Show password"}>
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Consent Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Consent Preferences</span>
                </div>
                <p className="text-xs text-muted-foreground">As per the DPDP Act 2023, we require your explicit consent. You can change these anytime.</p>
                
                {CONSENT_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={consents[item.key]}
                      onCheckedChange={() => toggleConsent(item.key)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.required && (
                          <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">Required</span>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">{item.description}</TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Create Account
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
