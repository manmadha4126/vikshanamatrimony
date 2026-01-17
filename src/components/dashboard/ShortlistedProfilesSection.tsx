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
  const [showAll, setShowAll] = useState(false);
  
  const INITIAL_DISPLAY_COUNT = 6;

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

  const displayedProfiles = showAll ? shortlistedProfiles : shortlistedProfiles.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = shortlistedProfiles.length > INITIAL_DISPLAY_COUNT;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
            <Heart className="h-4 w-4 lg:h-5 lg:w-5 text-primary fill-primary" />
            <span className="hidden sm:inline">Shortlisted Profiles</span>
            <span className="sm:hidden">Shortlisted</span>
            <span className="text-xs lg:text-sm font-normal text-muted-foreground">
              ({shortlistedProfiles.length})
            </span>
          </CardTitle>
          {hasMore && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {shortlistedProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No profiles shortlisted yet</p>
            <p className="text-sm mt-1">Save profiles you're interested in for later review</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-4">
            {displayedProfiles.map((item) => {
              const profile = item.profile;
              const age = calculateAge(profile.date_of_birth);
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => onViewProfile?.(profile.id)}>
                  <div className="relative">
                    <div className="aspect-square bg-muted">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="h-12 w-12 lg:h-16 lg:w-16">
                            <AvatarFallback className="text-lg lg:text-xl">
                              {getInitials(profile.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromShortlist(item.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardContent className="p-1.5 lg:p-2">
                    <h3 className="font-medium text-[10px] lg:text-xs truncate">{profile.name.split(' ')[0]}</h3>
                    <p className="text-[8px] lg:text-[10px] text-muted-foreground truncate">
                      {age ? `${age} yrs` : ""}{profile.city ? `, ${profile.city}` : ""}
                    </p>
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
