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
import { User, Download, Trash2, Shield, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
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
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Privacy Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your personal data, consent preferences, and privacy settings.
          </p>
        </div>

        {/* DPDP Notice */}
        <Card className="border-primary/20 bg-accent/30">
          <CardContent className="flex items-start gap-3 py-4">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Your Rights Under DPDP Act 2023</p>
              <p className="text-xs text-muted-foreground mt-1">
                You have the right to access, correct, and erase your personal data. You can withdraw consent at any time. Data will be processed only for purposes you've consented to.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Personal Data</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setEditingProfile(!editingProfile); setProfileForm({ name: user?.name ?? "", phone: user?.phone ?? "" }); }}>
                  {editingProfile ? "Cancel" : "Edit"}
                </Button>
              </div>
              <CardDescription>View and edit your stored personal data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingProfile ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Email (read-only)</Label>
                    <Input value={user?.email} disabled />
                  </div>
                  <Button size="sm" onClick={handleSaveProfile} className="w-full">Save Changes</Button>
                </>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{user?.name}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{user?.email}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{user?.phone || "—"}</span></div>
                  <Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}</span></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Data Portability</CardTitle>
              </div>
              <CardDescription>Export or delete your data as per DPDP Act rights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={requestDataExport}>
                <Download className="h-4 w-4 mr-2" /> Download My Data (JSON)
              </Button>
              <p className="text-xs text-muted-foreground">Export all personal data stored on this platform in JSON format.</p>
              
              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Request Account Deletion
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is irreversible. All your personal data will be permanently erased within 30 days as per DPDP Act compliance. You will receive a confirmation email.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={requestAccountDeletion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Confirm Deletion
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground">Your data will be erased within 30 days of request.</p>
            </CardContent>
          </Card>
        </div>

        {/* Consent Management */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Active Consents</CardTitle>
            </div>
            <CardDescription>Manage your consent preferences. Changes take effect immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {consents.map((consent) => (
              <div key={consent.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{consent.label}</span>
                    <Badge variant={consent.granted ? "default" : "secondary"} className="text-[10px] h-5">
                      {consent.granted ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Withdrawn</>
                      )}
                    </Badge>
                    {consent.type === "data_storage" && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          This consent is required for core functionality. Withdrawing it will limit your account.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{consent.description}</p>
                  <p className="text-[10px] text-muted-foreground">Last updated: {new Date(consent.updatedAt).toLocaleString("en-IN")}</p>
                </div>
                <Switch
                  checked={consent.granted}
                  onCheckedChange={(checked) => updateConsent(consent.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
