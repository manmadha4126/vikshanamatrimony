import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Check } from 'lucide-react';
import PrimeSubscriptionModal from './PrimeSubscriptionModal';

interface AccountTypeSectionProps {
  isPrime: boolean;
  primeExpiresAt?: string | null;
  userId: string;
  profileId: string;
  userName: string;
}

const AccountTypeSection = ({ isPrime, primeExpiresAt, userId, profileId, userName }: AccountTypeSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrimeClick = () => {
    if (!isPrime) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 bg-gradient-to-r from-muted/50 to-muted rounded-xl p-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex gap-2">
              <Button
                variant={!isPrime ? 'default' : 'outline'}
                size="sm"
                className={!isPrime ? 'gradient-primary' : ''}
              >
                <Star className="h-4 w-4 mr-1" />
                Regular
              </Button>
              <Button
                variant={isPrime ? 'default' : 'outline'}
                size="sm"
                className={isPrime ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground' : 'cursor-pointer'}
                onClick={handlePrimeClick}
              >
                <Crown className="h-4 w-4 mr-1" />
                Prime
                {isPrime && <Check className="h-3 w-3 ml-1" />}
              </Button>
            </div>
            
            {isPrime && primeExpiresAt && (
              <Badge variant="secondary" className="hidden sm:flex">
                Expires: {new Date(primeExpiresAt).toLocaleDateString()}
              </Badge>
            )}
          </div>

          {!isPrime && (
            <Card 
              className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20 p-3 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              onClick={handlePrimeClick}
            >
              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <Crown className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Upgrade to Prime</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Get unlimited profile views, priority listing & more
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <PrimeSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        profileId={profileId}
        userName={userName}
      />
    </>
  );
};

export default AccountTypeSection;
