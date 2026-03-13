import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, ArrowUpRight, ArrowDownRight, Globe, Fingerprint, Brain, Clock, Activity, ShieldCheck, Search, Building2, MapPin, Database } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useState } from "react";

// Mock data for platforms the user might have provided consent to
const MOCK_PLATFORMS = [
    { id: "p1", name: "Google", riskScore: 42, category: "Tech Giant", sharedData: ["Email", "Search History", "Location"], status: "Active", icon: Globe, color: "text-blue-500" },
    { id: "p2", name: "Meta (Facebook)", riskScore: 78, category: "Social Media", sharedData: ["Personal Info", "Contacts", "Usage Data"], status: "Active", icon: Activity, color: "text-red-500" },
    { id: "p3", name: "Amazon", riskScore: 35, category: "E-commerce", sharedData: ["Address", "Payment Info", "Purchase History"], status: "Active", icon: Building2, color: "text-amber-500" },
    { id: "p4", name: "Local Health App", riskScore: 12, category: "Healthcare", sharedData: ["Medical Records (Encrypted)"], status: "Restricted", icon: ShieldCheck, color: "text-green-500" },
    { id: "p5", name: "X (Twitter)", riskScore: 65, category: "Social Media", sharedData: ["Public Posts", "Device Info"], status: "Active", icon: Globe, color: "text-orange-500" },
];

const RiskScorePage = () => {
    const { consents, aiEnabled, user, activities } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<typeof MOCK_PLATFORMS[0] | null>(null);

    // Dynamic Risk Score Calculation
    const riskDetails = useMemo(() => {
        const sharedWebsitesCount = MOCK_PLATFORMS.length;
        const sharedRisk = Math.min((sharedWebsitesCount / 10) * 100, 100) * 0.3;

        let sensitivityPoints = 0;
        if (user?.email) sensitivityPoints += 20;
        if (user?.phone) sensitivityPoints += 40;
        if (user?.name) sensitivityPoints += 20;
        sensitivityPoints += 20;
        const sensitivityRisk = sensitivityPoints * 0.25;

        const aiRisk = (aiEnabled ? 100 : 0) * 0.15;

        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const hasOldConsent = consents.some(c => new Date(c.updatedAt) < ninetyDaysAgo);
        const oldConsentRisk = (hasOldConsent ? 100 : 20) * 0.1;

        const activeCount = consents.filter(c => c.granted).length;
        const totalCount = consents.length || 1;
        const activeRatioRisk = (activeCount / totalCount) * 100 * 0.1;

        const hasSuspicious = activities.some(a => a.type === "login" && a.description.includes("iPhone"));
        const suspiciousRisk = (hasSuspicious ? 100 : 0) * 0.1;

        const totalScore = Math.round(sharedRisk + sensitivityRisk + aiRisk + oldConsentRisk + activeRatioRisk + suspiciousRisk);

        return {
            totalScore,
            factors: [
                { name: "Websites Shared", value: sharedWebsitesCount, score: Math.round(sharedRisk / 0.3), weight: "30%", icon: Globe, color: "text-blue-500" },
                { name: "Data Sensitivity", value: "Medium", score: Math.round(sensitivityRisk / 0.25), weight: "25%", icon: Fingerprint, color: "text-purple-500" },
                { name: "AI Status", value: aiEnabled ? "Enabled" : "Disabled", score: aiEnabled ? 100 : 0, weight: "15%", icon: Brain, color: "text-amber-500" },
                { name: "Consent Age", value: hasOldConsent ? "> 90 days" : "Fresh", score: Math.round(oldConsentRisk / 0.1), weight: "10%", icon: Clock, color: "text-orange-500" },
                { name: "Active Ratio", value: `${activeCount}/${totalCount}`, score: Math.round(activeRatioRisk / 0.1), weight: "10%", icon: ShieldCheck, color: "text-green-500" },
                { name: "Activity Flags", value: hasSuspicious ? "1 Flag" : "Clean", score: hasSuspicious ? 100 : 0, weight: "10%", icon: Activity, color: "text-red-500" },
            ]
        };
    }, [consents, aiEnabled, user, activities]);

    const filteredPlatforms = MOCK_PLATFORMS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scoreLevel = riskDetails.totalScore < 30 ? "Excellent" : riskDetails.totalScore < 60 ? "Fair" : "Poor";
    const scoreColor = riskDetails.totalScore < 30 ? "text-green-500" : riskDetails.totalScore < 60 ? "text-amber-500" : "text-red-500";
    const scoreBg = riskDetails.totalScore < 30 ? "bg-green-500" : riskDetails.totalScore < 60 ? "bg-amber-500" : "bg-red-500";

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Privacy Credit Score</h1>
                        <p className="text-muted-foreground">Dynamic risk assessment based on DPDP Act compliance vectors.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50/50 shadow-sm ring-1 ring-blue-100/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status:</span>
                        <span className={`text-sm font-bold ${scoreColor}`}>{scoreLevel}</span>
                    </div>
                </div>

                {/* Search Bar Section */}
                <div className="relative group max-w-2xl mx-auto w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search platform (e.g. Google, Meta, Health App)..."
                        className="pl-12 h-14 text-base rounded-2xl border-2 border-muted hover:border-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-blue-100/50 shadow-2xl z-50 overflow-hidden max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                            {filteredPlatforms.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {filteredPlatforms.map(p => (
                                        <button
                                            key={p.id}
                                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition-colors text-left"
                                            onClick={() => {
                                                setSelectedPlatform(p);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-lg bg-blue-100/50 ${p.color}`}>
                                                    <p.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground">{p.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-sm font-bold ${p.riskScore < 40 ? 'text-green-500' : p.riskScore < 70 ? 'text-amber-500' : 'text-red-500'}`}>
                                                    {p.riskScore} Risk
                                                </span>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Index</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-blue-900/40">
                                    <Globe className="h-10 w-10 opacity-30 mx-auto mb-3" />
                                    <p className="font-medium">No platforms found</p>
                                    <p className="text-xs mt-1">Try searching for a different entity.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Platform Detail Overlay */}
                {selectedPlatform && (
                    <div className="animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300">
                        <Card className="border-primary/20 bg-primary/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-primary cursor-pointer hover:bg-primary/10 p-1 rounded-full transition-colors" onClick={() => setSelectedPlatform(null)}>
                                <ArrowUpRight className="h-5 w-5 rotate-45" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl bg-card shadow-sm ${selectedPlatform.color}`}>
                                        <selectedPlatform.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <span className="text-xl font-bold">{selectedPlatform.name}</span>
                                        <p className="text-xs font-medium text-slate-500">{selectedPlatform.category} · Platform-Specific Risk</p>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-card border shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Individual Risk Index</p>
                                        <div className="flex items-end gap-2">
                                            <span className={`text-4xl font-extrabold ${selectedPlatform.riskScore < 40 ? 'text-green-500' : selectedPlatform.riskScore < 70 ? 'text-amber-500' : 'text-red-500'}`}>{selectedPlatform.riskScore}</span>
                                            <span className="text-sm font-bold text-slate-400 mb-1">/ 100</span>
                                        </div>
                                        <Progress value={selectedPlatform.riskScore} className="h-2.5 mt-4" />
                                    </div>

                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span className="text-xs font-medium text-slate-700">DPDP Compliance: {selectedPlatform.status === 'Active' ? 'Verified' : 'Limited'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Data Provided to this Platform:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlatform.sharedData.map(data => (
                                            <span key={data} className="px-3 py-1.5 rounded-lg bg-card border border-blue-100/30 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm">
                                                <Database className="h-3 w-3 text-primary" /> {data}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-6">
                                        <button className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1">
                                            Review/Revoke Consent for {selectedPlatform.name} <ArrowUpRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Main Total Score Visualizer */}
                    <Card className="lg:col-span-2 overflow-hidden border-primary/20 bg-card shadow-xl relative">
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 ${scoreBg}`} />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Your Privacy Posture
                            </CardTitle>
                            <CardDescription>Live score calculated using weighted DPDP risk factors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-center gap-10 py-6">
                                <div className="relative flex items-center justify-center scale-110">
                                    <svg className="h-40 w-40 transform -rotate-90">
                                        <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-muted/10" />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="72"
                                            stroke="currentColor"
                                            strokeWidth="14"
                                            fill="transparent"
                                            strokeDasharray={452.4}
                                            strokeDashoffset={452.4 - (452.4 * riskDetails.totalScore) / 100}
                                            className={`${scoreColor} transition-all duration-1000 ease-out`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-extrabold">{riskDetails.totalScore}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Index</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-5">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${scoreColor}`}>{scoreLevel}</h3>
                                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                            Your score of <span className="font-bold">{riskDetails.totalScore}</span> is based on {riskDetails.factors.length} weighted data points.
                                            A lower score indicates a more secure and private digital footprint.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pb-2">
                                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100/50">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Most Impact</p>
                                            <p className="text-sm font-semibold mt-1">Shared Websites</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100/50">
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Last Check</p>
                                            <p className="text-sm font-semibold mt-1">Just Now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action List Section */}
                    <Card className="border-green-500/20 bg-green-500/5 shadow-lg">
                        <CardHeader className="pb-3 text-green-700">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Improve Your Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="group flex items-start gap-3 p-3 rounded-lg bg-card border border-green-500/20 hover:shadow-md transition-all cursor-pointer">
                                <div className="p-2 rounded bg-green-100 text-green-600">
                                    <Brain className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Disable AI Processing</p>
                                    <p className="text-[10px] text-muted-foreground">-15 Risk Points</p>
                                </div>
                                <ArrowDownRight className="ml-auto h-4 w-4 text-green-500" />
                            </div>
                            <div className="group flex items-start gap-3 p-3 rounded-lg bg-card border border-green-500/20 hover:shadow-md transition-all cursor-pointer">
                                <div className="p-2 rounded bg-green-100 text-green-600">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Refresh Old Consents</p>
                                    <p className="text-[10px] text-muted-foreground">-10 Risk Points</p>
                                </div>
                                <ArrowDownRight className="ml-auto h-4 w-4 text-green-500" />
                            </div>
                            <div className="group flex items-start gap-3 p-3 rounded-lg bg-card border border-green-500/20 hover:shadow-md transition-all cursor-pointer">
                                <div className="p-2 rounded bg-green-100 text-green-600">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Review Active Shared Data</p>
                                    <p className="text-[10px] text-muted-foreground">-8 Risk Points</p>
                                </div>
                                <ArrowDownRight className="ml-auto h-4 w-4 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weighted Factors Breakdown */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {riskDetails.factors.map((factor) => (
                        <Card key={factor.name} className="hover:shadow-lg transition-all border-blue-100/50 bg-card">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-bold text-slate-700">{factor.name}</CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-bold tracking-tighter">Impact: {factor.weight}</CardDescription>
                                </div>
                                <div className={`p-2 rounded-lg bg-muted/50 ${factor.color}`}>
                                    <factor.icon className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-xl font-bold text-slate-900">{factor.value}</span>
                                    <span className="text-xs font-bold text-muted-foreground">{factor.score} / 100</span>
                                </div>
                                <Progress value={factor.score} className={`h-2`} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RiskScorePage;
