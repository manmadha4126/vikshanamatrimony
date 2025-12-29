import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Trash2, Eye, MapPin, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShortlistedProfile {
  id: string;
  profile_id: string;
  created_at: string;
  profile: {
    id: string;
    name: string;
    photo_url: string | null;
    date_of_birth: string | null;
    city: string | null;
    state: string | null;
    education: string | null;
    occupation: string | null;
    height: string | null;
  };
}

interface ShortlistedProfilesSectionProps {
  userId: string;
  onViewProfile?: (profileId: string) => void;
}

const ShortlistedProfilesSection = ({ userId, onViewProfile }: ShortlistedProfilesSectionProps) => {
  const [shortlistedProfiles, setShortlistedProfiles] = useState<ShortlistedProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchShortlistedProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("shortlisted_profiles")
        .select(`
          id,
          profile_id,
          created_at,
          profile:profiles!shortlisted_profiles_profile_id_fkey (
            id,
            name,
            photo_url,
            date_of_birth,
            city,
            state,
            education,
            occupation,
            height
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out any entries where profile data might be null
      const validProfiles = (data || []).filter(item => item.profile) as unknown as ShortlistedProfile[];
      setShortlistedProfiles(validProfiles);
    } catch (error) {
      console.error("Error fetching shortlisted profiles:", error);
      toast.error("Failed to load shortlisted profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShortlist = async (shortlistId: string) => {
    try {
      const { error } = await supabase
        .from("shortlisted_profiles")
        .delete()
        .eq("id", shortlistId);

      if (error) throw error;

      setShortlistedProfiles(prev => prev.filter(p => p.id !== shortlistId));
      toast.success("Removed from shortlist");
    } catch (error) {
      console.error("Error removing from shortlist:", error);
      toast.error("Failed to remove from shortlist");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchShortlistedProfiles();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Shortlisted Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary fill-primary" />
          Shortlisted Profiles
          <span className="text-sm font-normal text-muted-foreground">
            ({shortlistedProfiles.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shortlistedProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No profiles shortlisted yet</p>
            <p className="text-sm mt-1">Save profiles you're interested in for later review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortlistedProfiles.map((item) => {
              const profile = item.profile;
              const age = calculateAge(profile.date_of_birth);
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-muted">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl">
                              {getInitials(profile.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFromShortlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {age ? `${age} yrs` : ""} {profile.height ? `• ${profile.height}` : ""}
                    </p>
                    
                    {(profile.city || profile.state) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {[profile.city, profile.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    
                    {profile.education && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <GraduationCap className="h-3 w-3" />
                        <span className="truncate">{profile.education}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewProfile?.(profile.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromShortlist(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShortlistedProfilesSection;
