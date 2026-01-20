import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  IndianRupee,
  Calendar,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  FileText,
} from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  profile_id: string | null;
  amount: number;
  plan_type: string;
  plan_name: string;
  plan_category: string;
  status: string;
  validity_months: number | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: {
    name: string;
    email: string;
    phone: string;
    profile_id: string | null;
    photo_url: string | null;
  };
}

type StatusFilter = "all" | "pending" | "active" | "rejected" | "expired";

const SubscriptionApproval = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pending: 0,
    active: 0,
    rejected: 0,
    expired: 0,
  });
  const itemsPerPage = 10;
  const { toast } = useToast();

  const fetchStatusCounts = async () => {
    try {
      const [allCount, pendingCount, activeCount, rejectedCount, expiredCount] = await Promise.all([
        supabase.from("prime_subscriptions").select("*", { count: "exact", head: true }),
        supabase.from("prime_subscriptions").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("prime_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("prime_subscriptions").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("prime_subscriptions").select("*", { count: "exact", head: true }).eq("status", "expired"),
      ]);

      setStatusCounts({
        all: allCount.count || 0,
        pending: pendingCount.count || 0,
        active: activeCount.count || 0,
        rejected: rejectedCount.count || 0,
        expired: expiredCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("prime_subscriptions")
        .select("*", { count: "exact" });

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`plan_name.ilike.%${searchQuery}%,plan_category.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch profile details for each subscription
      if (data && data.length > 0) {
        const profileIds = data.filter(s => s.profile_id).map(s => s.profile_id);
        const userIds = data.map(s => s.user_id);

        // First try to get profiles by profile_id
        let profilesData: any[] = [];
        if (profileIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name, email, phone, profile_id, photo_url")
            .in("id", profileIds);
          if (profiles) profilesData = profiles;
        }

        // Also fetch profiles by user_id for those without profile_id
        const { data: profilesByUserId } = await supabase
          .from("profiles")
          .select("id, user_id, name, email, phone, profile_id, photo_url")
          .in("user_id", userIds);

        const subscriptionsWithProfiles = data.map(sub => {
          let profile = profilesData.find(p => p.id === sub.profile_id);
          if (!profile && profilesByUserId) {
            profile = profilesByUserId.find(p => p.user_id === sub.user_id);
          }
          return { ...sub, profile };
        });

        setSubscriptions(subscriptionsWithProfiles);
      } else {
        setSubscriptions([]);
      }

      setTotalCount(count || 0);
      await fetchStatusCounts();
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, statusFilter, searchQuery]);

  const sendNotificationEmail = async (
    email: string,
    name: string,
    planName: string,
    amount: number,
    validityMonths: number,
    status: "approved" | "rejected",
    expiresAt?: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke("send-subscription-notification", {
        body: {
          email,
          name,
          planName,
          amount,
          validityMonths,
          status,
          expiresAt,
        },
      });

      if (error) {
        console.error("Failed to send notification email:", error);
      } else {
        console.log("Notification email sent successfully");
      }
    } catch (error) {
      console.error("Error sending notification email:", error);
    }
  };

  const handleApproveSubscription = async () => {
    if (!selectedSubscription) return;
    setProcessing(true);

    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + (selectedSubscription.validity_months || 3));

      // Update subscription status
      const { error: subError } = await supabase
        .from("prime_subscriptions")
        .update({
          status: "active",
          started_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", selectedSubscription.id);

      if (subError) throw subError;

      // Update user's prime status in profiles
      if (selectedSubscription.profile_id) {
        await supabase
          .from("profiles")
          .update({
            is_prime: true,
            prime_expires_at: expiresAt.toISOString(),
          })
          .eq("id", selectedSubscription.profile_id);
      } else if (selectedSubscription.user_id) {
        await supabase
          .from("profiles")
          .update({
            is_prime: true,
            prime_expires_at: expiresAt.toISOString(),
          })
          .eq("user_id", selectedSubscription.user_id);
      }

      // Send approval notification email
      if (selectedSubscription.profile?.email && selectedSubscription.profile?.name) {
        await sendNotificationEmail(
          selectedSubscription.profile.email,
          selectedSubscription.profile.name,
          selectedSubscription.plan_name,
          selectedSubscription.amount,
          selectedSubscription.validity_months || 3,
          "approved",
          expiresAt.toISOString()
        );
      }

      toast({
        title: "Subscription Approved",
        description: `${selectedSubscription.plan_name} subscription has been activated. Email notification sent.`,
      });

      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (error: any) {
      console.error("Error approving subscription:", error);
      toast({
        title: "Error",
        description: "Failed to approve subscription",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubscription = async () => {
    if (!selectedSubscription) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from("prime_subscriptions")
        .update({ status: "rejected" })
        .eq("id", selectedSubscription.id);

      if (error) throw error;

      // Send rejection notification email
      if (selectedSubscription.profile?.email && selectedSubscription.profile?.name) {
        await sendNotificationEmail(
          selectedSubscription.profile.email,
          selectedSubscription.profile.name,
          selectedSubscription.plan_name,
          selectedSubscription.amount,
          selectedSubscription.validity_months || 3,
          "rejected"
        );
      }

      toast({
        title: "Subscription Rejected",
        description: `${selectedSubscription.plan_name} subscription has been rejected. Email notification sent.`,
      });

      setSelectedSubscription(null);
      fetchSubscriptions();
    } catch (error: any) {
      console.error("Error rejecting subscription:", error);
      toast({
        title: "Error",
        description: "Failed to reject subscription",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Expired</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-600/80 dark:text-blue-300/80">Total</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCounts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950 dark:to-amber-900 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-yellow-600/80 dark:text-yellow-300/80">Pending</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCounts.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-green-600/80 dark:text-green-300/80">Active</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-red-600/80 dark:text-red-300/80">Rejected</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statusCounts.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950 dark:to-slate-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600/80 dark:text-gray-300/80">Expired</p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statusCounts.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white dark:bg-gray-800 border-gold/20 dark:border-gray-700">
        <CardHeader className="border-b border-border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-maroon dark:text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Payments
              </CardTitle>
              <CardDescription>
                Review and approve pending subscription payments
              </CardDescription>
            </div>
            <Button
              onClick={fetchSubscriptions}
              variant="outline"
              size="sm"
              disabled={loading}
              className="dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by plan name or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setCurrentPage(1);
            }}>
              <TabsList className="grid grid-cols-5 w-full sm:w-auto dark:bg-gray-700">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs text-yellow-700 dark:text-yellow-400">Pending</TabsTrigger>
                <TabsTrigger value="active" className="text-xs text-green-700 dark:text-green-400">Active</TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs text-red-700 dark:text-red-400">Rejected</TabsTrigger>
                <TabsTrigger value="expired" className="text-xs text-gray-700 dark:text-gray-400">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead className="dark:text-gray-300">User</TableHead>
                  <TableHead className="dark:text-gray-300">Plan</TableHead>
                  <TableHead className="dark:text-gray-300">Amount</TableHead>
                  <TableHead className="dark:text-gray-300">Validity</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="dark:text-gray-300">Submitted</TableHead>
                  <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow 
                      key={subscription.id} 
                      className="cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-700/50 dark:border-gray-700"
                      onClick={() => setSelectedSubscription(subscription)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={subscription.profile?.photo_url || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {subscription.profile?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{subscription.profile?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{subscription.profile?.profile_id || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{subscription.plan_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{subscription.plan_category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(subscription.amount)}
                      </TableCell>
                      <TableCell>
                        {subscription.validity_months ? `${subscription.validity_months} months` : "-"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(subscription.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(subscription.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubscription(subscription);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Details Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Subscription Details
            </DialogTitle>
            <DialogDescription>
              Review payment and approve or reject
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedSubscription.profile?.photo_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedSubscription.profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedSubscription.profile?.name || "Unknown User"}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.profile?.email || "-"}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.profile?.phone || "-"}</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedSubscription.profile?.profile_id || "No Profile ID"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Plan Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Plan Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Plan Name</p>
                      <p className="font-medium">{selectedSubscription.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{selectedSubscription.plan_category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Plan Type</p>
                      <p className="font-medium capitalize">{selectedSubscription.plan_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Validity</p>
                      <p className="font-medium">{selectedSubscription.validity_months || 0} months</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Payment Information</h4>
                  <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 dark:text-green-300 font-medium">Amount Paid</span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(selectedSubscription.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted On</p>
                      <p className="font-medium">{formatDate(selectedSubscription.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Status</p>
                      {getStatusBadge(selectedSubscription.status)}
                    </div>
                  </div>
                  {selectedSubscription.started_at && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Started At</p>
                        <p className="font-medium">{formatDate(selectedSubscription.started_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expires At</p>
                        <p className="font-medium">{formatDate(selectedSubscription.expires_at)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons for Pending */}
                {selectedSubscription.status === "pending" && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Admin Notes</h4>
                      <Textarea
                        placeholder="Add notes about this subscription (optional)"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          {selectedSubscription?.status === "pending" && (
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={handleRejectSubscription}
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApproveSubscription}
                disabled={processing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {processing ? "Processing..." : "Approve & Activate"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionApproval;
