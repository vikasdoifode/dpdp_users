import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle2, Info, ArrowRight } from "lucide-react";
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
        description:
            "I consent to the storage of my personal data as described in the Privacy Policy, in compliance with DPDP Act Section 8.",
        required: true,
    },
    {
        key: "ai_processing",
        label: "AI Processing Consent",
        description:
            "I consent to having my anonymized data processed by AI systems for personalized recommendations.",
        required: false,
    },
    {
        key: "analytics",
        label: "Analytics Consent",
        description:
            "I consent to the collection of anonymized usage analytics to improve platform services.",
        required: false,
    },
];

const ConsentSetupPage = () => {
    const navigate = useNavigate();
    const { updateConsent, consents } = useAuth();

    const [selections, setSelections] = useState<Record<string, boolean>>({
        data_storage: true, // Required, default on
        ai_processing: false,
        analytics: false,
    });

    const [error, setError] = useState("");

    const toggle = (key: string) => {
        if (key === "data_storage") return; // Can't uncheck required
        setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleContinue = () => {
        if (!selections.data_storage) {
            setError("Data Storage consent is mandatory.");
            return;
        }

        // Update each consent in state
        consents.forEach((c) => {
            const granted = selections[c.type] ?? false;
            if (c.granted !== granted) {
                updateConsent(c.id, granted);
            }
        });

        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-lg animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Set Your Privacy Preferences
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        As per the DPDP Act 2023, we need your explicit consent before processing your data.
                        <br />
                        You can change these anytime from your Privacy Dashboard.
                    </p>
                </div>

                {/* Consent Card */}
                <Card className="border bg-white shadow-xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Consent Preferences
                        </CardTitle>
                        <CardDescription>
                            Select how you'd like us to handle your data. Only data storage is required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 border border-destructive/20">
                                {error}
                            </div>
                        )}

                        {CONSENT_ITEMS.map((item) => (
                            <label
                                key={item.key}
                                className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-150 ${selections[item.key]
                                        ? "border-primary/40 bg-primary/5 shadow-sm"
                                        : "hover:bg-accent/50"
                                    } ${item.required ? "cursor-default" : ""}`}
                                onClick={() => toggle(item.key)}
                            >
                                <Checkbox
                                    checked={selections[item.key]}
                                    onCheckedChange={() => toggle(item.key)}
                                    className="mt-0.5"
                                    disabled={item.required}
                                />
                                <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{item.label}</span>
                                        {item.required && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                                                Required
                                            </span>
                                        )}
                                        {!item.required && (
                                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                                Optional
                                            </span>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs text-xs">
                                                {item.description}
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </label>
                        ))}

                        <div className="pt-4">
                            <Button onClick={handleContinue} className="w-full" size="lg">
                                <span className="flex items-center gap-2">
                                    Continue to Dashboard <ArrowRight className="h-4 w-4" />
                                </span>
                            </Button>
                        </div>

                        <p className="text-[11px] text-center text-muted-foreground pt-1">
                            By continuing, you acknowledge that your consent choices are recorded as per DPDP Act Section 6.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ConsentSetupPage;
