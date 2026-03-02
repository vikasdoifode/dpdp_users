import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLogo } from "@/components/AuthLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, Mail } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-auth p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><AuthLogo /></div>
        </div>

        <Card className="border-surface-auth-muted bg-card/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{sent ? "Check your email" : "Reset Password"}</CardTitle>
            <CardDescription>
              {sent
                ? "We've sent a password reset link to your email address."
                : "Enter your email and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Didn't receive it? Check spam or <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button>.</p>
                <Link to="/login">
                  <Button variant="outline" className="w-full mt-2">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fp-email">Email</Label>
                  <Input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </Button>
                <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </form>
            )}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Your data is protected under DPDP Act 2023</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
