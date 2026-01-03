import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Phone, MessageCircle, Check, Star, Award, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrimeSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  profileId: string;
  userName: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  category: 'support' | 'affluent' | 'till_marry';
  duration: string;
  price: number;
  validity?: string;
  benefits: string[];
  badge?: string;
  highlighted?: boolean;
}

const SUPPORT_PHONE = '7397734496';

const plans: SubscriptionPlan[] = [
  // Support Matrimony
  {
    id: 'support_1m',
    name: 'Support Matrimony',
    category: 'support',
    duration: '1 Month',
    price: 7000,
    benefits: [
      'Dedicated relationship manager',
      'Weekly profile sharing',
      'Selected profiles processed',
      'Feedback updates after each process'
    ]
  },
  {
    id: 'support_3m',
    name: 'Support Matrimony',
    category: 'support',
    duration: '3 Months',
    price: 12000,
    benefits: [
      'Dedicated relationship manager',
      'Weekly profile sharing',
      'Selected profiles processed',
      'Feedback updates after each process'
    ]
  },
  {
    id: 'support_6m',
    name: 'Support Matrimony',
    category: 'support',
    duration: '6 Months',
    price: 18000,
    benefits: [
      'Dedicated relationship manager',
      'Weekly profile sharing',
      'Selected profiles processed',
      'Feedback updates after each process'
    ]
  },
  // Affluent Matrimony
  {
    id: 'affluent_3m',
    name: 'Affluent Matrimony',
    category: 'affluent',
    duration: '3 Months',
    price: 18000,
    validity: '6 Months',
    badge: 'Premium',
    benefits: [
      'Affluent family profiles',
      'Curated weekly matches',
      'Priority processing',
      'Personal enquiry support'
    ]
  },
  {
    id: 'affluent_6m',
    name: 'Affluent Matrimony',
    category: 'affluent',
    duration: '6 Months',
    price: 25000,
    badge: 'Premium',
    benefits: [
      'Affluent family profiles',
      'Curated weekly matches',
      'Priority processing',
      'Personal enquiry support'
    ]
  },
  {
    id: 'affluent_1y',
    name: 'Affluent Matrimony',
    category: 'affluent',
    duration: '1 Year',
    price: 55000,
    badge: 'Premium',
    benefits: [
      'Affluent family profiles',
      'Curated weekly matches',
      'Priority processing',
      'Personal enquiry support'
    ]
  },
  // Till You Marry
  {
    id: 'till_marry',
    name: 'Till You Marry',
    category: 'till_marry',
    duration: 'Lifetime',
    price: 85000,
    validity: 'Till Marriage',
    badge: 'Best Seller',
    highlighted: true,
    benefits: [
      'Unlimited profiles',
      'Weekly calls / WhatsApp updates',
      'Dedicated relationship manager',
      'Two-day once feedback',
      'Full background enquiry'
    ]
  }
];

const PrimeSubscriptionModal = ({ isOpen, onClose, userId, profileId, userName }: PrimeSubscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const logCall = async (callType: 'prime_subscription' | 'assistance', packageName?: string) => {
    setIsLogging(true);
    try {
      const { error } = await supabase.from('prime_call_logs').insert({
        user_id: userId,
        profile_id: profileId,
        user_name: userName,
        selected_package: packageName || null,
        call_type: callType,
        call_status: 'initiated',
        phone_number: SUPPORT_PHONE
      });

      if (error) throw error;
      
      // Open phone dialer
      window.location.href = `tel:${SUPPORT_PHONE}`;
      toast.success('Call initiated. Our team will assist you!');
    } catch (error) {
      console.error('Error logging call:', error);
      toast.error('Failed to log call. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleCallToSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
    logCall('prime_subscription', `${plan.name} - ${plan.duration}`);
  };

  const handleAssistanceCall = () => {
    logCall('assistance');
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/91${SUPPORT_PHONE}?text=Hi, I'm interested in Prime Membership for Vikshana Matrimony.`, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'support':
        return <Heart className="h-5 w-5" />;
      case 'affluent':
        return <Star className="h-5 w-5" />;
      case 'till_marry':
        return <Award className="h-5 w-5" />;
      default:
        return <Crown className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string, highlighted?: boolean) => {
    if (highlighted) {
      return 'from-amber-500 to-yellow-500';
    }
    switch (category) {
      case 'support':
        return 'from-primary to-primary/80';
      case 'affluent':
        return 'from-purple-500 to-indigo-500';
      case 'till_marry':
        return 'from-amber-500 to-yellow-500';
      default:
        return 'from-primary to-primary/80';
    }
  };

  // Group plans by category for display
  const supportPlans = plans.filter(p => p.category === 'support');
  const affluentPlans = plans.filter(p => p.category === 'affluent');
  const tillMarryPlan = plans.find(p => p.category === 'till_marry');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <Crown className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500" />
            Prime Membership Plans
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
          {/* Support Matrimony Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Support Matrimony
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {supportPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`p-3 sm:p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(plan.category)}`} />
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{plan.duration}</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(plan.price)}</p>
                    </div>

                    <ul className="space-y-1.5 sm:space-y-2">
                      {plan.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{benefit}</span>
                        </li>
                      ))}
                      {plan.benefits.length > 3 && (
                        <li className="text-xs text-muted-foreground ml-5">+{plan.benefits.length - 3} more</li>
                      )}
                    </ul>

                    <div className="flex gap-1.5 sm:gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={() => handleCallToSubscribe(plan)}
                        disabled={isLogging}
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-1 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={handleWhatsApp}
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Affluent Matrimony Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              Affluent Matrimony
              <Badge className="bg-purple-500 text-white text-xs">Premium</Badge>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {affluentPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`p-3 sm:p-5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-purple-200 ${
                    selectedPlan === plan.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(plan.category)}`} />
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{plan.duration}</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">{formatPrice(plan.price)}</p>
                      {plan.validity && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Validity: {plan.validity}</p>
                      )}
                    </div>

                    <ul className="space-y-1.5 sm:space-y-2">
                      {plan.benefits.slice(0, 3).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{benefit}</span>
                        </li>
                      ))}
                      {plan.benefits.length > 3 && (
                        <li className="text-xs text-muted-foreground ml-5">+{plan.benefits.length - 3} more</li>
                      )}
                    </ul>

                    <div className="flex gap-1.5 sm:gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1 bg-purple-500 hover:bg-purple-600 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={() => handleCallToSubscribe(plan)}
                        disabled={isLogging}
                      >
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-1 border-purple-300 text-purple-600 hover:bg-purple-50 h-8 sm:h-9 text-xs sm:text-sm"
                        onClick={handleWhatsApp}
                      >
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Till You Marry Section */}
          {tillMarryPlan && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                Till You Marry
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">Best Seller</Badge>
              </h3>
              <Card 
                className={`p-4 sm:p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 ${
                  selectedPlan === tillMarryPlan.id ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-amber-500 to-yellow-500" />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                    Best Seller
                  </Badge>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-0">
                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{tillMarryPlan.validity}</p>
                      <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        {formatPrice(tillMarryPlan.price)}
                      </p>
                      <p className="text-xs sm:text-sm text-amber-700 font-medium mt-1">One-time payment • Lifetime benefits</p>
                    </div>
                  </div>

                  <div>
                    <ul className="space-y-2 sm:space-y-3">
                      {tillMarryPlan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 mt-0.5 shrink-0" />
                          <span className="font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <Button 
                    className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground h-10 sm:h-12 text-sm sm:text-base"
                    onClick={() => handleCallToSubscribe(tillMarryPlan)}
                    disabled={isLogging}
                  >
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                    Call to Subscribe
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 border-amber-400 text-amber-700 hover:bg-amber-100 h-10 sm:h-12 text-sm sm:text-base"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Chat with us
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Need Assistance Section */}
          <Card className="p-4 sm:p-6 bg-muted/50 border-dashed">
            <div className="flex flex-col items-center gap-3 sm:gap-4 text-center sm:text-left sm:flex-row sm:justify-between">
              <div>
                <h4 className="font-semibold text-sm sm:text-lg">Need assistance to take Prime Membership?</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Our team is here to help you choose the right plan</p>
              </div>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="gap-2 text-xs sm:text-sm h-9 sm:h-10"
                  onClick={handleAssistanceCall}
                  disabled={isLogging}
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  Call: {SUPPORT_PHONE}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 text-xs sm:text-sm h-9 sm:h-10"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  Chat with us
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrimeSubscriptionModal;
