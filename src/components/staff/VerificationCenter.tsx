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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
} from 'lucide-react';

interface VerificationRequest {
  id: string;
  profile_id: string;
  user_id: string;
  status: string;
  requested_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  profile: {
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
  };
}

const VerificationCenter = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('verification_requests')
        .select(`
          *,
          profile:profiles!verification_requests_profile_id_fkey (
            id, profile_id, name, email, phone, gender, photo_url,
            date_of_birth, city, state, education, occupation,
            religion, caste, verification_status, horoscope_url
          )
        `)
        .order('requested_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (!selectedRequest) return;
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          admin_notes: adminNotes || null,
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          verification_status: status,
          phone_verified: status === 'verified',
        })
        .eq('id', selectedRequest.profile_id);

      if (profileError) throw profileError;

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.user_id,
          type: 'verification',
          title: status === 'verified' ? 'Profile Verified!' : 'Verification Rejected',
          message: status === 'verified'
            ? 'Congratulations! Your profile has been verified successfully.'
            : `Your verification request was rejected. ${adminNotes || 'Please contact support for more details.'}`,
          related_profile_id: selectedRequest.profile_id,
        });

      toast({
        title: status === 'verified' ? 'Profile Verified' : 'Request Rejected',
        description: `Profile has been ${status} successfully.`,
      });

      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
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

  const getStatusBadge = (status: string) => {
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
          <Button variant="outline" size="sm" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {filter !== 'all' ? filter : ''} verification requests found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => {
                      setSelectedRequest(request);
                      setAdminNotes(request.admin_notes || '');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={request.profile.photo_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(request.profile.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{request.profile.name}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.profile.profile_id} • {request.profile.gender}
                            {request.profile.date_of_birth && ` • ${calculateAge(request.profile.date_of_birth)} yrs`}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {request.profile.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(request.requested_at)}
                            </span>
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request);
                                handleVerification('verified');
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequest(request);
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
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedRequest.profile.photo_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getInitials(selectedRequest.profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selectedRequest.profile.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedRequest.profile.profile_id} • {selectedRequest.profile.gender}
                  </p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <Separator />

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRequest.profile.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRequest.profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {calculateAge(selectedRequest.profile.date_of_birth)} years old
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {[selectedRequest.profile.city, selectedRequest.profile.state].filter(Boolean).join(', ') || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRequest.profile.education || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedRequest.profile.occupation || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {[selectedRequest.profile.religion, selectedRequest.profile.caste].filter(Boolean).join(' - ') || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedRequest.profile.horoscope_url ? 'Horoscope Uploaded' : 'No Horoscope'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Request Details */}
              <div>
                <h3 className="font-medium mb-2">Request Info</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Requested: {formatDate(selectedRequest.requested_at)}</p>
                  {selectedRequest.processed_at && (
                    <p>Processed: {formatDate(selectedRequest.processed_at)}</p>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.status === 'pending' && (
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

              {selectedRequest.admin_notes && selectedRequest.status !== 'pending' && (
                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    {selectedRequest.admin_notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
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
