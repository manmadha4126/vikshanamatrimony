import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, UserCheck, Star, ArrowRight } from 'lucide-react';

const AssistedServiceSection = () => {
  const features = [
    {
      icon: UserCheck,
      title: 'Dedicated Relationship Manager',
      description: 'A personal advisor to guide you through your search',
    },
    {
      icon: Star,
      title: 'Handpicked Matches',
      description: 'Carefully selected profiles matching your criteria',
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: '24/7 dedicated support for all your queries',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
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
                  <Button size="lg" className="gradient-primary">
                    Know More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Contact Us
                  </Button>
                </div>
              </div>

              {/* Decorative Image Placeholder */}
              <div className="hidden md:flex justify-center">
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <div className="text-center">
                      <Headphones className="h-16 w-16 mx-auto text-primary mb-2" />
                      <p className="font-display font-semibold text-lg">Expert Help</p>
                      <p className="text-xs text-muted-foreground">Available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default AssistedServiceSection;
