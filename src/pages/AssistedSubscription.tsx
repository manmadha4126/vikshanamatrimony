import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Lock, Phone, Mail, Crown, Star, Gem, Check, Sparkles, Clock, Users, MessageSquare, ThumbsUp } from 'lucide-react';
import PaymentModal from '@/components/subscription/PaymentModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [isCallbackDialogOpen, setIsCallbackDialogOpen] = useState(false);
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', preferredTime: 'morning' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCallbackSubmit = async () => {
    if (!callbackForm.name || !callbackForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let profileId = null;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        profileId = profile?.id;
      }

      const { error } = await supabase.from('callback_requests').insert({
        user_id: user?.id || null,
        profile_id: profileId,
        name: callbackForm.name,
        phone: callbackForm.phone,
        preferred_time: callbackForm.preferredTime,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Callback request submitted! We will contact you soon.');
      setIsCallbackDialogOpen(false);
      setCallbackForm({ name: '', phone: '', preferredTime: 'morning' });
    } catch (error) {
      console.error('Error submitting callback request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const howItWorksSteps = [
    "Our Relationship Manager will get in touch with you",
    "Relationship Manager will understand your requirements to help find the perfect match for you",
    "You will receive 3-4 most relevant matches on a weekly basis",
    "Relationship Manager will arrange meetings based on mutual acceptance"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-violet-50/50 to-white dark:from-purple-950/20 dark:via-background dark:to-background">
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
        {/* Hero Section */}
        <section className="text-center py-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-orange-950/20 border-0 shadow-lg overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Find your match <span className="text-primary">10x faster</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Personalized matchmaking service through expert Relationship Manager
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center p-6 border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold">Get Relevant matches</h3>
                <p className="text-sm text-muted-foreground">
                  Your Relationship Manager (RM) will shortlist and share relevant matches from our extensive database
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold">Get better responses</h3>
                <p className="text-sm text-muted-foreground">
                  Even free members can message you. Our Relationship Manager (RM) follows up with profiles you're interested in for faster responses
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold">Save time and effort</h3>
                <p className="text-sm text-muted-foreground">
                  Our Relationship Manager (RM) saves your time and effort following up with prospects and set up meetings
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

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
              return (
                <Card key={key} className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
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
                      {durations.map(d => (
                        <Button
                          key={d.key}
                          variant={duration === d.key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDurationChange(key, d.key)}
                          className={duration === d.key ? 'bg-primary' : ''}
                        >
                          {d.label}
                        </Button>
                      ))}
                    </div>
                    <div className="text-center py-4">
                      <span className="text-3xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
                      <span className="text-muted-foreground ml-2">/ {durations.find(d => d.key === duration)?.label}</span>
                    </div>
                    <Button className="w-full gradient-primary text-lg py-6" onClick={() => handlePayNow(key as PlanType, plan.name, 'Basic', pricing)}>
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>
              );
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
              return (
                <Card key={key} className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${plan.badge ? 'ring-2 ring-pink-500' : ''}`}>
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
                      {durations.map(d => (
                        <Button
                          key={d.key}
                          variant={duration === d.key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDurationChange(key, d.key)}
                          className={duration === d.key ? 'bg-primary' : ''}
                        >
                          {d.label}
                        </Button>
                      ))}
                    </div>
                    <div className="text-center py-4">
                      <span className="text-3xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
                      <span className="text-muted-foreground ml-2">/ {durations.find(d => d.key === duration)?.label}</span>
                    </div>
                    <Button className="w-full gradient-primary text-lg py-6" onClick={() => handlePayNow(key as PlanType, plan.name, 'Combo', pricing)}>
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>
              );
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
                return (
                  <Card key={key} className={`relative overflow-hidden shadow-lg hover:shadow-2xl transition-all ${isRecommended ? 'ring-2 ring-purple-500 scale-105 md:scale-110 z-10' : 'hover:scale-102'}`}>
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                    {plan.badge && (
                      <Badge className={`absolute top-4 right-4 ${isRecommended ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {plan.badge}
                      </Badge>
                    )}
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
                        {durations.map(d => (
                          <Button
                            key={d.key}
                            variant={duration === d.key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDurationChange(key, d.key)}
                            className={duration === d.key ? 'bg-primary' : ''}
                          >
                            {d.label}
                          </Button>
                        ))}
                      </div>
                      <div className="text-center py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-3xl md:text-4xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
                          <span className="text-muted-foreground text-sm">/ {durations.find(d => d.key === duration)?.label}</span>
                        </div>
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
                        {isRecommended && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-purple-600 dark:text-purple-400">VIP Matchmaking</span>
                          </li>
                        )}
                      </ul>
                      <Button
                        className={`w-full text-lg py-6 ${isRecommended ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700' : 'gradient-primary'}`}
                        onClick={() => handlePayNow(key as PlanType, plan.name, 'Assisted', pricing)}
                      >
                        Pay Now
                      </Button>
                    </CardContent>
                  </Card>
                );
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

        {/* How It Works Section */}
        <section className="py-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to find your perfect match</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-primary/30 hidden md:block" />
              
              <div className="space-y-6">
                {howItWorksSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10">
                      {index + 1}
                    </div>
                    <Card className="flex-1 p-4 md:p-6">
                      <p className="text-foreground font-medium">{step}</p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Assisted Service Guarantee Section */}
        <section className="py-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/10 dark:to-orange-950/20 border-2 border-primary/20">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <ThumbsUp className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Assisted Service Guarantee</h3>
                  <ul className="space-y-3 text-foreground">
                    <li className="flex items-center gap-3 justify-center md:justify-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Minimum of 3-4 most relevant matches per week</span>
                    </li>
                    <li className="flex items-center gap-3 justify-center md:justify-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>15 days money back guarantee - If you are not happy, your money will get refunded</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">*T&C apply</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Free Consultation CTA Section */}
        <section className="py-8">
          <Card className="max-w-2xl mx-auto text-center p-8 md:p-10 border-2 border-dashed border-primary/30">
            <CardContent className="p-0 space-y-6">
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                Want to know more about Assisted Service?
              </h3>
              <Dialog open={isCallbackDialogOpen} onOpenChange={setIsCallbackDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Get Free Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">Request a Callback</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={callbackForm.name}
                        onChange={(e) => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        value={callbackForm.phone}
                        onChange={(e) => setCallbackForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time</Label>
                      <select
                        id="time"
                        className="w-full p-2 border rounded-md bg-background"
                        value={callbackForm.preferredTime}
                        onChange={(e) => setCallbackForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                      >
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 8 PM)</option>
                      </select>
                    </div>
                    <Button 
                      className="w-full gradient-primary" 
                      onClick={handleCallbackSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Request Callback'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
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
    </div>
  );
};

export default AssistedSubscription;
