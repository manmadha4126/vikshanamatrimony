import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Crown, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  IndianRupee,
  Sparkles
} from 'lucide-react';

interface Subscription {
  id: string;
  plan_name: string;
  plan_type: string;
  plan_category: string;
  amount: number;
  validity_months: number | null;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface SubscriptionHistoryProps {
  userId: string;
}

type CategoryFilter = 'all' | 'prime' | 'assisted';

const SubscriptionHistory = ({ userId }: SubscriptionHistoryProps) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('prime_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('plan_category', categoryFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSubscriptions();
    }
  }, [userId, categoryFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1">
            <Clock className="w-3 h-3" />
            Under Verification
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 gap-1">
            <Calendar className="w-3 h-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'prime') {
      return <Crown className="w-4 h-4 text-yellow-600" />;
    }
    return <Users className="w-4 h-4 text-purple-600" />;
  };

  const getCategoryDescription = (category: string) => {
    if (category === 'prime') {
      return 'View best matched profiles, phone numbers, messages, horoscopes & extra benefits';
    }
    return 'Direct assistance from relationship managers for personalized matchmaking';
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const pendingSubscriptions = subscriptions.filter(s => s.status === 'pending');

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-gold/20 dark:border-gray-700">
      <CardHeader className="border-b border-gold/20 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-gold/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Subscription History</CardTitle>
              <CardDescription>View all your Prime & Assisted Matrimony subscriptions</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
            disabled={loading}
            className="border-gold/30"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Active Subscriptions</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{activeSubscriptions.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Verification</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingSubscriptions.length}</p>
          </div>
        </div>

        {/* Category Filter */}
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}>
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Plans</TabsTrigger>
            <TabsTrigger value="prime" className="text-xs sm:text-sm gap-1">
              <Crown className="w-3 h-3" />
              Prime
            </TabsTrigger>
            <TabsTrigger value="assisted" className="text-xs sm:text-sm gap-1">
              <Users className="w-3 h-3" />
              Assisted
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Subscriptions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No Subscriptions Yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Upgrade to Prime or Assisted Matrimony services to unlock premium features
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={`rounded-lg border p-4 transition-all ${
                    subscription.status === 'active' 
                      ? 'bg-gradient-to-br from-primary/5 to-gold/5 border-primary/30' 
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        subscription.plan_category === 'prime' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/50' 
                          : 'bg-purple-100 dark:bg-purple-900/50'
                      }`}>
                        {getCategoryIcon(subscription.plan_category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground">{subscription.plan_name}</h4>
                          {subscription.status === 'active' && (
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {subscription.plan_category} • {subscription.plan_type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md">
                          {getCategoryDescription(subscription.plan_category)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-0.5">
                        {formatCurrency(subscription.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Validity</p>
                      <p className="font-medium">{subscription.validity_months || '-'} months</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {subscription.status === 'active' ? 'Started' : 'Submitted'}
                      </p>
                      <p className="font-medium">
                        {formatDate(subscription.status === 'active' ? subscription.started_at : subscription.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {subscription.status === 'active' ? 'Expires' : 'Status'}
                      </p>
                      <p className="font-medium">
                        {subscription.status === 'active' 
                          ? formatDate(subscription.expires_at)
                          : subscription.status === 'pending' 
                            ? 'Awaiting approval'
                            : '-'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionHistory;
