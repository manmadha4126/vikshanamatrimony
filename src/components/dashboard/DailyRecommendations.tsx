import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProfileCard from './ProfileCard';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  profile_id: string | null;
  name: string;
  photo_url: string | null;
  date_of_birth: string | null;
  height: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  verification_status: string | null;
  gender: string;
}

interface DailyRecommendationsProps {
  userGender: string;
  userId: string;
}

const DailyRecommendations = ({ userGender, userId }: DailyRecommendationsProps) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  const targetGender = userGender?.toLowerCase() === 'male' ? 'Female' : 'Male';

  useEffect(() => {
    fetchRecommendations();
    fetchShortlistedIds();
  }, [userGender]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, profile_id, name, photo_url, date_of_birth, height, city, state, education, occupation, verification_status, gender')
        .eq('is_complete', true)
        .eq('gender', targetGender)
        .neq('user_id', userId)
        .limit(8);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlistedIds = async () => {
    try {
      const { data, error } = await supabase
        .from('shortlisted_profiles')
        .select('profile_id')
        .eq('user_id', userId);

      if (!error && data) {
        setShortlistedIds(data.map(s => s.profile_id));
      }
    } catch (error) {
      console.error('Error fetching shortlisted:', error);
    }
  };

  const handleSendInterest = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('interests')
        .insert({
          from_user_id: userId,
          to_profile_id: profileId,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Sent",
            description: "You have already sent interest to this profile.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Interest Sent!",
          description: "Your interest has been sent successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShortlist = async (profileId: string) => {
    const isShortlisted = shortlistedIds.includes(profileId);

    try {
      if (isShortlisted) {
        const { error } = await supabase
          .from('shortlisted_profiles')
          .delete()
          .eq('user_id', userId)
          .eq('profile_id', profileId);

        if (error) throw error;
        setShortlistedIds(prev => prev.filter(id => id !== profileId));
        toast({ title: "Removed from shortlist" });
      } else {
        const { error } = await supabase
          .from('shortlisted_profiles')
          .insert({ user_id: userId, profile_id: profileId });

        if (error) throw error;
        setShortlistedIds(prev => [...prev, profileId]);
        toast({ title: "Added to shortlist" });
      }
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-xl">Daily Recommendations</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchRecommendations}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/matches')}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-5 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recommendations available at the moment.</p>
              <Button variant="outline" className="mt-4" onClick={fetchRecommendations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isShortlisted={shortlistedIds.includes(profile.id)}
                  onViewProfile={() => navigate(`/dashboard/profile/${profile.profile_id}`)}
                  onSendInterest={() => handleSendInterest(profile.id)}
                  onShortlist={() => handleShortlist(profile.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyRecommendations;
