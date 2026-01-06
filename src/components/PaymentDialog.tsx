import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, CheckCircle, HelpCircle, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RecommendationCodeDialog } from "./RecommendationCodeDialog";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  planTitle: string;
  applicantName: string;
  registrationId: string | null;
  planId: string;
  paymentPlans?: { id: string; price: string }[];
}

const toCents = (priceLabel: string) => {
  const digits = priceLabel.replace(/[^\d]/g, "");
  return Number(digits || 0);
};

type PaymentOption = "pay" | "support" | null;

export const PaymentDialog = ({
  open,
  onOpenChange,
  amount,
  planTitle,
  applicantName,
  registrationId,
  planId,
  paymentPlans = [],
}: PaymentDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<PaymentOption>(null);
  const [supportReason, setSupportReason] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const { toast } = useToast();

  const generateRecommendationCode = (fullName: string) => {
    const lastName = fullName.trim().split(" ").pop() || "USER";
    const randomDigits = Math.floor(10 + Math.random() * 90);
    return `${lastName.toUpperCase()}${randomDigits}`;
  };

  const handlePayment = () => {
    if (!registrationId) {
      toast({ title: "Missing registration", description: "Please submit registration first.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    (async () => {
      try{
        const amountCents = toCents(amount || "100");
        // open blank window to preserve gesture
        const checkoutWindow = window.open('', '_blank');
        const resp = await api.createFapshiPayment({ registration_id: registrationId, amount_cents: amountCents, currency: 'XAF', phone: phone || undefined });
        const paymentId = resp.payment_id;
        const checkout = resp.checkout_url || resp.transUrl || resp.url || null;
        if (checkoutWindow && !checkoutWindow.closed){
          try{ checkoutWindow.location.href = checkout; }catch(e){ window.open(checkout, '_blank'); }
        } else {
          window.open(checkout, '_blank');
        }

        // poll status
        let attempts = 0;
        const maxAttempts = 60;
        const iv = setInterval(async () => {
          attempts += 1;
          try{
            const st = await api.getPaymentStatus(paymentId);
            if (st.status === 'succeeded'){
              clearInterval(iv);
              setIsProcessing(false);
              setCompletionMessage("Payment received. You're almost there! Join our WhatsApp group for important updates.");
              setIsComplete(true);
              toast({ title: "Payment Successful!", description: "Your application fee has been received." });
            } else if (st.status === 'failed'){
              clearInterval(iv);
              setIsProcessing(false);
              toast({ title: "Payment Failed", description: "Payment failed or cancelled.", variant: 'destructive' });
            } else if (attempts >= maxAttempts){
              clearInterval(iv);
              setIsProcessing(false);
              toast({ title: "Payment Timeout", description: "Payment not confirmed—please retry.", variant: 'destructive' });
            }
          }catch(err){ if (attempts >= maxAttempts){ clearInterval(iv); setIsProcessing(false); toast({ title: "Payment Error", description: "Unable to confirm payment.", variant: 'destructive' }); } }
        }, 2000);
      }catch(err:any){ setIsProcessing(false); toast({ title: "Payment Error", description: err?.message || 'Failed to start payment', variant: 'destructive' }); }
    })();
  };

  const handleSupportRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supportReason.trim()) {
      toast({ title: "Reason required", description: "Please explain why you need fee support.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    // Save support request (in real app, save to database)
    console.log("Fee support request:", { registrationId, reason: supportReason });

    setTimeout(() => {
      setCompletionMessage("Request submitted for review. Join our WhatsApp group to receive updates.");
      setIsComplete(true);
      setIsProcessing(false);
      toast({ title: "Request Submitted", description: "Your fee support request is under review." });
    }, 1000);
  };

  const resetDialog = () => {
    setSelectedOption(null);
    setSupportReason("");
    setIsComplete(false);
    setCompletionMessage("");
  };

  const handleClose = (open: boolean) => {
    if (!open) resetDialog();
    onOpenChange(open);
  };

  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="text-center py-8">
            <div className="relative inline-block mb-6">
              <CheckCircle className="w-20 h-20 text-primary mx-auto animate-scale-in" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <CheckCircle className="w-20 h-20 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4 animate-fade-in">{completionMessage}</h2>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white animate-fade-in"
              onClick={() => window.open("https://chat.whatsapp.com/BmeER1UQhIsISliCYaPXLl", "_blank")}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Join WhatsApp Group for Updates
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Application Fee: 1,00XAF
              </DialogTitle>
              <DialogDescription className="text-base">
                This fee supports internet access and essential training materials.<br />
                <strong>Training remains 100% free.</strong>
              </DialogDescription>
            </DialogHeader>

            {!selectedOption ? (
              <div className="space-y-4 py-6">
                <Card 
                  className="cursor-pointer border-2 hover:border-primary transition-all"
                  onClick={() => setSelectedOption("pay")}
                >
                  <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground">Pay 1,00XAF Now</h3>
                          <p className="text-muted-foreground text-sm">Mobile Money (MTN / Orange)</p>
                          <p className="text-muted-foreground text-sm">Instant payment confirmation</p>
                        </div>
                      </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer border-2 hover:border-primary transition-all"
                  onClick={() => setSelectedOption("support")}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">Request Fee Support</h3>
                        <p className="text-muted-foreground text-sm">Fee adjusted to 0 XAF</p>
                        <p className="text-muted-foreground text-sm">An email will be sent to you</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedOption === "pay" ? (
              <div className="space-y-6 py-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Applicant</span>
                      <span className="font-medium">{applicantName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Registration ID</span>
                      <span className="font-mono text-xs">{registrationId || "—"}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">1,00XAF</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  {[["Secure payment", "MTN & Orange Money supported", "Instant confirmation"].map((txt, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{txt}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="payerPhone">Phone used for payment (include country code)</Label>
                  <Input id="payerPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 677000000" className="mt-2" />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setSelectedOption(null)} className="flex-1" disabled={isProcessing}>
                    Back
                  </Button>
                  <Button onClick={handlePayment} className="flex-1" disabled={isProcessing}>
                    {isProcessing ? "Opening Payment..." : "Pay 1,00XAF"}
                  </Button>
                </div>
                
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment powered by Monetbil
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupportRequest} className="space-y-6 py-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Applicant</span>
                      <span className="font-medium">{applicantName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Fee Amount</span>
                      <span className="font-semibold text-green-500">0 XAF (Support Requested)</span>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="supportReason">Why are you unable to pay at this time? *</Label>
                  <Textarea
                    id="supportReason"
                    value={supportReason}
                    onChange={(e) => setSupportReason(e.target.value)}
                    placeholder="Please explain your situation..."
                    rows={4}
                    required
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setSelectedOption(null)} className="flex-1" disabled={isProcessing}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isProcessing}>
                    {isProcessing ? "Submitting..." : "Request Fee Support"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ScrollArea>
      </DialogContent>

      <RecommendationCodeDialog
        open={showRecommendationDialog}
        onOpenChange={setShowRecommendationDialog}
        recommendationCode={generateRecommendationCode(applicantName)}
        applicantName={applicantName}
      />
    </Dialog>
  );
};
