import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initiateMonetbilPayment } from "@/lib/monetbil";

interface DonationPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  amount: string;
  donorName: string;
  phoneNumber: string;
  donationId: string;
}

export const DonationPaymentDialog = ({
  open,
  onOpenChange,
  onSuccess,
  amount,
  donorName,
  phoneNumber: initialPhone,
  donationId,
}: DonationPaymentDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = () => {
    setIsProcessing(true);

    const nameParts = donorName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const amountNum = parseInt(amount.replace(/[^\d]/g, ""), 10) || 0;

    initiateMonetbilPayment({
      amount: amountNum,
      itemRef: donationId,
      firstName,
      lastName,
      phone: initialPhone,
      onComplete: (data) => {
        setIsProcessing(false);
        if (data.status === "success") {
          toast({ 
            title: "Donation Successful!", 
            description: "Thank you for your generous support." 
          });
          onSuccess();
        } else {
          toast({ title: "Payment Incomplete", description: "Please try again.", variant: "destructive" });
        }
      },
      onError: (error) => {
        setIsProcessing(false);
        toast({ title: "Payment Error", description: error?.message || "Something went wrong.", variant: "destructive" });
      },
    });
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Complete Your Donation
          </DialogTitle>
          <DialogDescription className="text-base">
            Click the button below to proceed with your donation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Donor</span>
                <span className="font-medium">{donorName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Donation ID</span>
                <span className="font-mono text-xs">{donationId || "—"}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Donation Amount</span>
                  <span className="text-2xl font-bold text-primary">{amount} XAF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            {["Secure payment via Monetbil", "MTN & Orange Money supported", "Instant confirmation"].map((txt, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{txt}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleClose(false)} 
              className="flex-1" 
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} className="flex-1" disabled={isProcessing}>
              {isProcessing ? "Opening Payment..." : `Donate ${amount} XAF`}
            </Button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Monetbil
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
