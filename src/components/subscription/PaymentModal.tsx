import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QrCode, Building2, Upload, Shield, Lock, CheckCircle2, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import upiQrCode from '@/assets/phonepe-qr-code.png';

interface PlanSelection {
  planType: string;
  planName: string;
  duration: string;
  durationLabel: string;
  price: number;
  category: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanSelection | null;
}

const PaymentModal = ({ isOpen, onClose, plan }: PaymentModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [utrId, setUtrId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const bankDetails = {
    bankName: 'Canara Bank',
    accountNumber: '31712210035760',
    accountHolder: 'T Prasanth',
    customerId: '231825713',
    ifscCode: 'CNRB0013171'
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async () => {
    if (!plan) return;

    if (!utrId.trim()) {
      toast({
        title: 'UTR ID Required',
        description: 'Please enter the UTR/Transaction ID from your payment.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Login Required',
          description: 'Please login to continue with payment.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Upload screenshot if provided
      let screenshotUrl = null;
      if (screenshotFile) {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-screenshots')
          .upload(fileName, screenshotFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(fileName);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // Get validity months from duration
      const validityMonths = plan.duration === '1_month' ? 1 
        : plan.duration === '3_months' ? 3 
        : plan.duration === '6_months' ? 6 
        : 12;

      // Insert subscription record
      const { error: insertError } = await supabase
        .from('prime_subscriptions')
        .insert({
          user_id: user.id,
          profile_id: profile?.id || null,
          plan_type: plan.planType,
          plan_name: plan.planName,
          plan_category: plan.category,
          amount: plan.price,
          validity_months: validityMonths,
          status: 'pending'
        });

      if (insertError) throw insertError;

      setIsSubmitted(true);
      toast({
        title: 'Payment Submitted',
        description: 'Your payment is under verification. You will be notified once confirmed.',
      });
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUtrId('');
    setScreenshotFile(null);
    setIsSubmitted(false);
    onClose();
  };

  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Payment Submitted!</h3>
            <p className="text-muted-foreground">
              Your payment is under verification. You will receive a notification once your subscription is activated.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-400">Verification in Progress</p>
                  <p className="text-sm text-amber-700 dark:text-amber-500">This usually takes 1-2 business hours.</p>
                </div>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full gradient-primary mt-4">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Badge className="mb-2">{plan.category}</Badge>
                    <h4 className="font-semibold">{plan.planName}</h4>
                    <p className="text-sm text-muted-foreground">{plan.durationLabel}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{formatPrice(plan.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'upi' | 'bank')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upi" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  UPI / QR
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Transfer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upi" className="space-y-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="bg-white rounded-lg p-4 inline-block mb-4">
                      <img 
                        src={upiQrCode} 
                        alt="UPI QR Code - Scan to Pay" 
                        className="w-48 h-48 object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-sm font-medium">Scan & Pay – 100% Secure</p>
                    <p className="text-sm text-primary font-mono mt-1">UPI ID: prasanthtirupathi@ybl</p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>PhonePe • Google Pay • Paytm • Any UPI App</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bank" className="space-y-4">
                <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 dark:text-blue-300">Bank Transfer Details</span>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-blue-200/50">
                        <span className="text-muted-foreground">Bank Name</span>
                        <span className="font-medium">{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-blue-200/50">
                        <span className="text-muted-foreground">Account Number</span>
                        <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-blue-200/50">
                        <span className="text-muted-foreground">Account Holder</span>
                        <span className="font-medium">{bankDetails.accountHolder}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-blue-200/50">
                        <span className="text-muted-foreground">Customer ID</span>
                        <span className="font-medium font-mono">{bankDetails.customerId}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">IFSC Code</span>
                        <span className="font-medium font-mono">{bankDetails.ifscCode}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground text-center">
                  All payments will be credited to the official Vikshana Matrimony account.
                </p>
              </TabsContent>
            </Tabs>

            {/* Payment Confirmation */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold">Confirm Your Payment</h4>
              
              <div className="space-y-2">
                <Label htmlFor="utr">UTR / Transaction ID *</Label>
                <Input
                  id="utr"
                  placeholder="Enter UTR or Transaction ID"
                  value={utrId}
                  onChange={(e) => setUtrId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                {screenshotFile && (
                  <p className="text-xs text-green-600">✓ {screenshotFile.name}</p>
                )}
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your payment information is secure and encrypted.</span>
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full gradient-primary py-6 text-lg" 
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>Submit Payment</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
