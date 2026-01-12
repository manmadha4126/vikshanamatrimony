import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Phone, MessageCircle, Check, X } from 'lucide-react';
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
  durationMonths: number;
  bonusDays?: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  phoneViewLimit?: string;
  benefits: string[];
  badge?: string;
  highlighted?: boolean;
}

const SUPPORT_PHONE = '7397734496';

const plans: SubscriptionPlan[] = [
  // Support Matrimony (Gold)
  {
    id: 'support_3m',
    name: 'Support Matrimony',
    category: 'support',
    duration: '3 months',
    durationMonths: 3,
    bonusDays: 5,
    originalPrice: 5500,
    discountedPrice: 3400,
    discountPercent: 38,
    phoneViewLimit: 'View 40 Phone Nos',
    benefits: [
      'Send unlimited messages',
      'Unlimited horoscope views',
      'View verified profiles with photos'
    ]
  },
  // Affluent Matrimony (Prime Gold)
  {
    id: 'affluent_3m',
    name: 'Affluent Matrimony',
    category: 'affluent',
    duration: '3 months',
    durationMonths: 3,
    bonusDays: 10,
    originalPrice: 7900,
    discountedPrice: 4000,
    discountPercent: 49,
    phoneViewLimit: 'View unlimited Phone Nos*',
    benefits: [
      'Send unlimited messages',
      'Unlimited horoscope views',
      'View verified profiles with photos'
    ]
  },
  // Prime - Till U Marry
  {
    id: 'till_marry',
    name: 'Prime - Till U Marry',
    category: 'till_marry',
    duration: 'Lifetime',
    durationMonths: 12,
    originalPrice: 23700,
    discountedPrice: 9900,
    discountPercent: 58,
    phoneViewLimit: 'View unlimited Phone Nos*',
    badge: 'Best Seller',
    highlighted: true,
    benefits: [
      'Longest validity plan',
      'Send unlimited messages',
      'Unlimited horoscope views',
      'View verified profiles with photos'
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

  const handlePayNow = (plan: SubscriptionPlan) => {
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
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getMonthlyPrice = (plan: SubscriptionPlan) => {
    return Math.round(plan.discountedPrice / plan.durationMonths);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <Crown className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500" />
              Choose Your Plan
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 pt-4 space-y-6">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.highlighted 
                    ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-50/50 to-background' 
                    : 'border border-border hover:border-primary/50'
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              >
                {/* Best Seller Badge */}
                {plan.badge && (
                  <div className="absolute -top-0 -right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-rose-500 text-white text-xs px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="p-4 sm:p-6 space-y-4">
                  {/* Plan Name */}
                  <div className="text-center border-b pb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Discount & Pricing */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-rose-500 font-bold text-sm">
                        {plan.discountPercent}% OFF!
                      </span>
                      <span className="text-muted-foreground text-sm">Valid for today</span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-muted-foreground line-through text-sm">
                        {formatPrice(plan.originalPrice)}
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">
                        {formatPrice(plan.discountedPrice)}
                      </span>
                    </div>

                    <div className="inline-block border border-border rounded-full px-3 py-1">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {formatPrice(getMonthlyPrice(plan))} per month
                      </span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-3 pt-2">
                    {/* Duration */}
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>
                        {plan.category === 'till_marry' 
                          ? 'Longest validity plan' 
                          : `Valid for ${plan.duration}${plan.bonusDays ? `+${plan.bonusDays} days🎉` : ''}`
                        }
                      </span>
                    </li>

                    {/* Phone View */}
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{plan.phoneViewLimit}</span>
                    </li>

                    {/* Other Benefits */}
                    {plan.benefits.slice(0, 3).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Know More Link for Till U Marry */}
                  {plan.category === 'till_marry' && (
                    <div className="text-center pt-2">
                      <button 
                        className="text-primary text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
                        onClick={handleWhatsApp}
                      >
                        Know More <span>›</span>
                      </button>
                    </div>
                  )}

                  {/* Pay Now Button */}
                  <Button 
                    className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-foreground font-semibold text-base rounded-full"
                    onClick={() => handlePayNow(plan)}
                    disabled={isLogging}
                  >
                    Pay Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* View All Packages Link */}
          <div className="text-center">
            <button 
              className="text-primary text-sm hover:underline flex items-center justify-center gap-1 mx-auto"
              onClick={handleWhatsApp}
            >
              View All Packages <span>›</span>
            </button>
          </div>

          {/* Need Assistance Section */}
          <div className="border-t pt-6">
            <div className="text-center space-y-4">
              <h4 className="font-semibold text-base sm:text-lg">
                Need any help in making payment?
              </h4>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-full px-6 h-10"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  Chat with us
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 rounded-full px-6 h-10"
                  onClick={handleAssistanceCall}
                  disabled={isLogging}
                >
                  <Phone className="h-4 w-4 text-emerald-500" />
                  {SUPPORT_PHONE}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: 21 Days money back guarantee{' '}
                <button className="text-primary hover:underline">Terms & Conditions</button>
                {' '}applied
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrimeSubscriptionModal;
