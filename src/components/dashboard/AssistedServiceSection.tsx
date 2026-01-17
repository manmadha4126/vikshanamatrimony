import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Headphones, UserCheck, Star, ArrowRight, Phone, Mail, Clock, Users, 
  MessageSquare, Calendar, Crown, Gem, Check, Shield, Heart, 
  Sparkles, Target, Award, HandHeart, Eye, Lock, PhoneCall, FileText
} from 'lucide-react';
import assistedExpertImage from '@/assets/assisted-matrimony-expert.jpg';
import PaymentModal from '@/components/subscription/PaymentModal';

type PlanType = 'assisted_gold' | 'assisted_prime' | 'assisted_supreme';
type Duration = '1_month' | '3_months' | '6_months' | '1_year';

interface PlanSelection {
  planType: PlanType;
  planName: string;
  duration: Duration;
  durationLabel: string;
  price: number;
  category: string;
}

const AssistedServiceSection = () => {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanSelection | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState<Record<string, Duration>>({});

  const features = [{
    icon: UserCheck,
    title: 'Dedicated Relationship Manager',
    description: 'A personal advisor to guide you through your search'
  }, {
    icon: Star,
    title: 'Handpicked Matches',
    description: 'Carefully selected profiles matching your criteria'
  }, {
    icon: Headphones,
    title: 'Priority Support',
    description: '24/7 dedicated support for all your queries'
  }];

  const assistedPlans: Record<string, { name: string; icon: typeof Crown; color: string; badge?: string; recommended?: boolean }> = {
    assisted_gold: { name: 'Assisted Gold', icon: Crown, color: 'from-yellow-400 to-amber-500' },
    assisted_prime: { name: 'Assisted Prime', icon: Star, color: 'from-orange-400 to-red-500', badge: 'Premium' },
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

  const servicesAndBenefits = [
    {
      icon: Users,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
      title: 'Get Relevant Matches',
      description: 'Your Relationship Manager (RM) will shortlist and share relevant matches from Vikshana Matrimony.'
    },
    {
      icon: MessageSquare,
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600',
      title: 'Get Better Responses',
      description: 'Even free members can message you. Our RM follows up with profiles you\'re interested in for faster responses.'
    },
    {
      icon: Clock,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      title: 'Save Time & Effort',
      description: 'Our RM saves your time and effort by following up with prospects and setting up meetings.'
    },
    {
      icon: Calendar,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600',
      title: 'Meeting Arrangements',
      description: 'We arrange meetings based on mutual acceptance between families for a smooth process.'
    },
    {
      icon: Target,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      title: 'Personalized Search',
      description: 'Understand your exact requirements and preferences for finding the perfect life partner.'
    },
    {
      icon: PhoneCall,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600',
      title: 'Direct Communication',
      description: 'Direct phone support and regular updates on your matchmaking progress.'
    }
  ];

  const whyPaidMembership = [
    {
      icon: Award,
      title: 'Verified Profiles',
      description: 'All profiles are manually verified by our team for authenticity and genuineness.'
    },
    {
      icon: HandHeart,
      title: 'Dedicated Support',
      description: 'Get a dedicated relationship manager who understands your requirements.'
    },
    {
      icon: Eye,
      title: 'Priority Visibility',
      description: 'Your profile gets priority visibility and appears in top search results.'
    },
    {
      icon: Lock,
      title: 'Privacy Protection',
      description: 'Enhanced privacy controls and secure communication channels.'
    },
    {
      icon: Heart,
      title: 'Quality Matches',
      description: 'Handpicked quality matches based on your specific preferences.'
    },
    {
      icon: FileText,
      title: 'Profile Assistance',
      description: 'Get help in creating an attractive and complete profile.'
    }
  ];

  const howItWorks = [
    { step: 1, title: 'Our Relationship Manager will get in touch with you.' },
    { step: 2, title: 'Relationship Manager will understand your requirements to help find the perfect match.' },
    { step: 3, title: 'You will receive 3-4 most relevant matches on a weekly basis.' },
    { step: 4, title: 'Relationship Manager will arrange meetings based on mutual acceptance.' }
  ];

  const relationshipManagers = [{
    name: 'Priya',
    role: 'Senior Relationship Manager',
    phone: '+91 9491449044',
    email: 'info@vikshanamatrimony.com',
    experience: '10+ years experience'
  }, {
    name: 'Prasanth',
    role: 'Relationship Manager',
    phone: '+91 9100090883',
    email: 'info@vikshanamatrimony.com',
    experience: '4+ years experience'
  }];

  const handleDurationChange = (planKey: string, duration: Duration) => {
    setSelectedDurations(prev => ({ ...prev, [planKey]: duration }));
  };

  const handlePayNow = (planKey: PlanType, planName: string, pricing: Record<Duration, number>) => {
    const duration = selectedDurations[planKey] || '3_months';
    const durationLabel = durations.find(d => d.key === duration)?.label || '3 Months';
    setSelectedPlan({
      planType: planKey,
      planName,
      duration,
      durationLabel,
      price: pricing[duration],
      category: 'Assisted'
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <Card className="shadow-card overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
          </div>

          <CardContent className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium Service
                </Badge>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Assisted Matrimony Service
                </h2>
                <p className="text-muted-foreground mb-6">
                  Let our expert relationship managers help you find your perfect life partner.
                  We understand that finding the right match takes time and effort, and we're here to help.
                </p>

                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gradient-primary" onClick={() => navigate('/assisted-subscription')}>
                    View All Plans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setIsContactOpen(true)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </div>

              <div className="hidden md:flex justify-center items-center">
                <div className="relative">
                  <img 
                    src={assistedExpertImage} 
                    alt="Assisted Matrimony Expert" 
                    className="w-80 h-96 object-cover object-top rounded-2xl shadow-lg"
                  />
                  <div className="absolute -bottom-4 -left-4 bg-white dark:bg-card rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">1000+</p>
                        <p className="text-xs text-muted-foreground">Happy Couples</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Subscription Plans - Horizontal */}
      <section>
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-1">PREMIUM PLANS</Badge>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Choose Your Assisted Plan</h2>
          <p className="text-muted-foreground">Dedicated relationship manager for personalized matchmaking</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(assistedPlans).map(([key, plan]) => {
            const pricing = assistedPricing[key];
            const duration = selectedDurations[key] || '3_months';
            const Icon = plan.icon;
            const isRecommended = 'recommended' in plan && plan.recommended;

            return (
              <Card 
                key={key} 
                className={`relative overflow-hidden shadow-lg hover:shadow-xl transition-all ${
                  isRecommended 
                    ? 'ring-2 ring-purple-500 scale-[1.02]' 
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
                <CardHeader className="pb-2 pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-display">{plan.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {durations.map(d => (
                      <Button
                        key={d.key}
                        variant={duration === d.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDurationChange(key, d.key)}
                        className={`text-xs px-2 py-1 h-7 ${duration === d.key ? 'bg-primary' : ''}`}
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>
                  <div className="text-center py-2">
                    <span className="text-2xl font-bold text-foreground">{formatPrice(pricing[duration])}</span>
                    <span className="text-muted-foreground text-sm ml-1">/ {durations.find(d => d.key === duration)?.label}</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>Dedicated Relationship Manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>3-4 Handpicked Matches/Week</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>Priority Support</span>
                    </li>
                    {isRecommended && (
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="font-semibold text-purple-600 dark:text-purple-400">VIP Matchmaking</span>
                      </li>
                    )}
                  </ul>
                  <Button 
                    className={`w-full ${
                      isRecommended 
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700' 
                        : 'gradient-primary'
                    }`}
                    onClick={() => handlePayNow(key as PlanType, plan.name, pricing)}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            <Lock className="h-4 w-4" />
            <span>100% Secure Payments • SSL Protected</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground">Simple 4-step process to find your perfect match</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {howItWorks.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                {item.step}
              </div>
              <p className="text-sm text-foreground">{item.title}</p>
              {index < howItWorks.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Services & Benefits */}
      <section>
        <div className="text-center mb-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">Services & Benefits</h2>
          <p className="text-muted-foreground">What you get with Assisted Matrimony Service</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {servicesAndBenefits.map((service, index) => (
            <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${service.iconBg} ${service.iconColor} shrink-0`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Paid Membership */}
      <section className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-amber-500 text-white px-4 py-1">
            <Award className="h-3 w-3 mr-1" />
            Premium Benefits
          </Badge>
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">Why Paid Membership?</h2>
          <p className="text-muted-foreground">Unlock exclusive features for a successful matchmaking journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {whyPaidMembership.map((item, index) => (
            <div key={index} className="bg-white dark:bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Our Relationship Managers */}
      <section className="bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">Contact Our Relationship Managers</h2>
          <p className="text-muted-foreground">Get personalized assistance from our experienced team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {relationshipManagers.map((manager, index) => (
            <Card key={index} className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                    <UserCheck className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{manager.name}</h4>
                    <p className="text-sm text-muted-foreground">{manager.role}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">{manager.experience}</Badge>
                    
                    <div className="mt-4 space-y-2">
                      <a href={`tel:${manager.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <Phone className="h-4 w-4" />
                        {manager.phone}
                      </a>
                      <a href={`mailto:${manager.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                        {manager.email}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center mt-6 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white dark:bg-card rounded-lg px-4 py-2 shadow-sm">
            <Clock className="h-4 w-4" />
            <span>Available: Mon-Sat, 9 AM - 8 PM</span>
          </div>
          <Button className="gradient-primary" onClick={() => setIsContactOpen(true)}>
            <Phone className="h-4 w-4 mr-2" />
            Request a Callback
          </Button>
        </div>
      </section>

      {/* Contact Us Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Contact Relationship Manager</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Our dedicated relationship managers are here to help you find your perfect match.
            </p>

            {relationshipManagers.map((manager, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{manager.name}</h4>
                      <p className="text-xs text-muted-foreground">{manager.role}</p>
                      <p className="text-xs text-primary mt-1">{manager.experience}</p>
                      
                      <div className="mt-3 space-y-2">
                        <a href={`tel:${manager.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                          <Phone className="h-4 w-4" />
                          {manager.phone}
                        </a>
                        <a href={`mailto:${manager.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                          <Mail className="h-4 w-4" />
                          {manager.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Clock className="h-4 w-4" />
              <span>Available: Mon-Sat, 9 AM - 8 PM</span>
            </div>

            <Button className="w-full gradient-primary">
              <Phone className="h-4 w-4 mr-2" />
              Request a Callback
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};

export default AssistedServiceSection;
