import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface PaymentFormProps {
  registrationId: string | null;
  amount: number;
  onSuccess: () => void;
  onError: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  registrationId,
  amount,
  onSuccess,
  onError,
}) => {
  const [provider, setProvider] = useState<"mtn" | "orange" | "">("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!provider || !phone) {
      toast.error("Please select a provider and enter your phone number");
      return;
    }

    if (!registrationId) {
      toast.error("Registration ID is missing");
      onError();
      return;
    }

    setIsProcessing(true);
    setPaymentInitiated(true);

    try {
      const response = await api.createMobilePayment({
        registration_id: registrationId,
        provider: provider as "orange" | "mtn",
        phone,
        amount_cents: amount,
        currency: "XAF",
      });

      toast.success(response.message || "Payment initiated. Check your phone to confirm.");

      // Poll for payment status
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const status = await api.getPaymentStatus(response.id || response.payment_id);
          
          if (status.status === "succeeded") {
            clearInterval(pollInterval);
            toast.success("Payment confirmed! Registration successful.");
            onSuccess();
            return;
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setPaymentInitiated(false);
            toast.error("Payment failed. Please try again.");
            onError();
            return;
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setPaymentInitiated(false);
            toast.error("Payment timeout. Please check your account and try again if needed.");
            onError();
          }
        } catch (err) {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsProcessing(false);
            setPaymentInitiated(false);
            toast.error("Unable to confirm payment. Please contact support.");
            onError();
          }
        }
      }, 2000);
    } catch (err: any) {
      console.error("Payment error:", err);
      setIsProcessing(false);
      setPaymentInitiated(false);
      toast.error(err?.message || "Payment initiation failed. Please try again.");
      onError();
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      {paymentInitiated ? (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            Waiting for payment confirmation...
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            A prompt will appear on your phone shortly.
            <br />
            Do not close this window.
          </p>
        </div>
      ) : (
        <>
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Mobile Provider *</Label>
            <Select value={provider} onValueChange={(v: any) => setProvider(v)} disabled={isProcessing}>
              <SelectTrigger className="bg-background/50 border-primary/20">
                <SelectValue placeholder="Select MTN or Orange" />
              </SelectTrigger>
              <SelectContent className="bg-background border-primary/20">
                <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                <SelectItem value="orange">Orange Money</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Phone Number *</Label>
            <Input
              type="tel"
              placeholder="e.g., 671234567 or 6XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              className="bg-background/50 border-primary/20"
              disabled={isProcessing}
              maxLength={9}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter 9 digits (without country code)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || !provider || !phone || phone.length < 9}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </>
      )}
    </form>
  );
};

export default PaymentForm;
