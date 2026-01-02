import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProfileCard from './ProfileCard';
import { ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
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
  religion: string | null;
}

interface DailyRecommendationsProps {
  userGender: string;
  userId: string;
  userAge?: number;
  userReligion?: string;
}

const MAX_DAILY_RECOMMENDATIONS = 10;

const DailyRecommendations = ({ userGender, userId, userAge, userReligion }: DailyRecommendationsProps) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [todaysCount, setTodaysCount] = useState(0);

  const targetGender = userGender?.toLowerCase() === 'male' ? 'Female' : 'Male';

  // Calculate age range based on user's gender and age
  const getAgeRange = () => {
    if (!userAge) return { minAge: 18, maxAge: 50 };
    
    if (userGender?.toLowerCase() === 'male') {
      // Male: show females 1-3 years younger
      return { minAge: userAge - 3, maxAge: userAge - 1 };
    } else {
      // Female: show males 0-3 years older
      return { minAge: userAge, maxAge: userAge + 3 };
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchShortlistedIds();
  }, [userGender, userAge]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check how many recommendations were already shown today
      const { data: shownToday, error: countError } = await supabase
        .from('daily_recommendations')
        .select('profile_id')
        .eq('user_id', userId)
        .eq('shown_date', today);

      if (countError) throw countError;
      
      const alreadyShownIds = shownToday?.map(r => r.profile_id) || [];
      setTodaysCount(alreadyShownIds.length);

      // If already reached limit, show the same profiles from today
      if (alreadyShownIds.length >= MAX_DAILY_RECOMMENDATIONS) {
        const { data: existingProfiles, error: fetchError } = await supabase
          .from('profiles')
          .select('id, profile_id, name, photo_url, date_of_birth, height, city, state, education, occupation, verification_status, gender, religion')
          .in('id', alreadyShownIds);

        if (!fetchError && existingProfiles) {
          setProfiles(existingProfiles);
        }
        setLoading(false);
        return;
      }

      // Calculate age range
      const { minAge, maxAge } = getAgeRange();
      const today_date = new Date();
      const maxDob = new Date(today_date.getFullYear() - minAge, today_date.getMonth(), today_date.getDate()).toISOString().split('T')[0];
      const minDob = new Date(today_date.getFullYear() - maxAge - 1, today_date.getMonth(), today_date.getDate()).toISOString().split('T')[0];

      // Fetch new recommendations excluding already shown
      let query = supabase
        .from('profiles')
        .select('id, profile_id, name, photo_url, date_of_birth, height, city, state, education, occupation, verification_status, gender, religion')
        .eq('is_complete', true)
        .eq('gender', targetGender)
        .neq('user_id', userId);

      // Apply age filter if user age is provided
      if (userAge) {
        query = query.gte('date_of_birth', minDob).lte('date_of_birth', maxDob);
      }

      // Apply religion filter if provided
      if (userReligion) {
        query = query.eq('religion', userReligion);
      }

      // Exclude already shown profiles
      if (alreadyShownIds.length > 0) {
        query = query.not('id', 'in', `(${alreadyShownIds.join(',')})`);
      }

      const remainingSlots = MAX_DAILY_RECOMMENDATIONS - alreadyShownIds.length;
      const { data: newProfiles, error: profilesError } = await query.limit(remainingSlots);

      if (profilesError) throw profilesError;

      // Save new recommendations to daily_recommendations table
      if (newProfiles && newProfiles.length > 0) {
        const recommendationsToInsert = newProfiles.map(profile => ({
          user_id: userId,
          profile_id: profile.id,
          shown_date: today,
        }));

        await supabase
          .from('daily_recommendations')
          .insert(recommendationsToInsert)
          .select();
      }

      // Combine previously shown and new profiles
      if (alreadyShownIds.length > 0) {
        const { data: previousProfiles } = await supabase
          .from('profiles')
          .select('id, profile_id, name, photo_url, date_of_birth, height, city, state, education, occupation, verification_status, gender, religion')
          .in('id', alreadyShownIds);

        setProfiles([...(previousProfiles || []), ...(newProfiles || [])]);
      } else {
        setProfiles(newProfiles || []);
      }
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
