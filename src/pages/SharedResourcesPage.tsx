import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Shield,
  Search,
  Globe,
  ShieldOff,
  Trash2,
  Clock,
  ArrowUpDown,
  FileText,
  Mail,
  MapPin,
  Phone,
  Inbox,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type DataType = "email" | "name" | "phone" | "location" | "browsing_history" | "preferences";
type ResourceStatus = "active" | "revoked" | "deleted";

interface SharedResource {
  id: string;
  websiteName: string;
  websiteUrl: string;
  dataType: DataType;
  dataLabel: string;
  sharedAt: string;
  status: ResourceStatus;
  revokedAt?: string;
  deletedAt?: string;
}

interface TimelineEntry {
  id: string;
  action: "shared" | "revoked" | "deleted";
  resourceLabel: string;
  websiteName: string;
  timestamp: string;
}

const DATA_TYPE_ICONS: Record<DataType, typeof Mail> = {
  email: Mail,
  name: FileText,
  phone: Phone,
  location: MapPin,
  browsing_history: Globe,
  preferences: FileText,
};

const STATUS_CONFIG: Record<ResourceStatus, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", variant: "default", icon: CheckCircle2 },
  revoked: { label: "Revoked", variant: "secondary", icon: XCircle },
  deleted: { label: "Deleted", variant: "destructive", icon: AlertTriangle },
};

// Mock data
const INITIAL_RESOURCES: SharedResource[] = [
  { id: "sr1", websiteName: "ShopEasy India", websiteUrl: "shopeasy.in", dataType: "email", dataLabel: "Email Address", sharedAt: "2025-02-28T14:30:00Z", status: "active" },
  { id: "sr2", websiteName: "ShopEasy India", websiteUrl: "shopeasy.in", dataType: "name", dataLabel: "Full Name", sharedAt: "2025-02-28T14:30:00Z", status: "active" },
  { id: "sr3", websiteName: "HealthTrack Pro", websiteUrl: "healthtrackpro.com", dataType: "location", dataLabel: "Location Data", sharedAt: "2025-02-20T09:15:00Z", status: "active" },
  { id: "sr4", websiteName: "HealthTrack Pro", websiteUrl: "healthtrackpro.com", dataType: "phone", dataLabel: "Phone Number", sharedAt: "2025-02-20T09:15:00Z", status: "active" },
  { id: "sr5", websiteName: "NewsDaily", websiteUrl: "newsdaily.in", dataType: "browsing_history", dataLabel: "Browsing History", sharedAt: "2025-01-15T18:00:00Z", status: "revoked", revokedAt: "2025-02-10T12:00:00Z" },
  { id: "sr6", websiteName: "TravelGo", websiteUrl: "travelgo.co.in", dataType: "preferences", dataLabel: "User Preferences", sharedAt: "2025-01-05T10:00:00Z", status: "deleted", revokedAt: "2025-01-20T08:00:00Z", deletedAt: "2025-02-01T16:00:00Z" },
  { id: "sr7", websiteName: "FinanceHub", websiteUrl: "financehub.in", dataType: "email", dataLabel: "Email Address", sharedAt: "2024-12-10T11:45:00Z", status: "active" },
];

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const SharedResourcesPage = () => {
  const [resources, setResources] = useState<SharedResource[]>(INITIAL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const lastUpdated = useMemo(() => formatTimestamp(new Date().toISOString()), []);

  const timeline: TimelineEntry[] = useMemo(() => {
    const entries: TimelineEntry[] = [];
    resources.forEach((r) => {
      entries.push({ id: `${r.id}-shared`, action: "shared", resourceLabel: r.dataLabel, websiteName: r.websiteName, timestamp: r.sharedAt });
      if (r.revokedAt) entries.push({ id: `${r.id}-revoked`, action: "revoked", resourceLabel: r.dataLabel, websiteName: r.websiteName, timestamp: r.revokedAt });
      if (r.deletedAt) entries.push({ id: `${r.id}-deleted`, action: "deleted", resourceLabel: r.dataLabel, websiteName: r.websiteName, timestamp: r.deletedAt });
    });
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [resources]);

  const filteredResources = useMemo(() => {
    let result = resources.filter((r) =>
      r.websiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dataLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
    result.sort((a, b) => {
      const diff = new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
    return result;
  }, [resources, searchQuery, statusFilter, sortOrder]);

  const handleRevoke = (id: string) => {
    setResources((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "revoked" as ResourceStatus, revokedAt: new Date().toISOString() } : r)
    );
  };

  const handleDelete = (id: string) => {
    setResources((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "deleted" as ResourceStatus, deletedAt: new Date().toISOString(), revokedAt: r.revokedAt || new Date().toISOString() } : r)
    );
    setDeleteConfirmId(null);
  };

  const activeCount = resources.filter((r) => r.status === "active").length;
  const revokedCount = resources.filter((r) => r.status === "revoked").length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shared Resources</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage data you've shared with third-party websites and apps.
            </p>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last updated: {lastUpdated}
          </p>
        </div>

        {/* Privacy Notice */}
        <Card className="border-primary/20 bg-accent/30">
          <CardContent className="flex items-start gap-3 py-4">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">You have full control over your shared data.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Under the DPDP Act 2023, you can view, revoke, or delete any data shared with third parties at any time. All actions are logged in your activity timeline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-primary">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Shares</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{revokedCount}</p>
              <p className="text-xs text-muted-foreground">Revoked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-destructive">{resources.filter((r) => r.status === "deleted").length}</p>
              <p className="text-xs text-muted-foreground">Deleted</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by website or data type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5"
            onClick={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>

        {/* Resources List */}
        <div className="space-y-3">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No shared resources found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter."
                    : "You haven't shared any data with third-party services yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResources.map((resource) => {
              const statusCfg = STATUS_CONFIG[resource.status];
              const Icon = DATA_TYPE_ICONS[resource.dataType] || FileText;
              const StatusIcon = statusCfg.icon;

              return (
                <Card key={resource.id} className="transition-all hover:shadow-md">
                  <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
                    {/* Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">{resource.websiteName}</span>
                          <Badge variant={statusCfg.variant} className="text-[10px] h-5 gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{resource.dataLabel}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
                          <span>Shared: {formatTimestamp(resource.sharedAt)}</span>
                          {resource.revokedAt && <span>Revoked: {formatTimestamp(resource.revokedAt)}</span>}
                          {resource.deletedAt && <span>Deleted: {formatTimestamp(resource.deletedAt)}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 sm:ml-auto">
                      {resource.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                              <ShieldOff className="h-3.5 w-3.5" /> Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <ShieldOff className="h-5 w-5 text-muted-foreground" /> Revoke Access
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will revoke <strong>{resource.websiteName}</strong>'s access to your <strong>{resource.dataLabel}</strong>. The website will no longer be able to access this data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevoke(resource.id)}>Revoke Access</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      {resource.status !== "deleted" && (
                        <AlertDialog open={deleteConfirmId === resource.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmId(resource.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" /> Permanently Delete Data
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <span className="block">
                                  This will permanently delete your <strong>{resource.dataLabel}</strong> shared with <strong>{resource.websiteName}</strong>.
                                </span>
                                <span className="block font-medium text-destructive">
                                  ⚠ This action is irreversible. The data cannot be recovered once deleted.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(resource.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Confirm Permanent Deletion
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </div>
            <CardDescription>Chronological log of all data sharing actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {timeline.slice(0, 10).map((entry, idx) => {
                const isLast = idx === Math.min(timeline.length, 10) - 1;
                const actionColors: Record<string, string> = {
                  shared: "bg-primary",
                  revoked: "bg-muted-foreground",
                  deleted: "bg-destructive",
                };
                const actionLabels: Record<string, string> = {
                  shared: "Shared",
                  revoked: "Revoked",
                  deleted: "Deleted",
                };

                return (
                  <div key={entry.id} className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${actionColors[entry.action]}`} />
                      {!isLast && <div className="w-px flex-1 bg-border" />}
                    </div>
                    {/* Content */}
                    <div className={`pb-4 ${isLast ? "" : ""}`}>
                      <p className="text-sm">
                        <span className="font-medium">{actionLabels[entry.action]}</span>{" "}
                        <span className="text-muted-foreground">{entry.resourceLabel}</span>{" "}
                        <span className="text-muted-foreground">—</span>{" "}
                        <span className="text-muted-foreground">{entry.websiteName}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatTimestamp(entry.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SharedResourcesPage;
