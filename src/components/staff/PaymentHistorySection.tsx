import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  TrendingUp
} from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  profile_id: string | null;
  plan_name: string;
  plan_type: string;
  plan_category: string;
  amount: number;
  validity_months: number | null;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  profiles?: {
    name: string;
    email: string;
    phone: string;
    profile_id: string | null;
  };
}

type StatusFilter = 'all' | 'active' | 'pending' | 'rejected' | 'expired';

const PaymentHistorySection = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    expired: 0
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const itemsPerPage = 10;

  const fetchStatusCounts = async () => {
    try {
      const [allCount, activeCount, pendingCount, rejectedCount, expiredCount] = await Promise.all([
        supabase.from('prime_subscriptions').select('*', { count: 'exact', head: true }),
        supabase.from('prime_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('prime_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('prime_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('prime_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      ]);

      setStatusCounts({
        all: allCount.count || 0,
        active: activeCount.count || 0,
        pending: pendingCount.count || 0,
        rejected: rejectedCount.count || 0,
        expired: expiredCount.count || 0
      });

      // Calculate total revenue from active subscriptions
      const { data: activeSubscriptions } = await supabase
        .from('prime_subscriptions')
        .select('amount')
        .eq('status', 'active');
      
      const revenue = activeSubscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from('prime_subscriptions')
        .select(`
          *,
          profiles!prime_subscriptions_profile_id_fkey (
            name,
            email,
            phone,
            profile_id
          )
        `, { count: 'exact' });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        // Search by profile info will be done client-side after fetch
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      let filteredData = data || [];
      
      // Client-side search filtering
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filteredData = filteredData.filter(sub => 
          sub.profiles?.name?.toLowerCase().includes(search) ||
          sub.profiles?.email?.toLowerCase().includes(search) ||
          sub.profiles?.profile_id?.toLowerCase().includes(search) ||
          sub.plan_name?.toLowerCase().includes(search)
        );
      }
      
      setSubscriptions(filteredData);
      setTotalCount(count || 0);
      await fetchStatusCounts();
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchSubscriptions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
            Pending
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg border-gold/20 dark:border-gray-700">
      <CardHeader className="border-b border-gold/20 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-gold/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>All online payment transactions</CardDescription>
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
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Transactions</span>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{statusCounts.all}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Active</span>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{statusCounts.active}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Pending</span>
            </div>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{statusCounts.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">Rejected</span>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{statusCounts.rejected}</p>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-gold/10 dark:from-primary/20 dark:to-gold/20 rounded-lg p-3 border border-primary/30 dark:border-primary/50 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary dark:text-primary">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-primary dark:text-primary mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, profile ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setCurrentPage(1); }}>
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
            <h3 className="font-semibold text-foreground mb-2">No Transactions Found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {searchQuery ? 'Try adjusting your search query' : 'No payment transactions yet'}
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[500px]">
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
                    <div className="flex items-start justify-between gap-3 flex-wrap">
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
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {subscription.plan_category} • {subscription.plan_type}
                          </p>
                          {subscription.profiles && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p><strong>User:</strong> {subscription.profiles.name}</p>
                              <p><strong>Email:</strong> {subscription.profiles.email}</p>
                              <p><strong>Profile ID:</strong> {subscription.profiles.profile_id || '-'}</p>
                            </div>
                          )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistorySection;
