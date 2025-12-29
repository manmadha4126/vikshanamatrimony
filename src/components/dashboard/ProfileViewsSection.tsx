import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_at: string;
  viewer?: {
    name: string;
    photo_url: string | null;
    city: string | null;
  };
}

interface ProfileViewsSectionProps {
  profileId: string;
}

const ProfileViewsSection = ({ profileId }: ProfileViewsSectionProps) => {
  const [viewCount, setViewCount] = useState(0);
  const [recentViewers, setRecentViewers] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const fetchProfileViews = async () => {
    try {
      setLoading(true);
      
      // Get total view count
      const { count, error: countError } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("viewed_profile_id", profileId);

      if (countError) throw countError;
      setViewCount(count || 0);

      // Get recent viewers with their profile info
      const { data: viewsData, error: viewsError } = await supabase
        .from("profile_views")
        .select("id, viewer_id, viewed_at")
        .eq("viewed_profile_id", profileId)
        .order("viewed_at", { ascending: false })
        .limit(5);

      if (viewsError) throw viewsError;

      if (viewsData && viewsData.length > 0) {
        // Get viewer profiles
        const viewerIds = viewsData.map(v => v.viewer_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, name, photo_url, city")
          .in("user_id", viewerIds);

        if (profilesError) throw profilesError;

        const viewsWithProfiles = viewsData.map(view => ({
          ...view,
          viewer: profilesData?.find(p => p.user_id === view.viewer_id)
        }));

        setRecentViewers(viewsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching profile views:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfileViews();
    }
  }, [profileId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Profile Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Profile Views
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* View Count Stats */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-primary/5 rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{viewCount}</p>
            <p className="text-sm text-muted-foreground">Total profile views</p>
          </div>
          {viewCount > 0 && (
            <div className="ml-auto flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Active</span>
            </div>
          )}
        </div>

        {/* Recent Viewers */}
        {recentViewers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Viewers</h4>
            <div className="space-y-3">
              {recentViewers.map((view) => (
                <div key={view.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={view.viewer?.photo_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {view.viewer ? getInitials(view.viewer.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {view.viewer?.name || "Someone"}
                    </p>
                    {view.viewer?.city && (
                      <p className="text-xs text-muted-foreground truncate">
                        {view.viewer.city}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(view.viewed_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewCount === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No profile views yet</p>
            <p className="text-xs mt-1">Complete your profile to attract more visitors</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileViewsSection;
