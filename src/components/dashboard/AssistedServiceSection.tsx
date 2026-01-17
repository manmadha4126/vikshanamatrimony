import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Headphones, UserCheck, Star, ArrowRight, Phone, Mail, Clock, Users, MessageSquare, Calendar, X } from 'lucide-react';
import assistedExpertImage from '@/assets/assisted-matrimony-expert.jpg';

const AssistedServiceSection = () => {
  const navigate = useNavigate();
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
  return <div className="container mx-auto px-4 py-6">
      <Card className="shadow-card overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
          </div>

          <CardContent className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Assisted Matrimony Service
                </h2>
                <p className="text-muted-foreground mb-6">
                  Let our expert relationship managers help you find your perfect life partner.
                  We understand that finding the right match takes time and effort, and we're here to help.
                </p>

                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => <div key={index} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>)}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gradient-primary" onClick={() => navigate('/assisted-subscription')}>
                    Know More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setIsContactOpen(true)}>
                    Contact Us
                  </Button>
                </div>
              </div>

              {/* Expert Image */}
              <div className="hidden md:flex justify-center items-center">
                <div className="relative">
                  <img 
                    src={assistedExpertImage} 
                    alt="Assisted Matrimony Expert" 
                    className="w-80 h-96 object-cover object-top rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

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