import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, HeartOff, Check, X, Loader2, Clock, CheckCircle, XCircle, MessageCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  profile_id: string | null;
  user_id?: string | null;
  height: string | null;
  religion: string | null;
  employment_type: string | null;
}

interface Interest {
  id: string;
  from_user_id: string;
  to_profile_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

interface InterestsSectionProps {
  userId: string;
  profileId: string;
  onMessageClick?: (userId: string, profileId: string, name: string) => void;
}

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

const InterestsSection = ({ userId, profileId, onMessageClick }: InterestsSectionProps) => {
  const [receivedInterests, setReceivedInterests] = useState<Interest[]>([]);
  const [sentInterests, setSentInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [receivedFilter, setReceivedFilter] = useState<StatusFilter>('all');
  const [sentFilter, setSentFilter] = useState<StatusFilter>('all');
  const { toast } = useToast();

  const fetchInterests = async () => {
    setLoading(true);
    try {
      // Fetch received interests
      const { data: received, error: receivedError } = await supabase
        .from('interests')
        .select('*')
        .eq('to_profile_id', profileId)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      if (received && received.length > 0) {
        const fromUserIds = received.map(i => i.from_user_id);
        
        const { data: profilesByUserId } = await supabase
          .from('profiles')
          .select('id, name, photo_url, date_of_birth, city, state, education, occupation, profile_id, user_id, height, religion, employment_type')
          .in('user_id', fromUserIds);

        const receivedWithProfiles = received.map(interest => ({
          ...interest,
          profile: profilesByUserId?.find(p => p.user_id === interest.from_user_id)
        }));
        
        setReceivedInterests(receivedWithProfiles);
      } else {
        setReceivedInterests([]);
      }

      // Fetch sent interests
      const { data: sent, error: sentError } = await supabase
        .from('interests')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      if (sent && sent.length > 0) {
        const toProfileIds = sent.map(i => i.to_profile_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url, date_of_birth, city, state, education, occupation, profile_id, user_id, height, religion, employment_type')
          .in('id', toProfileIds);

        const sentWithProfiles = sent.map(interest => ({
          ...interest,
          profile: profiles?.find(p => p.id === interest.to_profile_id)
        }));
        setSentInterests(sentWithProfiles);
      } else {
        setSentInterests([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch interests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && profileId) {
      fetchInterests();
    }
  }, [userId, profileId]);

  const handleAccept = async (interestId: string) => {
    setProcessingId(interestId);
    try {
      const { error } = await supabase
        .from('interests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', interestId);

      if (error) throw error;

      // Update local state immediately for better UX
      setReceivedInterests(prev => 
        prev.map(i => i.id === interestId ? { ...i, status: 'accepted' } : i)
      );

      toast({
        title: "Interest Accepted",
        description: "You can now message this profile.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to accept interest",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (interestId: string) => {
    setProcessingId(interestId);
    try {
      const { error } = await supabase
        .from('interests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', interestId);

      if (error) throw error;

      setReceivedInterests(prev => 
        prev.map(i => i.id === interestId ? { ...i, status: 'rejected' } : i)
      );

      toast({
        title: "Interest Declined",
        description: "You have declined the interest request.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to decline interest",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filterInterests = (interests: Interest[], filter: StatusFilter) => {
    if (filter === 'all') return interests;
    return interests.filter(i => i.status === filter);
  };

  const getFilterCount = (interests: Interest[], filter: StatusFilter) => {
    if (filter === 'all') return interests.length;
    return interests.filter(i => i.status === filter).length;
  };

  // New horizontal card design matching reference
  const InterestCard = ({ interest, type }: { interest: Interest; type: 'received' | 'sent' }) => {
    const profile = interest.profile;
    const isProcessing = processingId === interest.id;
    
    // Always show profile name and details without any restrictions
    const displayName = profile?.name || 'Profile Not Found';
    const displayAge = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;
    const profileIdText = profile?.profile_id || 'N/A';

    const handleMessageClick = () => {
      if (!profile || !onMessageClick) return;
      
      // For received interests: use from_user_id (the person who sent the interest)
      // For sent interests: we need the user_id from the profile we sent interest to
      if (type === 'received') {
        onMessageClick(interest.from_user_id, profile.id, displayName);
      } else {
        // For sent interests, profile.user_id contains the recipient's user_id
        if (profile.user_id) {
          onMessageClick(profile.user_id, profile.id, displayName);
        }
      }
    };

    // Build profile details string - show all details without restrictions
    const detailParts = [
      displayAge ? `${displayAge} yrs` : null,
      profile?.height,
      profile?.religion,
      profile?.education,
      profile?.employment_type || profile?.occupation,
      [profile?.city, profile?.state].filter(Boolean).join(', ')
    ].filter(Boolean);

    const detailsString = detailParts.length > 0 ? detailParts.join(' • ') : 'Details not available';

    // Status text
    const statusText = type === 'sent' 
      ? `You sent an interest – ${formatDate(interest.created_at)}`
      : `Sent you an interest – ${formatDate(interest.created_at)}`;

    return (
      <Card className="hover:shadow-lg transition-all duration-200 border border-border/50 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Left side - Profile Photo */}
            <div className="sm:w-32 md:w-40 flex-shrink-0 bg-muted/30">
              {profile?.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={displayName}
                  className="w-full h-32 sm:h-full object-cover"
                />
              ) : (
                <div className="w-full h-32 sm:h-full min-h-[120px] flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <User className="h-12 w-12 text-primary/30" />
                </div>
              )}
            </div>

            {/* Right side - Profile Details */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Name and Profile ID */}
                <div>
                  <h3 className="font-semibold text-lg text-foreground leading-tight">{displayName}</h3>
                  <p className="text-xs text-muted-foreground">{profileIdText}</p>
                </div>

                {/* Single line profile details */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {detailsString || 'Profile details not available'}
                </p>

                {/* Status text */}
                <div className="flex items-center gap-2">
                  {interest.status === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {interest.status === 'accepted' && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accepted
                    </Badge>
                  )}
                  {interest.status === 'rejected' && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Declined
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {statusText}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
                {/* For Received Interests - Pending */}
                {type === 'received' && interest.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(interest.id)}
                      disabled={isProcessing}
                      className="gap-1.5"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(interest.id)}
                      disabled={isProcessing}
                      className="gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                    <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
                      Interest Pending
                    </span>
                  </>
                )}

                {/* For Accepted Interests - Show Start Conversation Button */}
                {interest.status === 'accepted' && profile && (
                  <Button
                    size="sm"
                    onClick={handleMessageClick}
                    className="gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Start Conversation
                  </Button>
                )}

                {/* For Sent Interests - Pending */}
                {type === 'sent' && interest.status === 'pending' && (
                  <span className="text-xs text-muted-foreground">
                    Waiting for response...
                  </span>
                )}

                {/* For Rejected Interests - No buttons */}
                {interest.status === 'rejected' && (
                  <span className="text-xs text-muted-foreground">
                    This interest was declined
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type, filter }: { type: 'received' | 'sent'; filter: StatusFilter }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        {type === 'received' ? (
          <HeartOff className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Heart className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        {filter === 'all' 
          ? (type === 'received' ? 'No interests received yet' : 'No interests sent yet')
          : `No ${filter} interests`}
      </h3>
      <p className="text-muted-foreground text-sm">
        {filter === 'all' 
          ? (type === 'received' 
              ? 'When someone shows interest in your profile, it will appear here.'
              : 'When you send interest to profiles, they will appear here.')
          : `You don't have any ${filter} interests yet.`}
      </p>
    </div>
  );

  const StatusFilterTabs = ({ 
    filter, 
    setFilter, 
    interests 
  }: { 
    filter: StatusFilter; 
    setFilter: (f: StatusFilter) => void; 
    interests: Interest[] 
  }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {(['all', 'pending', 'accepted', 'rejected'] as StatusFilter[]).map((f) => (
        <Button
          key={f}
          size="sm"
          variant={filter === f ? 'default' : 'outline'}
          onClick={() => setFilter(f)}
          className="gap-1 capitalize"
        >
          {f === 'all' ? 'All' : f === 'accepted' ? 'Accepted' : f === 'rejected' ? 'Declined' : 'Pending'}
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
            {getFilterCount(interests, f)}
          </Badge>
        </Button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingReceived = receivedInterests.filter(i => i.status === 'pending').length;
  const filteredReceivedInterests = filterInterests(receivedInterests, receivedFilter);
  const filteredSentInterests = filterInterests(sentInterests, sentFilter);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="received" className="gap-2">
                Received
                {pendingReceived > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                    {pendingReceived}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              <StatusFilterTabs 
                filter={receivedFilter} 
                setFilter={setReceivedFilter} 
                interests={receivedInterests} 
              />
              {filteredReceivedInterests.length > 0 ? (
                <div className="space-y-4">
                  {filteredReceivedInterests.map(interest => (
                    <InterestCard key={interest.id} interest={interest} type="received" />
                  ))}
                </div>
              ) : (
                <EmptyState type="received" filter={receivedFilter} />
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              <StatusFilterTabs 
                filter={sentFilter} 
                setFilter={setSentFilter} 
                interests={sentInterests} 
              />
              {filteredSentInterests.length > 0 ? (
                <div className="space-y-4">
                  {filteredSentInterests.map(interest => (
                    <InterestCard key={interest.id} interest={interest} type="sent" />
                  ))}
                </div>
              ) : (
                <EmptyState type="sent" filter={sentFilter} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterestsSection;
