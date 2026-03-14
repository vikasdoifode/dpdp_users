import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Download,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Scale,
  Lock,
  Eye,
  Database,
  RefreshCcw,
  Users,
  Building2,
  FileText,
  Gavel,
  History,
  Briefcase
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DashboardPage = () => {
  const { user, consents, updateProfile, updateConsent, requestDataExport, requestAccountDeletion } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });

  const handleSaveProfile = () => {
    updateProfile({ name: profileForm.name, phone: profileForm.phone });
    setEditingProfile(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out pb-20">

        {/* ─── HERO SECTION ─── */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-12 text-white shadow-2xl">
          {/* Decorative Secure Doodles */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Shield className="h-64 w-64 rotate-12" />
          </div>
          <div className="absolute -bottom-10 -left-10 opacity-5 pointer-events-none">
            <Lock className="h-48 w-48 -rotate-12" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary-foreground border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Compliance Overview
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Digital Personal Data Protection <span className="text-primary">(DPDP)</span> Act, 2023
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              India’s primary privacy law governing how personal data is collected, processed, and protected.
              DataKavatch ensures your data remains under your absolute control.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold">Citizen Protection</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold">Organizational Accountability</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold">Privacy Rights</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── KEY ROLES SECTION ─── */}
        <section className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2 mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">👤 Key Roles Defined</h2>
            <div className="h-1.5 w-20 bg-primary rounded-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Users, title: "Data Principal", desc: "The individual whose personal data is being collected.", example: "Example: You (the user)", color: "bg-blue-50 text-blue-600" },
              { icon: Building2, title: "Data Fiduciary", desc: "The entity determining how/why data is processed.", example: "Example: DataKavatch platform", color: "bg-primary/5 text-primary" },
              { icon: Briefcase, title: "Data Processor", desc: "Processes data on behalf of the Data Fiduciary.", example: "Example: Cloud hosting provider", color: "bg-blue-50 text-blue-600" },
            ].map((role, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-500 border-none bg-card rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                  <div className={`h-14 w-14 rounded-2xl ${role.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <role.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{role.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{role.desc}</p>
                  <Badge variant="secondary" className="bg-blue-100/50 text-blue-700 border-none font-bold text-[10px] uppercase tracking-wider">
                    {role.example}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── CORE PRINCIPLES (GRID CARDS) ─── */}
        <section className="space-y-8">
          <div className="flex flex-col items-center text-center space-y-2 mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">🔐 Core Principles</h2>
            <p className="text-slate-500 max-w-xl">Foundational rules that every organization must follow under DPDP Law.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: "1", title: "Consent-Based", desc: "Collected only with clear, informed consent. Must be unambiguous and revocable.", icon: CheckCircle2 },
              { id: "2", title: "Purpose Limitation", desc: "Data must be used only for the purpose stated at core collection.", icon: Eye },
              { id: "3", title: "Data Minimization", desc: "Collect only necessary data. No excess storage of sensitive info.", icon: Database },
              { id: "4", title: "Storage Limitation", desc: "Data must not be stored longer than required for the specific purpose.", icon: History },
              { id: "5", title: "Accuracy", desc: "Data must be accurate and up-to-date at all points of processing.", icon: RefreshCcw },
              { id: "6", title: "Security Safeguards", desc: "Implementation of reasonable security measures to prevent data breaches.", icon: Lock },
            ].map((p, i) => (
              <div key={i} className="relative group p-8 rounded-[2rem] bg-blue-50/40 border border-blue-100/50 hover:bg-card hover:shadow-xl transition-all duration-500">
                <div className="absolute top-4 right-6 text-4xl font-black text-slate-200 group-hover:text-primary/10 transition-colors">
                  {p.id}
                </div>
                <p.icon className="h-10 w-10 text-primary mb-6" />
                <h4 className="text-lg font-bold text-slate-800 mb-2">{p.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DATA RIGHTS & REGULATORY ─── */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* Rights of Data Principals */}
          <Card className="col-span-full lg:col-span-2 rounded-[2.5rem] border-none bg-card shadow-xl overflow-hidden">
            <CardHeader className="p-10 pb-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">⚖️ Rights of Data Principals</CardTitle>
                  <CardDescription>Your legal empowerment under the DPDP Act</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Right to access personal data",
                "Right to correction & erasure",
                "Right to grievance redressal",
                "Right to nominate another person"
              ].map((right, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 group hover:border-primary/20 transition-all">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-700">{right}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Regulatory Authority */}
          <Card className="rounded-[2.5rem] border-none bg-slate-900 shadow-xl overflow-hidden text-white relative">
            {/* Doodle */}
            <Gavel className="absolute -bottom-10 -right-10 h-40 w-40 text-white/5 opacity-10 rotate-12" />

            <CardHeader className="p-8">
              <div className="h-12 w-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-black tracking-tight">🏛 Regulatory Authority</CardTitle>
              <CardDescription className="text-slate-400">Data Protection Board of India</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="space-y-2">
                {["Complaints Management", "Investigations", "Penalty Enforcement"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {item}
                  </div>
                ))}
              </div>
              <Separator className="bg-white/10" />
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-wider">Major Penalties</span>
                </div>
                <p className="text-xl font-black text-white">₹250 Crore</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Maximum per violation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── SECURITY FOOTER ─── */}
        <div className="text-center space-y-4 pt-10">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-100 rounded-full border border-slate-200 hover:scale-105 transition-transform cursor-help group">
            <Lock className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-slate-600 tracking-tight">Secure & Audited Interface by DataKavatch Sentinel</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed italic">
            "Your data, your rules. DataKavatch leverages high-entropy encryption to protect your digital identity across all shared platforms."
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
