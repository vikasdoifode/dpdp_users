import { useState, useMemo, useEffect } from "react";
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
import { api } from "@/lib/api";

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

const SharedResourcesPage = () => {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const formatTimestamp = (isoDate: string) => {
    return new Date(isoDate).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.getResources();
        // Map backend response to frontend Resource interface
        const mapped = res.resources.map((r: any) => ({
          id: r._id,
          websiteName: r.websiteName,
          websiteUrl: r.websiteUrl,
          dataType: r.dataType,
          dataLabel: r.dataLabel,
          sharedAt: r.sharedAt,
          status: r.status,
          expiryDate: r.expiryDate,
          revokedAt: r.revokedAt,
          deletedAt: r.deletedAt,
        }));
        setResources(mapped);
      } catch (err) {
        console.error("Failed to fetch resources", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Handlers for revoke/delete
  const handleRevoke = async (id: string) => {
    try {
      await api.revokeResource(id);
      setResources((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "revoked", revokedAt: new Date().toISOString() } : r
        )
      );
    } catch (err) {
      console.error("Failed to revoke resource", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteResource(id);
      setResources((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "deleted", deletedAt: new Date().toISOString() } : r
        )
      );
    } catch (err) {
      console.error("Failed to delete resource", err);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.websiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.dataLabel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || resource.dataType === selectedType;
      const matchesTab =
        activeTab === "active"
          ? resource.status === "active"
          : resource.status === "revoked" || resource.status === "deleted";

      return matchesSearch && matchesType && matchesTab;
    });
  }, [resources, searchTerm, selectedType, activeTab]);

  // Derived timeline from resources
  const historyTimeline: TimelineEntry[] = useMemo(() => {
    const entries: TimelineEntry[] = [];
    resources.forEach((r) => {
      // Shared event
      entries.push({
        id: r.id + "_shared",
        action: "shared",
        resourceLabel: r.dataLabel,
        websiteName: r.websiteName,
        timestamp: r.sharedAt,
      });
      // Revoked event
      if (r.revokedAt) {
        entries.push({
          id: r.id + "_revoked",
          action: "revoked",
          resourceLabel: r.dataLabel,
          websiteName: r.websiteName,
          timestamp: r.revokedAt,
        });
      }
      // Deleted event
      if (r.deletedAt) {
        entries.push({
          id: r.id + "_deleted",
          action: "deleted",
          resourceLabel: r.dataLabel,
          websiteName: r.websiteName,
          timestamp: r.deletedAt,
        });
      }
    });
    return entries.sort((a, b) => {
       const timeA = new Date(a.timestamp).getTime();
       const timeB = new Date(b.timestamp).getTime();
       return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [resources, sortOrder]);

  const lastUpdated = useMemo(() => formatTimestamp(new Date().toISOString()), []);

  if (isLoading) {
      return <div className="p-8">Loading shared resources...</div>;
  }

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
              <p className="text-2xl font-bold text-primary">{resources.filter((r) => r.status === "active").length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Shares</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-slate-50">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{resources.filter((r) => r.status === "revoked").length}</p>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[150px] h-11">
              <SelectValue placeholder="Data Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Data Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="browsing_history">Browsing History</SelectItem>
              <SelectItem value="preferences">Preferences</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => setSortOrder((o) => (o === "newest" ? "oldest" : "newest"))}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
          </Button>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <ShieldOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No active shared resources found</h3>
              <p className="text-muted-foreground">
                You haven&apos;t shared any data with third-party services yet.
              </p>
            </div>
          ) : (
            filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full h-fit">
                        {/* Icon logic remains same, casting as needed */}
                        {(() => {
                          const Icon = DATA_TYPE_ICONS[resource.dataType] || FileText;
                          return <Icon className="h-5 w-5 text-primary" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{resource.websiteName}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" /> {resource.websiteUrl}
                          </span>
                          <span>•</span>
                          <span>{resource.dataLabel}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="text-right mr-2 hidden sm:block">
                        <div className="text-xs text-muted-foreground">Expires</div>
                        <div className="text-sm font-medium">
                          {new Date(resource.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="w-full sm:w-auto text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200">
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke access to your data?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will immediately stop {resource.websiteName} from accessing your {resource.dataLabel}. 
                              They may still retain data already collected subject to their privacy policy.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRevoke(resource.id)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Yes, Revoke Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="w-full sm:w-auto text-destructive hover:text-destructive bg-destructive/5 hover:bg-destructive/10 border-destructive/20">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Request data deletion?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will send a formal request to {resource.websiteName} to permanently delete your {resource.dataLabel} 
                              from their servers. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(resource.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Yes, Request Deletion
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 px-6 py-2 border-t flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Active since {new Date(resource.sharedAt).toLocaleDateString()}</span>
                  </div>
                  <div>ID: {resource.id.substring(0, 8)}...</div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Timeline */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Audit Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-6 relative border-l-2 border-muted ml-4 pl-8 py-2">
              {historyTimeline.length === 0 ? (
                  <div className="text-muted-foreground">No history available.</div>
              ) : (
              historyTimeline.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[41px] top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center bg-background
                    ${item.action === 'shared' ? 'border-primary text-primary' : 
                      item.action === 'revoked' ? 'border-amber-500 text-amber-500' : 'border-destructive text-destructive'}`}
                  >
                    {item.action === 'shared' && <CheckCircle2 className="h-3 w-3" />}
                    {item.action === 'revoked' && <ShieldOff className="h-3 w-3" />}
                    {item.action === 'deleted' && <Trash2 className="h-3 w-3" />}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="font-semibold text-sm">
                      {item.action === 'shared' && 'Access Granted'}
                      {item.action === 'revoked' && 'Access Revoked'}
                      {item.action === 'deleted' && 'Deletion Requested'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {item.action === 'shared' ? 'You shared' :
                       item.action === 'revoked' ? 'You revoked access to' :
                       'You requested deletion of'}
                    </span>
                    {' '}
                    <span className="font-medium text-foreground">{item.resourceLabel}</span>
                    {' '}
                    <span className="text-muted-foreground">with</span>
                    {' '}
                    <span className="font-medium text-foreground">{item.websiteName}</span>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SharedResourcesPage;
