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
      <div className="container mx-auto px-0 sm:px-4 py-2 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-gradient-to-r from-muted/50 to-muted rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1">
            <div className="flex gap-2">
              <Button
                variant={!isPrime ? 'default' : 'outline'}
                size="sm"
                className={`text-xs sm:text-sm ${!isPrime ? 'gradient-primary' : ''}`}
              >
                <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Regular
              </Button>
              <Button
                variant={isPrime ? 'default' : 'outline'}
                size="sm"
                className={`text-xs sm:text-sm ${isPrime ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground' : 'cursor-pointer'}`}
                onClick={handlePrimeClick}
              >
                <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Prime
                {isPrime && <Check className="h-3 w-3 ml-1" />}
              </Button>
            </div>
            
            {isPrime && primeExpiresAt && (
              <Badge variant="secondary" className="text-xs hidden sm:flex">
                Expires: {new Date(primeExpiresAt).toLocaleDateString()}
              </Badge>
            )}
          </div>

          {!isPrime && (
            <Card 
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20 p-2 sm:p-3 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              onClick={handlePrimeClick}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate">Upgrade to Prime</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block truncate">
                    Unlimited profile views, priority listing & more
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground text-xs sm:text-sm shrink-0"
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
