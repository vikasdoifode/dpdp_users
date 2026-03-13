import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
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
  expiryDate: string;
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
  {
    id: "sr1",
    websiteName: "ShopEasy India",
    websiteUrl: "shopeasy.in",
    dataType: "email",
    dataLabel: "Email Address",
    sharedAt: "2025-02-28T14:30:00Z",
    status: "active",
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sr2",
    websiteName: "ShopEasy India",
    websiteUrl: "shopeasy.in",
    dataType: "name",
    dataLabel: "Full Name",
    sharedAt: "2025-02-28T14:30:00Z",
    status: "active",
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sr3",
    websiteName: "HealthTrack Pro",
    websiteUrl: "healthtrackpro.com",
    dataType: "location",
    dataLabel: "Location Data",
    sharedAt: "2025-02-20T09:15:00Z",
    status: "active",
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sr4",
    websiteName: "HealthTrack Pro",
    websiteUrl: "healthtrackpro.com",
    dataType: "phone",
    dataLabel: "Phone Number",
    sharedAt: "2025-02-20T09:15:00Z",
    status: "active",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sr5",
    websiteName: "NewsDaily",
    websiteUrl: "newsdaily.in",
    dataType: "browsing_history",
    dataLabel: "Browsing History",
    sharedAt: "2025-01-15T18:00:00Z",
    status: "revoked",
    revokedAt: "2025-02-10T12:00:00Z",
    expiryDate: "2025-04-15T18:00:00Z"
  },
  {
    id: "sr7",
    websiteName: "FinanceHub",
    websiteUrl: "financehub.in",
    dataType: "email",
    dataLabel: "Email Address",
    sharedAt: "2024-12-10T11:45:00Z",
    status: "active",
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
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
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shared Resources</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage data shared with third-parties under DPDP Act 2023.
            </p>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last updated: {lastUpdated}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm bg-blue-50/50">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-primary">{activeCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Shares</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-slate-50">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{revokedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revoked</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-red-50/30">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-destructive">{resources.filter((r) => r.status === "deleted").length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deleted</p>
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
              className="pl-9 h-11"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-11">
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
            className="h-11 gap-1.5"
            onClick={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </Button>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Inbox className="h-10 w-10 mx-auto opacity-20 mb-3" />
                <p>No results found for your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredResources.map((resource) => {
              const statusCfg = STATUS_CONFIG[resource.status];
              const Icon = DATA_TYPE_ICONS[resource.dataType] || FileText;
              const StatusIcon = statusCfg.icon;

              return (
                <Card key={resource.id} className="group transition-all hover:shadow-lg border-slate-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Side Highlight for Status */}
                      <div className={`w-1 md:w-1.5 shrink-0 ${resource.status === 'active' ? 'bg-green-500' : 'bg-slate-300'
                        }`} />

                      <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-6">
                        {/* Info Section */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 border flex items-center justify-center shrink-0">
                            <Icon className="h-6 w-6 text-slate-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900">{resource.websiteName}</h3>
                              <Badge variant={statusCfg.variant} className="text-[10px] uppercase font-bold px-2 py-0">
                                <StatusIcon className="h-3 w-3 mr-1" /> {statusCfg.label}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-500">{resource.dataLabel}</p>

                            <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              <span>Shared: {formatTimestamp(resource.sharedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center gap-2 md:border-l md:pl-6 overflow-x-auto pb-2 md:pb-0">
                          {resource.status === 'active' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200">
                                  <ShieldOff className="h-4 w-4" /> Revoke
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke Data Access?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will stop <strong>{resource.websiteName}</strong> from processing your <strong>{resource.dataLabel}</strong> immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRevoke(resource.id)}>Revoke Now</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {resource.status !== 'deleted' && (
                            <AlertDialog open={deleteConfirmId === resource.id} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => setDeleteConfirmId(resource.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Shared Data?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-red-600 font-medium">
                                    Warning: This request will be sent as a permanent erasure request under DPDP Section 12.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(resource.id)}
                                  >
                                    Confirm Erasure
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Timeline */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Audit Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.slice(0, 5).map((entry, idx) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`h-2.5 w-2.5 rounded-full mt-1 ${entry.action === 'shared' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                  {idx !== Math.min(timeline.length, 5) - 1 && <div className="w-px flex-1 bg-slate-100 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs font-bold text-slate-700 leading-none">
                    {entry.action.toUpperCase()}: {entry.resourceLabel}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                    {entry.websiteName} · {formatTimestamp(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SharedResourcesPage;
