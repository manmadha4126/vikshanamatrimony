import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Phone, MessageCircle, Check, ArrowLeft, QrCode, Building2, Upload, Shield, Lock, CheckCircle2, AlertCircle, Loader2, IndianRupee, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import phonePeLogo from '@/assets/phonepe-qr-code.png';

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

const bankDetails = {
  bankName: 'Canara Bank',
  accountName: 'PRASANTH TIRUPATI',
  accountNumber: '7010011003099',
  ifscCode: 'CNRB0017010',
  branch: 'Tirupati Main Branch'
};

const PrimeSubscriptionModal = ({ isOpen, onClose, userId, profileId, userName }: PrimeSubscriptionModalProps) => {
  const isMobile = useIsMobile();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOpenUpiApp = () => {
    if (upiUrl) {
      window.location.href = upiUrl;
    }
  };

  // UPI payment details
  const upiId = 'prasanthtirupathi@ybl';
  const merchantName = 'PRASANTH TIRUPATI';
  
  // Generate UPI deep link URL with amount
  const upiUrl = useMemo(() => {
    if (!selectedPlan) return '';
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${selectedPlan.discountedPrice}&cu=INR&tn=${encodeURIComponent(`Vikshana Matrimony - ${selectedPlan.name}`)}`;
  }, [selectedPlan]);

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
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleBackToPlans = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    setUtrNumber('');
    setScreenshotFile(null);
    setIsSubmitted(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan) return;
    if (!utrNumber && !screenshotFile) {
      toast.error('Please provide UTR number or upload payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl = null;
      
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('profile-photos')
          .upload(`payment-screenshots/${fileName}`, screenshotFile);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`payment-screenshots/${fileName}`);
        screenshotUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('prime_subscriptions').insert({
        user_id: userId,
        profile_id: profileId,
        plan_name: selectedPlan.name,
        plan_type: selectedPlan.id,
        plan_category: selectedPlan.category,
        amount: selectedPlan.discountedPrice,
        validity_months: selectedPlan.durationMonths,
        status: 'pending'
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Payment submitted for verification!');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            {showPayment && (
              <Button variant="ghost" size="icon" onClick={handleBackToPlans}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl">
              <Crown className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500" />
              {showPayment ? `Pay for ${selectedPlan?.name}` : 'Choose Your Plan'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 pt-4 space-y-6">
          {/* Payment Flow */}
          {showPayment && selectedPlan ? (
            isSubmitted ? (
              <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">Payment Submitted!</h3>
                  <p className="text-muted-foreground">
                    Your payment for <strong>{selectedPlan.name}</strong> ({formatPrice(selectedPlan.discountedPrice)}) has been submitted for verification.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We'll activate your subscription within 24 hours after verification.
                  </p>
                  <Button onClick={onClose} className="mt-4">
                    Done
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Selected Plan Summary */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{selectedPlan.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedPlan.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{formatPrice(selectedPlan.discountedPrice)}</p>
                        <p className="text-sm text-muted-foreground line-through">{formatPrice(selectedPlan.originalPrice)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Tabs defaultValue="upi" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upi" className="gap-2">
                      <QrCode className="h-4 w-4" /> UPI Payment
                    </TabsTrigger>
                    <TabsTrigger value="bank" className="gap-2">
                      <Building2 className="h-4 w-4" /> Bank Transfer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upi" className="space-y-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="bg-white rounded-lg p-4 inline-block mb-4 shadow-sm border">
                          <QRCodeSVG 
                            value={upiUrl}
                            size={192}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                              src: phonePeLogo,
                              x: undefined,
                              y: undefined,
                              height: 40,
                              width: 40,
                              excavate: true,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <IndianRupee className="h-5 w-5 text-primary" />
                          <span className="text-xl font-bold text-primary">{formatPrice(selectedPlan.discountedPrice)}</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Amount auto-filled when you scan</p>
                        <p className="text-sm text-primary font-mono mt-2">UPI ID: {upiId}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>PhonePe • Google Pay • Paytm • Any UPI App</span>
                        </div>
                        
                        {/* Pay via UPI App Button */}
                        <Button
                          onClick={handleOpenUpiApp}
                          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-2"
                        >
                          <Smartphone className="h-4 w-4" />
                          Pay via UPI App
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          {isMobile ? 'Opens your default UPI app with amount pre-filled' : 'Works best on mobile devices'}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="bank" className="space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> Bank Details
                        </h4>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Bank Name</span>
                            <span className="font-medium">{bankDetails.bankName}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Account Name</span>
                            <span className="font-medium">{bankDetails.accountName}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Account Number</span>
                            <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">IFSC Code</span>
                            <span className="font-medium font-mono">{bankDetails.ifscCode}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Branch</span>
                            <span className="font-medium">{bankDetails.branch}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Payment Verification */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Payment Verification
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="utr">UTR / Transaction ID</Label>
                        <Input
                          id="utr"
                          placeholder="Enter UTR number"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="screenshot">Payment Screenshot</Label>
                        <Input
                          id="screenshot"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {screenshotFile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Selected: {screenshotFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Your subscription will be activated within 24 hours after payment verification.
                      </p>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleSubmitPayment}
                      disabled={isSubmitting || (!utrNumber && !screenshotFile)}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Payment for Verification'
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Secure
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Encrypted
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      plan.highlighted 
                        ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-50/50 to-background' 
                        : 'border border-border hover:border-primary/50'
                    } ${selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''}`}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrimeSubscriptionModal;
