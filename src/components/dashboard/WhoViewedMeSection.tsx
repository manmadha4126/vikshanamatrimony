import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, GraduationCap, Briefcase, Calendar, Heart, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileViewer {
  id: string;
  viewer_id: string;
  viewed_at: string;
  viewer?: {
    id: string;
    user_id: string;
    name: string;
    photo_url: string | null;
    city: string | null;
    state: string | null;
    education: string | null;
    occupation: string | null;
    date_of_birth: string | null;
    height: string | null;
  };
}

interface WhoViewedMeSectionProps {
  profileId: string;
  userId: string;
  onSendInterest?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
}

const WhoViewedMeSection = ({ profileId, userId, onSendInterest, onMessage }: WhoViewedMeSectionProps) => {
  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatViewedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const fetchViewers = async () => {
    try {
      setLoading(true);

      // Get total count
      const { count, error: countError } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewed_profile_id", profileId);

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Get all viewers
      const { data: viewsData, error: viewsError } = await supabase
        .from("profile_views")
        .select("id, viewer_id, viewed_at")
        .eq("viewed_profile_id", profileId)
        .order("viewed_at", { ascending: false });

      if (viewsError) throw viewsError;

      if (viewsData && viewsData.length > 0) {
        const viewerIds = viewsData.map(v => v.viewer_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, user_id, name, photo_url, city, state, education, occupation, date_of_birth, height")
          .in("user_id", viewerIds);

        if (profilesError) throw profilesError;

        const viewsWithProfiles = viewsData.map(view => ({
          ...view,
          viewer: profilesData?.find(p => p.user_id === view.viewer_id)
        }));

        setViewers(viewsWithProfiles);
      } else {
        setViewers([]);
      }
    } catch (error) {
      console.error("Error fetching viewers:", error);
      toast.error("Failed to load profile viewers");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (viewerProfileId: string) => {
    try {
      const { error } = await supabase
        .from("interests")
        .insert({
          from_user_id: userId,
          to_profile_id: viewerProfileId,
          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("You've already sent interest to this profile");
          return;
        }
        throw error;
      }

      toast.success("Interest sent successfully!");
      onSendInterest?.(viewerProfileId);
    } catch (error) {
      console.error("Error sending interest:", error);
      toast.error("Failed to send interest");
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchViewers();
    }
  }, [profileId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Who Viewed My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Who Viewed My Profile
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} {totalCount === 1 ? "person has" : "people have"} viewed your profile
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchViewers}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {viewers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No profile views yet</h3>
            <p className="text-sm max-w-md mx-auto">
              When someone views your profile, they'll appear here. Complete your profile and add photos to attract more visitors!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {viewers.map((view) => {
              const viewer = view.viewer;
              const age = viewer ? calculateAge(viewer.date_of_birth) : null;

              return (
                <div
                  key={view.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  {/* Avatar */}
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage src={viewer?.photo_url || undefined} />
                    <AvatarFallback className="text-lg">
                      {viewer ? getInitials(viewer.name) : "?"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {viewer?.name || "Unknown User"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          {age && <span>{age} yrs</span>}
                          {viewer?.height && (
                            <>
                              <span>•</span>
                              <span>{viewer.height}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="h-3 w-3" />
                        {formatViewedAt(view.viewed_at)}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1">
                      {(viewer?.city || viewer?.state) && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{[viewer.city, viewer.state].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                      {viewer?.education && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{viewer.education}</span>
                        </div>
                      )}
                      {viewer?.occupation && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{viewer.occupation}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {viewer && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleSendInterest(viewer.id)}
                          className="gap-1"
                        >
                          <Heart className="h-4 w-4" />
                          Send Interest
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMessage?.(viewer.id)}
                          className="gap-1"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhoViewedMeSection;
