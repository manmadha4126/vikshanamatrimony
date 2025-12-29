import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, HeartOff, Check, X, Loader2, User, Clock, CheckCircle, XCircle } from 'lucide-react';
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
}

const InterestsSection = ({ userId, profileId }: InterestsSectionProps) => {
  const [receivedInterests, setReceivedInterests] = useState<Interest[]>([]);
  const [sentInterests, setSentInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInterests = async () => {
    setLoading(true);
    try {
      // Fetch received interests (where to_profile_id = current user's profile id)
      const { data: received, error: receivedError } = await supabase
        .from('interests')
        .select('*')
        .eq('to_profile_id', profileId)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Get profile details for received interests
      if (received && received.length > 0) {
        const fromUserIds = received.map(i => i.from_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url, date_of_birth, city, state, education, occupation, profile_id, user_id')
          .in('user_id', fromUserIds);

        const receivedWithProfiles = received.map(interest => ({
          ...interest,
          profile: profiles?.find(p => p.user_id === interest.from_user_id)
        }));
        setReceivedInterests(receivedWithProfiles);
      } else {
        setReceivedInterests([]);
      }

      // Fetch sent interests (where from_user_id = current user)
      const { data: sent, error: sentError } = await supabase
        .from('interests')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Get profile details for sent interests
      if (sent && sent.length > 0) {
        const toProfileIds = sent.map(i => i.to_profile_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, photo_url, date_of_birth, city, state, education, occupation, profile_id')
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

      toast({
        title: "Interest Accepted",
        description: "You have accepted the interest request.",
      });
      fetchInterests();
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

      toast({
        title: "Interest Declined",
        description: "You have declined the interest request.",
      });
      fetchInterests();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Declined</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const InterestCard = ({ interest, type }: { interest: Interest; type: 'received' | 'sent' }) => {
    const profile = interest.profile;
    if (!profile) return null;

    const age = calculateAge(profile.date_of_birth);
    const isProcessing = processingId === interest.id;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={profile.photo_url || ''} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{profile.name}</h3>
                {profile.profile_id && (
                  <span className="text-xs text-muted-foreground">({profile.profile_id})</span>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                {age && <p>{age} years old</p>}
                {(profile.city || profile.state) && (
                  <p>{[profile.city, profile.state].filter(Boolean).join(', ')}</p>
                )}
                {profile.education && <p>{profile.education}</p>}
                {profile.occupation && <p>{profile.occupation}</p>}
              </div>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {getStatusBadge(interest.status)}
                <span className="text-xs text-muted-foreground">
                  {formatDate(interest.created_at)}
                </span>
              </div>
            </div>

            {type === 'received' && interest.status === 'pending' && (
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(interest.id)}
                  disabled={isProcessing}
                  className="gap-1"
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
                  className="gap-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Decline
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: 'received' | 'sent' }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        {type === 'received' ? (
          <HeartOff className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Heart className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        {type === 'received' ? 'No interests received yet' : 'No interests sent yet'}
      </h3>
      <p className="text-muted-foreground text-sm">
        {type === 'received' 
          ? 'When someone shows interest in your profile, it will appear here.'
          : 'When you send interest to profiles, they will appear here.'}
      </p>
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

            <TabsContent value="received" className="space-y-3">
              {receivedInterests.length > 0 ? (
                receivedInterests.map(interest => (
                  <InterestCard key={interest.id} interest={interest} type="received" />
                ))
              ) : (
                <EmptyState type="received" />
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-3">
              {sentInterests.length > 0 ? (
                sentInterests.map(interest => (
                  <InterestCard key={interest.id} interest={interest} type="sent" />
                ))
              ) : (
                <EmptyState type="sent" />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterestsSection;
