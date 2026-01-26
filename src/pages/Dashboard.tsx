import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileSidebar from '@/components/dashboard/ProfileSidebar';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import AccountTypeSection from '@/components/dashboard/AccountTypeSection';
import ProfileCompletionSection from '@/components/dashboard/ProfileCompletionSection';
import DailyRecommendations from '@/components/dashboard/DailyRecommendations';
import MatchesPreview from '@/components/dashboard/MatchesPreview';
import ShortlistedProfilesSection from '@/components/dashboard/ShortlistedProfilesSection';
import ProfileViewsSection from '@/components/dashboard/ProfileViewsSection';
import WhoViewedMeSection from '@/components/dashboard/WhoViewedMeSection';
import AssistedServiceSection from '@/components/dashboard/AssistedServiceSection';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';
import SubscriptionHistory from '@/components/dashboard/SubscriptionHistory';
import SuccessStoriesSection from '@/components/dashboard/SuccessStoriesSection';
import PartnerPreferencesSection from '@/components/dashboard/PartnerPreferencesSection';
import EditProfileSection from '@/components/dashboard/EditProfileSection';
import ViewProfileSection from '@/components/dashboard/ViewProfileSection';
import InterestsSection from '@/components/dashboard/InterestsSection';
import MessagesSection from '@/components/dashboard/MessagesSection';
import NotificationsSection from '@/components/dashboard/NotificationsSection';
import MatchesSection from '@/components/dashboard/MatchesSection';
import ProfileViewModal from '@/components/dashboard/ProfileViewModal';
import MatchAssistantChat from '@/components/dashboard/MatchAssistantChat';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search as SearchIcon, Filter, Heart, User } from 'lucide-react';
import {
  heightOptions,
  maritalStatusOptions,
  religionOptions,
  educationOptions,
  stateOptions,
} from '@/data/registrationOptions';

type DashboardView = 'home' | 'preferences' | 'search' | 'edit-profile' | 'view-profile' | 'interests' | 'messages' | 'notifications' | 'matches' | 'who-viewed-me';

interface MessageRecipient {
  recipientUserId: string;
  recipientProfileId: string;
  recipientName: string;
}

interface SearchFilters {
  age_from: number;
  age_to: number;
  height_from: string;
  height_to: string;
  marital_status: string[];
  religion: string[];
  education: string[];
  residing_state: string[];
}

interface MatchedProfile {
  id: string;
  name: string;
  photo_url: string | null;
  profile_id: string | null;
  date_of_birth: string | null;
  height: string | null;
  education: string | null;
  occupation: string | null;
  city: string | null;
  state: string | null;
  religion: string | null;
}

const defaultFilters: SearchFilters = {
  age_from: 22,
  age_to: 35,
  height_from: '5\'0" (152 cm)',
  height_to: '6\'0" (183 cm)',
  marital_status: [],
  religion: [],
  education: [],
  residing_state: [],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, refreshProfile, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<DashboardView>('home');
  
  // Search state
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [matchedProfiles, setMatchedProfiles] = useState<MatchedProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<MessageRecipient | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.id && activeView === 'search') {
      loadSavedPreferences();
    }
  }, [user?.id, activeView]);

  const loadSavedPreferences = async () => {
    try {
      const { data } = await supabase
        .from('partner_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (data) {
        setFilters({
          age_from: data.age_from || 22,
          age_to: data.age_to || 35,
          height_from: data.height_from || '5\'0" (152 cm)',
          height_to: data.height_to || '6\'0" (183 cm)',
          marital_status: data.marital_status || [],
          religion: data.religion || [],
          education: data.education || [],
          residing_state: data.residing_state || [],
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveAndSearch = async () => {
    if (!user?.id) return;
    
    setIsSearching(true);
    try {
      await supabase
        .from('partner_preferences')
        .upsert({
          user_id: user.id,
          age_from: filters.age_from,
          age_to: filters.age_to,
          height_from: filters.height_from,
          height_to: filters.height_to,
          marital_status: filters.marital_status,
          religion: filters.religion,
          education: filters.education,
          residing_state: filters.residing_state,
        }, { onConflict: 'user_id' });

      let query = supabase
        .from('profiles')
        .select('id, name, photo_url, profile_id, date_of_birth, height, education, occupation, city, state, religion')
        .eq('is_complete', true)
        .neq('gender', profile?.gender || '');

      if (filters.religion.length > 0) {
        query = query.in('religion', filters.religion);
      }
      if (filters.education.length > 0) {
        query = query.in('education', filters.education);
      }
      if (filters.residing_state.length > 0) {
        query = query.in('state', filters.residing_state);
      }
      if (filters.marital_status.length > 0) {
        query = query.in('marital_status', filters.marital_status);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      setMatchedProfiles(data || []);
      setHasSearched(true);
      toast({
        title: "Search Complete",
        description: `Found ${data?.length || 0} matching profiles.`,
      });
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleArrayItem = (key: keyof SearchFilters, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: updated });
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleViewChange = (view: DashboardView) => {
    if (view !== 'messages') {
      setMessageRecipient(null);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMessageClick = (recipientUserId: string, recipientProfileId: string, recipientName: string) => {
    setMessageRecipient({ recipientUserId, recipientProfileId, recipientName });
    setActiveView('messages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProfile = (profileId: string) => {
    setViewingProfileId(profileId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Profile Not Found</h2>
          <p className="text-muted-foreground">Please complete your registration first.</p>
          <button 
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Complete Registration
          </button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        profile={profile ? { ...profile, is_prime: profile.is_prime || false } : null}
        notificationCount={0}
        onSignOut={handleSignOut}
        onSearchClick={() => handleViewChange('search')}
        onPreferencesClick={() => handleViewChange('preferences')}
        onEditProfileClick={() => handleViewChange('edit-profile')}
        onViewProfileClick={() => handleViewChange('view-profile')}
        onHomeClick={() => handleViewChange('home')}
        onInterestsClick={() => handleViewChange('interests')}
        onMessagesClick={() => handleViewChange('messages')}
        onNotificationsClick={() => handleViewChange('notifications')}
        onMatchesClick={() => handleViewChange('matches')}
      />

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 pb-20 lg:pb-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Left Sidebar - Profile */}
          <div className="hidden lg:block flex-shrink-0">
            <ProfileSidebar
              profile={{
                id: profile.id,
                name: profile.name,
                photo_url: profile.photo_url,
                profile_id: profile.profile_id,
                is_prime: profile.is_prime || false,
                verification_status: profile.verification_status,
              }}
              userId={user.id}
              onSignOut={handleSignOut}
              onPreferencesClick={() => handleViewChange('preferences')}
              onEditProfileClick={() => handleViewChange('edit-profile')}
              onViewProfileClick={() => handleViewChange('view-profile')}
              onHomeClick={() => handleViewChange('home')}
              onInterestsClick={() => handleViewChange('interests')}
              onMessagesClick={() => handleViewChange('messages')}
              onNotificationsClick={() => handleViewChange('notifications')}
              onMatchesClick={() => handleViewChange('matches')}
              onWhoViewedMeClick={() => handleViewChange('who-viewed-me')}
              onProfilePhotoUpdated={refreshProfile}
              activeView={activeView}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-4 lg:pb-12 space-y-4 sm:space-y-6">
            {activeView === 'home' && (
              <>
                <AccountTypeSection
                  isPrime={profile.is_prime || false}
                  primeExpiresAt={profile.prime_expires_at}
                  userId={user.id}
                  profileId={profile.id}
                  userName={profile.name}
                />

                <SubscriptionStatusCard
                  userId={user.id}
                  isPrime={profile.is_prime || false}
                  primeExpiresAt={profile.prime_expires_at}
                />

                <ProfileCompletionSection
                  profile={{
                    id: profile.id,
                    phone: profile.phone,
                    phone_verified: profile.phone_verified,
                    about_me: profile.about_me,
                    hobbies: profile.hobbies,
                    horoscope_url: profile.horoscope_url,
                    profile_completion_percentage: profile.profile_completion_percentage,
                    verification_status: profile.verification_status,
                  }}
                  userId={user.id}
                  userName={profile.name}
                  onProfileUpdate={refreshProfile}
                />

                <DailyRecommendations
                  userGender={profile.gender}
                  userId={user.id}
                  userAge={profile.date_of_birth ? Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined}
                  userReligion={profile.religion || undefined}
                  onViewProfile={handleViewProfile}
                  onViewAllClick={() => handleViewChange('matches')}
                />

                <MatchesPreview
                  userId={user.id}
                  userGender={profile.gender}
                  onViewAllClick={() => handleViewChange('matches')}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ShortlistedProfilesSection userId={user.id} onViewProfile={handleViewProfile} />
                  </div>
                  <div>
                    <ProfileViewsSection profileId={profile.id} onViewProfile={handleViewProfile} />
                  </div>
                </div>

                <AssistedServiceSection />

                <SubscriptionHistory userId={user.id} />

                <SuccessStoriesSection userId={user.id} userName={profile.name} />
              </>
            )}

            {activeView === 'preferences' && (
              <PartnerPreferencesSection userId={user.id} />
            )}

            {activeView === 'edit-profile' && (
              <EditProfileSection
                userId={user.id}
                profile={{
                  id: profile.id,
                  name: profile.name,
                  date_of_birth: profile.date_of_birth,
                  height: profile.height,
                  marital_status: profile.marital_status,
                  mother_tongue: profile.mother_tongue,
                  religion: profile.religion,
                  caste: profile.caste,
                  sub_caste: profile.sub_caste,
                  gothram: profile.gothram,
                  star: profile.star,
                  dosham: profile.dosham,
                  education: profile.education,
                  education_detail: profile.education_detail,
                  employment_type: profile.employment_type,
                  occupation: profile.occupation,
                  company_name: profile.company_name,
                  annual_income: profile.annual_income,
                  country: profile.country,
                  state: profile.state,
                  city: profile.city,
                  family_status: profile.family_status,
                  family_type: profile.family_type,
                  about_me: profile.about_me,
                }}
                onProfileUpdate={refreshProfile}
              />
            )}

            {activeView === 'view-profile' && (
              <ViewProfileSection
                profile={{
                  id: profile.id,
                  name: profile.name,
                  profile_id: profile.profile_id,
                  photo_url: profile.photo_url,
                  gender: profile.gender,
                  email: profile.email,
                  phone: profile.phone,
                  date_of_birth: profile.date_of_birth,
                  height: profile.height,
                  marital_status: profile.marital_status,
                  mother_tongue: profile.mother_tongue,
                  religion: profile.religion,
                  caste: profile.caste,
                  sub_caste: profile.sub_caste,
                  gothram: profile.gothram,
                  star: profile.star,
                  dosham: profile.dosham,
                  education: profile.education,
                  education_detail: profile.education_detail,
                  employment_type: profile.employment_type,
                  occupation: profile.occupation,
                  company_name: profile.company_name,
                  annual_income: profile.annual_income,
                  country: profile.country,
                  state: profile.state,
                  city: profile.city,
                  family_status: profile.family_status,
                  family_type: profile.family_type,
                  father_name: (profile as any).father_name || null,
                  father_occupation: (profile as any).father_occupation || null,
                  mother_name: (profile as any).mother_name || null,
                  mother_occupation: (profile as any).mother_occupation || null,
                  siblings: (profile as any).siblings || null,
                  siblings_details: (profile as any).siblings_details || null,
                  about_me: profile.about_me,
                  hobbies: profile.hobbies,
                  horoscope_url: profile.horoscope_url,
                  time_of_birth: (profile as any).time_of_birth || null,
                  birth_country: (profile as any).birth_country || null,
                  birth_state: (profile as any).birth_state || null,
                  birth_city: (profile as any).birth_city || null,
                  chart_style: (profile as any).chart_style || null,
                  horoscope_language: (profile as any).horoscope_language || null,
                  is_prime: profile.is_prime,
                  phone_verified: profile.phone_verified,
                  email_verified: profile.email_verified,
                  verification_status: profile.verification_status,
                  profile_completion_percentage: profile.profile_completion_percentage,
                  updated_at: profile.updated_at,
                  created_at: profile.created_at,
                }}
                currentUserIsPrime={profile.is_prime || false}
              />
            )}

            {activeView === 'interests' && (
              <InterestsSection
                userId={user.id}
                profileId={profile.id}
                onMessageClick={handleMessageClick}
                onViewProfile={(profileId) => setViewingProfileId(profileId)}
              />
            )}

            {activeView === 'messages' && (
              <MessagesSection
                odBCqt={user.id}
                profileId={profile.id}
                userName={profile.name}
                initialRecipient={messageRecipient || undefined}
              />
            )}

            {activeView === 'notifications' && (
              <NotificationsSection userId={user.id} />
            )}

            {activeView === 'matches' && (
              <MatchesSection
                userId={user.id}
                userGender={profile.gender}
                onViewProfile={handleViewProfile}
              />
            )}

            {activeView === 'who-viewed-me' && (
              <WhoViewedMeSection
                profileId={profile.id}
                userId={user.id}
              />
            )}

            {activeView === 'search' && (
              <>
                {/* Search Filters */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" />
                      <CardTitle className="font-display text-lg">Search Preferences</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Age Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Age From</Label>
                        <Select
                          value={filters.age_from.toString()}
                          onValueChange={(v) => setFilters({ ...filters, age_from: parseInt(v) })}
                        >
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                              <SelectItem key={age} value={age.toString()}>{age} yrs</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Age To</Label>
                        <Select
                          value={filters.age_to.toString()}
                          onValueChange={(v) => setFilters({ ...filters, age_to: parseInt(v) })}
                        >
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                              <SelectItem key={age} value={age.toString()}>{age} yrs</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Height Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Height From</Label>
                        <Select
                          value={filters.height_from}
                          onValueChange={(v) => setFilters({ ...filters, height_from: v })}
                        >
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {heightOptions.map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Height To</Label>
                        <Select
                          value={filters.height_to}
                          onValueChange={(v) => setFilters({ ...filters, height_to: v })}
                        >
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {heightOptions.map((h) => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Religion */}
                    <div>
                      <Label className="text-xs">Religion</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {religionOptions.map((r) => (
                          <Badge
                            key={r}
                            variant={filters.religion.includes(r) ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleArrayItem('religion', r)}
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Marital Status */}
                    <div>
                      <Label className="text-xs">Marital Status</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {maritalStatusOptions.map((s) => (
                          <Badge
                            key={s}
                            variant={filters.marital_status.includes(s) ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleArrayItem('marital_status', s)}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <Label className="text-xs">Education</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {educationOptions.slice(0, 8).map((e) => (
                          <Badge
                            key={e}
                            variant={filters.education.includes(e) ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleArrayItem('education', e)}
                          >
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <Label className="text-xs">Residing State</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto">
                        {stateOptions.slice(0, 10).map((s) => (
                          <Badge
                            key={s}
                            variant={filters.residing_state.includes(s) ? 'default' : 'outline'}
                            className="cursor-pointer text-xs"
                            onClick={() => toggleArrayItem('residing_state', s)}
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button onClick={saveAndSearch} disabled={isSearching} className="w-full">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Save & Search'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Search Results */}
                {hasSearched && (
                  <Card className="shadow-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-display text-lg">Matched Profiles</CardTitle>
                        <Badge variant="secondary">{matchedProfiles.length} found</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {matchedProfiles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No profiles match your criteria.</p>
                          <p className="text-sm">Try adjusting your search filters.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {matchedProfiles.map((p) => (
                            <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                              <div className="aspect-[4/3] bg-muted relative">
                                <Avatar className="w-full h-full rounded-none">
                                  <AvatarImage src={p.photo_url || undefined} alt={p.name} className="object-cover" />
                                  <AvatarFallback className="rounded-none text-2xl">
                                    {p.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <CardContent className="p-3">
                                <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {calculateAge(p.date_of_birth)} yrs, {p.height}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {p.education} • {p.occupation}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {p.city}, {p.state}
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                                    View
                                  </Button>
                                  <Button size="sm" className="flex-1 h-7 text-xs">
                                    <Heart className="h-3 w-3 mr-1" />
                                    Interest
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Profile View Modal */}
      <ProfileViewModal
        profileId={viewingProfileId}
        isOpen={!!viewingProfileId}
        onClose={() => setViewingProfileId(null)}
        currentUserIsPrime={profile?.is_prime || false}
      />

      {/* AI Match Assistant Chat */}
      <MatchAssistantChat userName={profile.name} />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeView={activeView} 
        onNavigate={handleViewChange}
        notificationCount={0}
      />

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
