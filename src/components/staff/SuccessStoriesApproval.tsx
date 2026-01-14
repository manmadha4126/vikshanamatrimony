import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  MapPin,
  Calendar,
} from "lucide-react";

interface SuccessStory {
  id: string;
  user_id: string;
  partner_name: string;
  wedding_date: string;
  wedding_location: string;
  story: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  user_name?: string;
  user_email?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const SuccessStoriesApproval = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const { toast } = useToast();

  const fetchStories = async () => {
    setLoading(true);
    try {
      // Fetch status counts
      const [allCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        supabase.from("success_stories").select("*", { count: "exact", head: true }),
        supabase.from("success_stories").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("success_stories").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("success_stories").select("*", { count: "exact", head: true }).eq("status", "rejected"),
      ]);

      setStatusCounts({
        all: allCount.count || 0,
        pending: pendingCount.count || 0,
        approved: approvedCount.count || 0,
        rejected: rejectedCount.count || 0,
      });

      // Build query
      let query = supabase
        .from("success_stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user profiles for the stories
      if (data && data.length > 0) {
        const userIds = data.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, email")
          .in("user_id", userIds);

        const storiesWithUserInfo = data.map((story) => {
          const profile = profiles?.find((p) => p.user_id === story.user_id);
          return {
            ...story,
            user_name: profile?.name || "Unknown",
            user_email: profile?.email || "Unknown",
          };
        });

        setStories(storiesWithUserInfo);
      } else {
        setStories([]);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Failed to load success stories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [statusFilter]);

  const handleUpdateStatus = async (storyId: string, status: "approved" | "rejected") => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: Record<string, unknown> = {
        status,
        approved_by: user?.id,
      };

      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("success_stories")
        .update(updateData)
        .eq("id", storyId);

      if (error) throw error;

      toast({
        title: status === "approved" ? "Story Approved" : "Story Rejected",
        description: `The success story has been ${status}.`,
      });

      setSelectedStory(null);
      setAdminNotes("");
      fetchStories();
    } catch (error) {
      console.error("Error updating story:", error);
      toast({
        title: "Error",
        description: "Failed to update story status",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-gold/20 dark:border-gray-700">
      <CardHeader className="border-b border-gold/20 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Success Stories Approval</CardTitle>
              <CardDescription>Review and approve user success stories</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStories}
            disabled={loading}
            className="border-gold/30"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Status Tabs */}
        <div className="mb-4">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="all" className="flex items-center gap-2 text-xs sm:text-sm">
                All <Badge variant="secondary" className="ml-1">{statusCounts.all}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2 text-xs sm:text-sm">
                <Clock className="w-3 h-3" />
                Pending <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-700">{statusCounts.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2 text-xs sm:text-sm">
                <CheckCircle className="w-3 h-3" />
                Approved <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">{statusCounts.approved}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2 text-xs sm:text-sm">
                <XCircle className="w-3 h-3" />
                Rejected <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">{statusCounts.rejected}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stories Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No {statusFilter !== "all" ? statusFilter : ""} success stories found</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Couple</TableHead>
                  <TableHead>Wedding Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{story.user_name}</p>
                        <p className="text-xs text-muted-foreground">{story.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={story.photo_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {story.user_name?.charAt(0)}{story.partner_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{story.user_name} & {story.partner_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(story.wedding_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {story.wedding_location}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(story.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(story.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStory(story)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {story.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => handleUpdateStatus(story.id, "approved")}
                              disabled={processing}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleUpdateStatus(story.id, "rejected")}
                              disabled={processing}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Story Detail Dialog */}
        <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Success Story Details
              </DialogTitle>
            </DialogHeader>

            {selectedStory && (
              <div className="space-y-4">
                {/* Photo */}
                {selectedStory.photo_url && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                      src={selectedStory.photo_url}
                      alt="Wedding"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Couple Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Couple</p>
                    <p className="font-semibold">{selectedStory.user_name} & {selectedStory.partner_name}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedStory.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Wedding Date
                    </p>
                    <p className="font-semibold">{formatDate(selectedStory.wedding_date)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="font-semibold">{selectedStory.wedding_location}</p>
                  </div>
                </div>

                {/* Story */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Their Story</p>
                  <p className="text-foreground leading-relaxed">{selectedStory.story}</p>
                </div>

                {/* Submitted Info */}
                <div className="text-sm text-muted-foreground">
                  Submitted by <span className="font-medium text-foreground">{selectedStory.user_email}</span> on {formatDate(selectedStory.created_at)}
                </div>

                {/* Action Buttons */}
                {selectedStory.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleUpdateStatus(selectedStory.id, "approved")}
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Story
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedStory.id, "rejected")}
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Story
                    </Button>
                  </div>
                )}

                {selectedStory.status !== "pending" && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setSelectedStory(null)}>
                      Close
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SuccessStoriesApproval;
