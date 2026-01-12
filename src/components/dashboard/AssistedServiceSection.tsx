import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Headphones, UserCheck, Star, ArrowRight, Phone, Mail, Clock, Users, MessageSquare, Calendar, X } from 'lucide-react';
import assistedExpertImage from '@/assets/assisted-matrimony-expert.jpg';

const AssistedServiceSection = () => {
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
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
  const howItWorks = [{
    step: 1,
    title: 'Our Relationship Manager will get in touch with you.'
  }, {
    step: 2,
    title: 'Relationship Manager will understand your requirements to help find the perfect match for you.'
  }, {
    step: 3,
    title: 'You will receive 3-4 most relevant matches on a weekly basis.'
  }, {
    step: 4,
    title: 'Relationship Manager will arrange meetings based on mutual acceptance.'
  }];
  const serviceFeatures = [{
    icon: Users,
    iconBg: 'bg-orange-100',
    title: 'Get Relevant matches',
    description: 'Your Relationship Manager (RM) will shortlist and share relevant matches from Vikshana Matrimony.'
  }, {
    icon: MessageSquare,
    iconBg: 'bg-pink-100',
    title: 'Get better responses',
    description: 'Even free members can message you. Our Relationship Manager (RM) follows up with profiles you\'re interested in for faster responses.'
  }, {
    icon: Clock,
    iconBg: 'bg-blue-100',
    title: 'Save time and effort',
    description: 'Our Relationship Manager (RM) saves your time and effort following up with prospects and set up meetings.'
  }];
  const relationshipManagers = [{
    name: 'Priya Sharma',
    role: 'Senior Relationship Manager',
    phone: '+91 98765 43210',
    email: 'priya@vikshana.com',
    experience: '5+ years experience'
  }, {
    name: 'Rajesh Kumar',
    role: 'Relationship Manager',
    phone: '+91 98765 43211',
    email: 'rajesh@vikshana.com',
    experience: '3+ years experience'
  }];
  return <div className="container mx-auto px-4 py-6">
      <Card className="shadow-card overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
          </div>

          <CardContent className="relative p-6 md:p-12">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              {/* Expert Image - Mobile (shown first on mobile) */}
              <div className="flex md:hidden justify-center items-center w-full">
                <img 
                  src={assistedExpertImage} 
                  alt="Assisted Matrimony Expert" 
                  className="w-48 h-56 object-cover object-top rounded-xl shadow-lg"
                />
              </div>

              {/* Content */}
              <div>
                <h2 className="font-display text-xl md:text-3xl font-bold text-foreground mb-3 md:mb-4 text-center md:text-left">
                  Assisted Matrimony Service
                </h2>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base text-center md:text-left">
                  Let our expert relationship managers help you find your perfect life partner.
                  We understand that finding the right match takes time and effort, and we're here to help.
                </p>

                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {features.map((feature, index) => <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <feature.icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs md:text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>)}
                </div>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button size="lg" className="gradient-primary" onClick={() => setIsKnowMoreOpen(true)}>
                    Know More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setIsContactOpen(true)}>
                    Contact Us
                  </Button>
                </div>
              </div>

              {/* Expert Image - Desktop */}
              <div className="hidden md:flex justify-center items-center">
                <img 
                  src={assistedExpertImage} 
                  alt="Assisted Matrimony Expert" 
                  className="w-80 h-96 object-cover object-top rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Know More Dialog */}
      <Dialog open={isKnowMoreOpen} onOpenChange={setIsKnowMoreOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">How Assisted Service works?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
            {/* Service Features */}
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Personalized matchmaking service through expert Relationship Manager
              </p>
              
              {serviceFeatures.map((feature, index) => <Card key={index} className="border">
                  <CardContent className="p-4 flex gap-4">
                    <div className={`p-3 rounded-full ${feature.iconBg} shrink-0`}>
                      <feature.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>)}
            </div>

            {/* How It Works Steps */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-6">How it works</h3>
              <div className="space-y-0">
                {howItWorks.map((item, index) => <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-semibold">
                        {item.step}
                      </div>
                      {index < howItWorks.length - 1 && <div className="w-px h-12 border-l-2 border-dashed border-muted-foreground/30" />}
                    </div>
                    <div className="pt-2 pb-6">
                      <p className="text-sm">{item.title}</p>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 flex items-center justify-between">
              <span className="font-semibold text-sm">Interested to know more?</span>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => {
              setIsKnowMoreOpen(false);
              setIsContactOpen(true);
            }}>
                <Phone className="h-4 w-4 mr-2" />
                Request a callback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

            {relationshipManagers.map((manager, index) => <Card key={index} className="border">
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
                        <a href={`tel:${manager.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors text-right">
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
              </Card>)}

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Clock className="h-4 w-4" />
              <span className="text-amber-900 mx-[2px] my-[4px] py-[4px] px-[2px]">Available: Mon-Sat, 9 AM - 8 PM</span>
            </div>

            <Button className="w-full gradient-primary">
              <Phone className="h-4 w-4 mr-2" />
              Request a Callback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default AssistedServiceSection;