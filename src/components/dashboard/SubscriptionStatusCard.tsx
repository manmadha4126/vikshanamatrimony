import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Star, Calendar, ArrowRight, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, isPast } from 'date-fns';

interface SubscriptionStatusCardProps {
  userId: string;
  isPrime: boolean;
  primeExpiresAt: string | null;
}

interface Subscription {
  id: string;
  plan_name: string;
  plan_type: string;
  plan_category: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  amount: number;
  validity_months: number | null;
}

const SubscriptionStatusCard = ({ userId, isPrime, primeExpiresAt }: SubscriptionStatusCardProps) => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('prime_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const calculateDaysRemaining = () => {
    const expiryDate = subscription?.expires_at || primeExpiresAt;
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    if (isPast(expiry)) return 0;
    
    return differenceInDays(expiry, new Date());
  };

  const calculateProgress = () => {
    if (!subscription?.started_at || !subscription?.expires_at) return 0;
    
    const start = new Date(subscription.started_at);
    const end = new Date(subscription.expires_at);
    const now = new Date();
    
    const totalDays = differenceInDays(end, start);
    const elapsed = differenceInDays(now, start);
    
    if (elapsed < 0) return 0;
    if (elapsed > totalDays) return 100;
    
    return Math.round((elapsed / totalDays) * 100);
  };

  const daysRemaining = calculateDaysRemaining();
  const progress = calculateProgress();

  if (loading) {
    return (
      <Card className="shadow-card animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // No subscription - show upgrade prompt
  if (!subscription && !isPrime) {
    return (
      <Card className="shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get dedicated matchmaking support and find your perfect match faster
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">Dedicated RM</Badge>
                    <Badge variant="outline" className="text-xs">Handpicked Matches</Badge>
                    <Badge variant="outline" className="text-xs">Priority Support</Badge>
                  </div>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 whitespace-nowrap"
                onClick={() => navigate('/assisted-subscription')}
              >
                View Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Has active subscription
  if (subscription?.status === 'active' || isPrime) {
    return (
      <Card className="shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Your Subscription
              </CardTitle>
              <Badge className={`${getStatusColor(subscription?.status || 'active')} text-white flex items-center gap-1`}>
                {getStatusIcon(subscription?.status || 'active')}
                {(subscription?.status || 'active').charAt(0).toUpperCase() + (subscription?.status || 'active').slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{subscription?.plan_name || 'Prime Member'}</h4>
                  <p className="text-sm text-muted-foreground">{subscription?.plan_category || 'Premium'} Plan</p>
                </div>
              </div>
              
              {(subscription?.expires_at || primeExpiresAt) && (
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Expires: {format(new Date(subscription?.expires_at || primeExpiresAt!), 'MMM dd, yyyy')}</span>
                  </div>
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {daysRemaining} days remaining
                    </p>
                  )}
                  {daysRemaining === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                      Expires today!
                    </p>
                  )}
                </div>
              )}
            </div>

            {subscription?.started_at && subscription?.expires_at && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subscription Progress</span>
                  <span>{100 - progress}% remaining</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/assisted-subscription')}
              >
                Upgrade Plan
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Pending subscription
  if (subscription?.status === 'pending') {
    return (
      <Card className="shadow-card overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-lg">{subscription.plan_name}</h3>
                    <Badge className="bg-yellow-500 text-white">Pending Verification</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your payment is being verified. This usually takes 1-2 business hours.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Amount: ₹{subscription.amount.toLocaleString('en-IN')} • {subscription.validity_months} months
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/assisted-subscription')}
              >
                View Plans
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return null;
};

export default SubscriptionStatusCard;
