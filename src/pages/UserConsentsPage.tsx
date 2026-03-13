import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    Brain,
    BarChart3,
    Database,
    Lock,
    History,
    Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const UserConsentsPage = () => {
    const { consents, updateConsent } = useAuth();

    const getIcon = (type: string) => {
        switch (type) {
            case "data_storage": return Database;
            case "ai_processing": return Brain;
            case "analytics": return BarChart3;
            default: return ShieldCheck;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "data_storage": return "bg-blue-50 text-blue-600 border-blue-100";
            case "ai_processing": return "bg-purple-50 text-purple-600 border-purple-100";
            case "analytics": return "bg-amber-50 text-amber-600 border-amber-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">

                {/* Header Section */}
                <div className="flex flex-col items-center text-center space-y-4 mb-12">
                    <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-2 shadow-inner">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Consent Management</h1>
                    <p className="text-slate-500 max-w-lg leading-relaxed">
                        As a <span className="font-bold text-slate-700 underline decoration-primary/30 underline-offset-4">Data Principal</span> under the DPDP Act 2023,
                        you have the absolute right to manage and withdraw your consent at any time.
                    </p>
                </div>

                {/* Consents Grid */}
                <div className="grid gap-6">
                    {consents.map((consent) => {
                        const Icon = getIcon(consent.type);
                        const colorClass = getColor(consent.type);

                        return (
                            <Card key={consent.id} className="group hover:shadow-2xl transition-all duration-500 border-none bg-card rounded-[2rem] overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        {/* Icon Side */}
                                        <div className={`md:w-32 flex items-center justify-center p-8 ${colorClass.split(' ')[0]} bg-opacity-40`}>
                                            <Icon className={`h-10 w-10 ${colorClass.split(' ')[1]}`} />
                                        </div>

                                        {/* Content Side */}
                                        <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-slate-800">{consent.label}</h3>
                                                    <Badge variant={consent.granted ? "default" : "secondary"} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                                        {consent.granted ? "Active" : "Withdrawn"}
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                                                    {consent.description}
                                                </p>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                        <History className="h-3 w-3" />
                                                        Last Updated: {new Date(consent.updatedAt).toLocaleDateString("en-IN")}
                                                    </div>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="h-3.5 w-3.5 text-slate-300 hover:text-primary transition-colors" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest border-none py-2 px-4 rounded-xl">
                                                                Revocable under DPDP Section 6(4)
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`px-4 py-2 rounded-2xl border ${consent.granted ? 'border-primary/20 bg-primary/5' : 'border-blue-100/50 bg-blue-50/40'} transition-all`}>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${consent.granted ? 'text-primary' : 'text-slate-400'}`}>
                                                            {consent.granted ? "Enabled" : "Disabled"}
                                                        </span>
                                                        <Switch
                                                            checked={consent.granted}
                                                            onCheckedChange={(val) => updateConsent(consent.id, val)}
                                                            className="data-[state=checked]:bg-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Security Footer */}
                <div className="pt-10 flex flex-col items-center space-y-4">
                    <div className="flex items-center gap-2 px-6 py-2 bg-slate-100 rounded-full border border-slate-200">
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500 tracking-tight">Your choices are encrypted and stored in an immutable audit log.</span>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default UserConsentsPage;
