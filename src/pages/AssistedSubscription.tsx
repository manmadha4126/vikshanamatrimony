import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Shield, Lock, Phone, Mail, Crown, Star, Gem, Check, Sparkles, Users, MessageSquare, Clock, ThumbsUp, UserCheck, Calendar, Target, Heart, Award, Zap, User } from 'lucide-react';
import PaymentModal from '@/components/subscription/PaymentModal';
import assistedExpertImg from '@/assets/assisted-matrimony-expert.jpg';
import { toast } from 'sonner';

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

interface CallbackFormData {
  name: string;
  phone: string;
  preferredTime: string;
}

const AssistedSubscription = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackForm, setCallbackForm] = useState<CallbackFormData>({
    name: '',
    phone: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basicPlans: Record<string, { name: string; icon: typeof Crown; color: string; badge?: string }> = {
    gold: { name: 'Gold', icon: Crown, color: 'from-yellow-400 to-yellow-600' },
    prime_gold: { name: 'Prime Gold', icon: Star, color: 'from-amber-500 to-orange-600' }
  };

  const basicPricing: Record<string, Record<Duration, number>> = {
    gold: { '1_month': 2000, '3_months': 5000, '6_months': 6500, '1_year': 8000 },
    prime_gold: { '1_month': 3000, '3_months': 6000, '6_months': 7500, '1_year': 9500 }
  };

  const comboPlans: Record<string, { name: string; icon: typeof Gem; color: string; badge?: string }> = {
    combo: { name: 'Combo', icon: Gem, color: 'from-purple-400 to-purple-600' },
    prime_combo: { name: 'Prime Combo', icon: Sparkles, color: 'from-pink-500 to-rose-600', badge: 'Popular' }
  };

  const comboPricing: Record<string, Record<Duration, number>> = {
    combo: { '1_month': 2500, '3_months': 6000, '6_months': 7500, '1_year': 9500 },
    prime_combo: { '1_month': 3500, '3_months': 7500, '6_months': 8500, '1_year': 10000 }
  };

  const assistedPlans: Record<string, { name: string; icon: typeof Crown; color: string; badge?: string; recommended?: boolean }> = {
    assisted_gold: { name: 'Assisted Gold', icon: Crown, color: 'from-yellow-400 to-amber-500' },
    assisted_prime: { name: 'Assisted Prime', icon: Star, color: 'from-orange-400 to-red-500', badge: 'Premium Support' },
    assisted_supreme: { name: 'Assisted Supreme', icon: Gem, color: 'from-violet-500 to-purple-700', badge: 'Recommended', recommended: true }
  };

  const assistedPricing: Record<string, Record<Duration, number>> = {
    assisted_gold: { '1_month': 15000, '3_months': 25000, '6_months': 40000, '1_year': 80000 },
    assisted_prime: { '1_month': 30000, '3_months': 35000, '6_months': 42000, '1_year': 69000 },
    assisted_supreme: { '1_month': 35000, '3_months': 41900, '6_months': 52200, '1_year': 90000 }
  };

  const durations: { key: Duration; label: string }[] = [
    { key: '1_month', label: '1 Month' },
    { key: '3_months', label: '3 Months' },
    { key: '6_months', label: '6 Months' },
    { key: '1_year', label: '1 Year' }
  ];

  const [selectedDurations, setSelectedDurations] = useState<Record<string, Duration>>({});

  const handleDurationChange = (planKey: string, duration: Duration) => {
    setSelectedDurations(prev => ({ ...prev, [planKey]: duration }));
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

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!callbackForm.name.trim() || !callbackForm.phone.trim() || !callbackForm.preferredTime) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(callbackForm.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Callback request submitted successfully! Our relationship manager will call you soon.');
    setIsCallbackModalOpen(false);
    setCallbackForm({ name: '', phone: '', preferredTime: '' });
    setIsSubmitting(false);
  };

  const benefits = [
    {
      icon: Users,
      title: 'Get Relevant Matches',
      description: 'Your Relationship Manager (RM) will shortlist and share relevant matches from Vikshana Matrimony network.'
    },
    {
      icon: MessageSquare,
      title: 'Get Better Responses',
      description: 'Even free members can message you. Our Relationship Manager (RM) follows up with profiles you\'re interested in for faster responses.'
    },
    {
      icon: Clock,
      title: 'Save Time and Effort',
      description: 'Our Relationship Manager (RM) saves your time and effort following up with prospects and set up meetings.'
    }
  ];

  const howItWorks = [
    'Our Relationship Manager will get in touch with you.',
    'Relationship Manager will understand your requirements to help find the perfect match for you.',
    'You will receive 3-4 most relevant matches on a weekly basis.',
    'Relationship Manager will arrange meetings based on mutual acceptance.'
  ];

  const whyPaidMembership = [
    {
      icon: Target,
      title: 'Personalized Matchmaking',
      description: 'Get matches handpicked by experts based on your preferences and compatibility.'
    },
    {
      icon: UserCheck,
      title: 'Verified Profiles Only',
      description: 'Access to 100% verified profiles with background checks for your safety.'
    },
    {
      icon: Heart,
      title: 'Higher Success Rate',
      description: 'Our assisted members have 3x higher success rate in finding their life partner.'
    },
    {
      icon: Award,
      title: 'Premium Support',
      description: '24/7 dedicated support from relationship experts throughout your journey.'
    },
    {
      icon: Zap,
      title: 'Priority Visibility',
      description: 'Your profile gets priority placement and is shown first to matching profiles.'
    },
    {
      icon: Calendar,
      title: 'Meeting Arrangements',
      description: 'We help arrange meetings, both virtual and in-person, at your convenience.'
    }
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
              <p className="text-sm text-muted-foreground">Personalized matchmaking service</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-6 md:p-10 md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Find your match <span className="text-primary">10x faster</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Personalized matchmaking service through expert Relationship Manager
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src={assistedExpertImg} 
                alt="Relationship Manager" 
                className="w-full h-64 md:h-80 object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="space-y-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 shrink-0">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Security Badge */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Lock className="h-4 w-4" />
            <span>100% Secure Payments • SSL Protected</span>
          </div>
        </div>

        {/* Basic Plans Section - Horizontal Scroll */}
        <section>
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Basic Plans</h2>
            <p className="text-muted-foreground">Start your journey with our foundational plans</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {Object.entries(basicPlans).map(([key, plan]) => {
              const pricing = basicPricing[key];
              const duration = selectedDurations[key] || '1_month';
              const Icon = plan.icon;

              return (
                <Card key={key} className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow min-w-[300px] md:min-w-[350px] snap-center shrink-0">
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
                    <Button 
                      className="w-full gradient-primary text-lg py-6" 
                      onClick={() => handlePayNow(key as PlanType, plan.name, 'Basic', pricing)}
                    >
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Combo Plans Section - Horizontal Scroll */}
        <section>
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Combo Plans</h2>
            <p className="text-muted-foreground">Best value for comprehensive matchmaking</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {Object.entries(comboPlans).map(([key, plan]) => {
              const pricing = comboPricing[key];
              const duration = selectedDurations[key] || '1_month';
              const Icon = plan.icon;

              return (
                <Card key={key} className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow min-w-[300px] md:min-w-[350px] snap-center shrink-0 ${plan.badge ? 'ring-2 ring-pink-500' : ''}`}>
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                  {plan.badge && (
                    <Badge className="absolute top-4 right-4 bg-pink-500 text-white">{plan.badge}</Badge>
                  )}
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
                    <Button 
                      className="w-full gradient-primary text-lg py-6" 
                      onClick={() => handlePayNow(key as PlanType, plan.name, 'Combo', pricing)}
                    >
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Assisted Plans Section (Premium) - Horizontal Scroll */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 via-violet-100/30 to-purple-100/50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-purple-950/20 rounded-3xl -z-10" />
          <div className="py-8 px-2 md:px-4">
            <div className="text-center mb-6">
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1">PREMIUM</Badge>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">Assisted Plans</h2>
              <p className="text-muted-foreground">Dedicated relationship manager for personalized matchmaking</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {Object.entries(assistedPlans).map(([key, plan]) => {
                const pricing = assistedPricing[key];
                const duration = selectedDurations[key] || '1_month';
                const Icon = plan.icon;
                const isRecommended = 'recommended' in plan && plan.recommended;

                return (
                  <Card 
                    key={key} 
                    className={`relative overflow-hidden shadow-lg hover:shadow-2xl transition-all min-w-[300px] md:min-w-[350px] snap-center shrink-0 ${
                      isRecommended 
                        ? 'ring-2 ring-purple-500' 
                        : ''
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.color}`} />
                    {plan.badge && (
                      <Badge 
                        className={`absolute top-4 right-4 ${
                          isRecommended 
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                            : 'bg-orange-500 text-white'
                        }`}
                      >
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
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
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
                        {isRecommended && (
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-purple-600 dark:text-purple-400">VIP Matchmaking</span>
                          </li>
                        )}
                      </ul>
                      <Button 
                        className={`w-full text-lg py-6 ${
                          isRecommended 
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700' 
                            : 'gradient-primary'
                        }`}
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
        <section className="bg-white dark:bg-card rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="font-display text-xl md:text-2xl font-bold mb-8 text-center">How It Works</h3>
          <div className="space-y-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary text-primary font-bold shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{step}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="w-0.5 h-6 bg-border ml-4 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Guarantee Section */}
        <section className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 md:p-8">
          <h3 className="font-display text-xl md:text-2xl font-bold mb-6">Assisted Service Guarantee</h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-foreground">
                  Minimum of <strong>3-4 most relevant matches</strong> per week
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <ThumbsUp className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-foreground">
                  <strong>15 days money back guarantee.</strong> If you are not happy, your money will get refunded
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto">
                <ThumbsUp className="h-12 w-12 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">T&C apply</p>
            </div>
          </div>
        </section>

        {/* Why Paid Membership Section */}
        <section>
          <div className="text-center mb-8">
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Why Paid Membership?</h3>
            <p className="text-muted-foreground">Unlock premium features for a successful match</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPaidMembership.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Free Consultation CTA */}
        <section className="bg-white dark:bg-card rounded-2xl p-6 md:p-8 text-center shadow-sm border">
          <h3 className="font-display text-xl font-bold mb-4">Want to know more about Assisted Service?</h3>
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
            Get Free Consultation
          </Button>
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

      {/* Sticky Request Callback Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t shadow-lg p-4 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <p className="font-semibold text-sm md:text-base">Interested to know more?</p>
          <Button 
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => setIsCallbackModalOpen(true)}
          >
            <Phone className="h-4 w-4" />
            Request a callback
          </Button>
        </div>
      </div>

      {/* Spacer for sticky footer */}
      <div className="h-20" />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
      />

      {/* Callback Request Modal */}
      <Dialog open={isCallbackModalOpen} onOpenChange={setIsCallbackModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Request a Callback
            </DialogTitle>
            <DialogDescription>
              Fill in your details and our relationship manager will call you back at your preferred time.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCallbackSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="callback-name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="callback-name"
                  placeholder="Enter your full name"
                  value={callbackForm.name}
                  onChange={(e) => setCallbackForm(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callback-phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="callback-phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={callbackForm.phone}
                  onChange={(e) => setCallbackForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callback-time">Preferred Time for Callback *</Label>
              <Select 
                value={callbackForm.preferredTime} 
                onValueChange={(value) => setCallbackForm(prev => ({ ...prev, preferredTime: value }))}
                required
              >
                <SelectTrigger id="callback-time" className="w-full">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 3 PM)</SelectItem>
                  <SelectItem value="evening">Evening (3 PM - 6 PM)</SelectItem>
                  <SelectItem value="late_evening">Late Evening (6 PM - 9 PM)</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsCallbackModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gradient-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground text-center">
            By submitting, you agree to be contacted by our relationship manager.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssistedSubscription;
