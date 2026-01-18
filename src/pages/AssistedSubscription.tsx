import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Lock, Phone, Mail, Crown, Star, Gem, Check, Sparkles } from 'lucide-react';
import PaymentModal from '@/components/subscription/PaymentModal';
type PlanType = 'gold' | 'prime_gold' | 'combo' | 'prime_combo' | 'assisted_gold' | 'assisted_prime' | 'assisted_supreme';
type Duration = '1_month' | '3_months' | '6_months' | '1_year';
interface PlanSelection {
  planType: PlanType;
  planName: string;
  duration: Duration;
  durationLabel: string;
  price: number;
  category: string;
}
const AssistedSubscription = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const basicPlans: Record<string, {
    name: string;
    icon: typeof Crown;
    color: string;
    badge?: string;
  }> = {
    gold: {
      name: 'Gold',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600'
    },
    prime_gold: {
      name: 'Prime Gold',
      icon: Star,
      color: 'from-amber-500 to-orange-600'
    }
  };
  const basicPricing: Record<string, Record<Duration, number>> = {
    gold: {
      '1_month': 2000,
      '3_months': 5000,
      '6_months': 6500,
      '1_year': 8000
    },
    prime_gold: {
      '1_month': 3000,
      '3_months': 6000,
      '6_months': 7500,
      '1_year': 9500
    }
  };
  const comboPlans: Record<string, {
    name: string;
    icon: typeof Gem;
    color: string;
    badge?: string;
  }> = {
    combo: {
      name: 'Combo',
      icon: Gem,
      color: 'from-purple-400 to-purple-600'
    },
    prime_combo: {
      name: 'Prime Combo',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-600',
      badge: 'Popular'
    }
  };
  const comboPricing: Record<string, Record<Duration, number>> = {
    combo: {
      '1_month': 2500,
      '3_months': 6000,
      '6_months': 7500,
      '1_year': 9500
    },
    prime_combo: {
      '1_month': 3500,
      '3_months': 7500,
      '6_months': 8500,
      '1_year': 10000
    }
  };
  const assistedPlans: Record<string, {
    name: string;
    icon: typeof Crown;
    color: string;
    badge?: string;
    recommended?: boolean;
  }> = {
    assisted_gold: {
      name: 'Assisted Gold',
      icon: Crown,
      color: 'from-yellow-400 to-amber-500'
    },
    assisted_prime: {
      name: 'Assisted Prime',
      icon: Star,
      color: 'from-orange-400 to-red-500',
      badge: 'Premium Support'
    },
    assisted_supreme: {
      name: 'Assisted Supreme',
      icon: Gem,
      color: 'from-violet-500 to-purple-700',
      badge: 'Recommended',
      recommended: true
    }
  };
  const assistedPricing: Record<string, Record<Duration, number>> = {
    assisted_gold: {
      '1_month': 15000,
      '3_months': 25000,
      '6_months': 40000,
      '1_year': 80000
    },
    assisted_prime: {
      '1_month': 30000,
      '3_months': 35000,
      '6_months': 42000,
      '1_year': 69000
    },
    assisted_supreme: {
      '1_month': 35000,
      '3_months': 41900,
      '6_months': 52200,
      '1_year': 90000
    }
  };
  const durations: {
    key: Duration;
    label: string;
  }[] = [{
    key: '1_month',
    label: '1 Month'
  }, {
    key: '3_months',
    label: '3 Months'
  }, {
    key: '6_months',
    label: '6 Months'
  }, {
    key: '1_year',
    label: '1 Year'
  }];
  const [selectedDurations, setSelectedDurations] = useState<Record<string, Duration>>({});
  const handleDurationChange = (planKey: string, duration: Duration) => {
    setSelectedDurations(prev => ({
      ...prev,
      [planKey]: duration
    }));
  };
  const handlePayNow = (planKey: PlanType, planName: string, category: string, pricing: Record<Duration, number>) => {
    const duration = selectedDurations[planKey] || '1_month';
    const durationLabel = durations.find(d => d.key === duration)?.label || '1 Month';
    setSelectedPlan({
      planType: planKey,
      planName,
      duration,
      durationLabel,
      price: pricing[duration],
      category
    });
    setIsPaymentModalOpen(true);
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  return <div className="min-h-screen bg-gradient-to-b from-purple-50 via-violet-50/50 to-white dark:from-purple-950/20 dark:via-background dark:to-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold">Assisted Matrimony Services</h1>
              <p className="text-sm text-muted-foreground">Choose the perfect plan for your journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Security Badge */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Lock className="h-4 w-4" />
            <span>100% Secure Payments • SSL Protected • No Card Data Stored</span>
          </div>
        </div>

        {/* Basic Plans Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Basic Plans</h2>
            <p className="text-muted-foreground">Start your journey with our foundational plans</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {Object.entries(basicPlans).map(([key, plan]) => {
            const pricing = basicPricing[key];
            const duration = selectedDurations[key] || '1_month';
            const Icon = plan.icon;
            return <Card key={key} className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-display">{plan.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {durations.map(d => <Button key={d.key} variant={duration === d.key ? 'default' : 'outline'} size="sm" onClick={() => handleDurationChange(key, d.key)} className={duration === d.key ? 'bg-primary' : ''}>
                          {d.label}
                        </Button>)}
                    </div>
                    <div className="text-center py-4">
                      <span className="text-3xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
                      <span className="text-muted-foreground ml-2">/ {durations.find(d => d.key === duration)?.label}</span>
                    </div>
                    <Button className="w-full gradient-primary text-lg py-6" onClick={() => handlePayNow(key as PlanType, plan.name, 'Basic', pricing)}>
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>;
          })}
          </div>
        </section>

        {/* Combo Plans Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Combo Plans</h2>
            <p className="text-muted-foreground">Best value for comprehensive matchmaking</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {Object.entries(comboPlans).map(([key, plan]) => {
            const pricing = comboPricing[key];
            const duration = selectedDurations[key] || '1_month';
            const Icon = plan.icon;
            return <Card key={key} className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${plan.badge ? 'ring-2 ring-pink-500' : ''}`}>
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                  {plan.badge && <Badge className="absolute top-4 right-4 bg-pink-500 text-white">{plan.badge}</Badge>}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-display">{plan.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {durations.map(d => <Button key={d.key} variant={duration === d.key ? 'default' : 'outline'} size="sm" onClick={() => handleDurationChange(key, d.key)} className={duration === d.key ? 'bg-primary' : ''}>
                          {d.label}
                        </Button>)}
                    </div>
                    <div className="text-center py-4">
                      <span className="text-3xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
                      <span className="text-muted-foreground ml-2">/ {durations.find(d => d.key === duration)?.label}</span>
                    </div>
                    <Button className="w-full gradient-primary text-lg py-6" onClick={() => handlePayNow(key as PlanType, plan.name, 'Combo', pricing)}>
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>;
          })}
          </div>
        </section>

        {/* Assisted Plans Section (Premium) */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 via-violet-100/30 to-purple-100/50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-purple-950/20 rounded-3xl -z-10" />
          <div className="py-8 px-4">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1">PREMIUM</Badge>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">Assisted Plans</h2>
              <p className="text-muted-foreground">Dedicated relationship manager for personalized matchmaking</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Object.entries(assistedPlans).map(([key, plan]) => {
              const pricing = assistedPricing[key];
              const duration = selectedDurations[key] || '1_month';
              const Icon = plan.icon;
              const isRecommended = 'recommended' in plan && plan.recommended;
              return <Card key={key} className={`relative overflow-hidden shadow-lg hover:shadow-2xl transition-all ${isRecommended ? 'ring-2 ring-purple-500 scale-105 md:scale-110 z-10' : 'hover:scale-102'}`}>
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                    {plan.badge && <Badge className={`absolute top-4 right-4 ${isRecommended ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {plan.badge}
                      </Badge>}
                    <CardHeader className="pb-4 pt-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg md:text-xl font-display">{plan.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {durations.map(d => <Button key={d.key} variant={duration === d.key ? 'default' : 'outline'} size="sm" onClick={() => handleDurationChange(key, d.key)} className={duration === d.key ? 'bg-primary' : ''}>
                            {d.label}
                          </Button>)}
                      </div>
                      <div className="text-center py-4">
                        <span className="text-2xl md:text-3xl font-bold text-foreground mx-[260px] my-[30px]">{formatPrice(pricing[duration])}</span>
                        <span className="text-muted-foreground ml-2 text-sm">/ {durations.find(d => d.key === duration)?.label}</span>
                      </div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Dedicated Relationship Manager</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Handpicked Matches</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Priority Support</span>
                        </li>
                        {isRecommended && <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-purple-600 dark:text-purple-400">VIP Matchmaking</span>
                          </li>}
                      </ul>
                      <Button className={`w-full text-lg py-6 ${isRecommended ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700' : 'gradient-primary'}`} onClick={() => handlePayNow(key as PlanType, plan.name, 'Assisted', pricing)}>
                        Pay Now
                      </Button>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl md:text-2xl font-bold mb-4">Need help choosing a plan?</h3>
          <p className="text-muted-foreground mb-6">Our relationship managers are here to guide you</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="outline" className="gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </Button>
            <Button size="lg" className="gradient-primary gap-2">
              <Phone className="h-5 w-5" />
              Call Relationship Manager
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Secured by SSL • 100% Safe Payments</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Vikshana Matrimony. All rights reserved.</p>
        </footer>
      </div>

      {/* Payment Modal */}
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} plan={selectedPlan} />
    </div>;
};
export default AssistedSubscription;