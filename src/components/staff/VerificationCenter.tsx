import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  User,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Users,
} from 'lucide-react';

interface Profile {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  gender: string;
  photo_url: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  religion: string | null;
  caste: string | null;
  verification_status: string | null;
  horoscope_url: string | null;
  created_at: string;
  admin_notes: string | null;
  user_id: string | null;
}

const VerificationCenter = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [counts, setCounts] = useState({ all: 0, pending: 0, verified: 0, rejected: 0 });

  const fetchCounts = async () => {
    try {
      const [allRes, verifiedRes, pendingRes, rejectedRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).or("verification_status.is.null,verification_status.eq.pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "rejected"),
      ]);
      
      setCounts({
        all: allRes.count || 0,
        verified: verifiedRes.count || 0,
        pending: pendingRes.count || 0,
        rejected: rejectedRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.or('verification_status.is.null,verification_status.eq.pending');
      } else if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchCounts();
  }, [filter]);

  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (!selectedProfile) return;
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: status,
          admin_notes: adminNotes || null,
          phone_verified: status === 'verified',
        })
        .eq('id', selectedProfile.id);

      if (profileError) throw profileError;

      // Create notification for user if they have a user_id
      if (selectedProfile.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: selectedProfile.user_id,
            type: 'verification',
            title: status === 'verified' ? 'Profile Verified!' : 'Verification Rejected',
            message: status === 'verified'
              ? 'Congratulations! Your profile has been verified successfully.'
              : `Your verification request was rejected. ${adminNotes || 'Please contact support for more details.'}`,
            related_profile_id: selectedProfile.id,
          });
      }

      toast({
        title: status === 'verified' ? 'Profile Verified' : 'Profile Rejected',
        description: `Profile has been ${status} successfully.`,
      });

      setSelectedProfile(null);
      setAdminNotes('');
      fetchProfiles();
      fetchCounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-display">Verification Center</CardTitle>
          <Button variant="outline" size="sm" onClick={() => { fetchProfiles(); fetchCounts(); }}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="mb-4 grid grid-cols-4 w-full">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pending</span>
              <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-700">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Verified</span>
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">{counts.verified}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Rejected</span>
              <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700">{counts.rejected}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
              <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {filter !== 'all' ? filter : ''} profiles found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      setSelectedProfile(profile);
                      setAdminNotes(profile.admin_notes || '');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={profile.photo_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(profile.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{profile.name}</h3>
                            {getStatusBadge(profile.verification_status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {profile.profile_id} • {profile.gender}
                            {profile.date_of_birth && ` • ${calculateAge(profile.date_of_birth)} yrs`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {profile.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(profile.created_at)}
                            </span>
                          </div>
                        </div>
                        {(!profile.verification_status || profile.verification_status === 'pending') && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProfile(profile);
                                setAdminNotes('');
                                setTimeout(() => handleVerification('verified'), 100);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProfile(profile);
                                setAdminNotes('');
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </Tabs>
      </CardContent>

      {/* Profile Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedProfile.photo_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedProfile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedProfile.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedProfile.profile_id} • {selectedProfile.gender}
                  </p>
                  {getStatusBadge(selectedProfile.verification_status)}
                </div>
              </div>

              <Separator />

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProfile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {calculateAge(selectedProfile.date_of_birth)} years old
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {[selectedProfile.city, selectedProfile.state].filter(Boolean).join(', ') || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProfile.education || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedProfile.occupation || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {[selectedProfile.religion, selectedProfile.caste].filter(Boolean).join(' - ') || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedProfile.horoscope_url ? 'Horoscope Uploaded' : 'No Horoscope'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Registration Info */}
              <div>
                <h3 className="font-medium mb-2">Registration Info</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Registered: {formatDate(selectedProfile.created_at)}</p>
                </div>
              </div>

              {/* Admin Notes */}
              {(!selectedProfile.verification_status || selectedProfile.verification_status === 'pending') && (
                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes for this verification (optional)"
                    rows={3}
                  />
                </div>
              )}

              {selectedProfile.admin_notes && selectedProfile.verification_status !== 'pending' && (
                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedProfile.admin_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {(!selectedProfile.verification_status || selectedProfile.verification_status === 'pending') && (
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerification('verified')}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Profile
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleVerification('rejected')}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VerificationCenter;