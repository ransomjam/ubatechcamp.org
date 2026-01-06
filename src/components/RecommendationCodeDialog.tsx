import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RecommendationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendationCode: string;
  applicantName: string;
}

export function RecommendationCodeDialog({ open, onOpenChange, recommendationCode, applicantName }: RecommendationCodeDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(recommendationCode);
    setCopied(true);
    toast.success("Recommendation code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Welcome to UBA Tech Camp!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Congratulations {applicantName}! Your registration is confirmed.
          </p>

          <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-6 text-center">
            <p className="text-sm font-medium mb-2">Your Recommendation Code</p>
            <div className="bg-background rounded-md p-4 mb-3">
              <p className="text-2xl font-bold tracking-wider">{recommendationCode}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Academic Recommendations</h4>
            <p className="text-xs text-muted-foreground">
              Share your recommendation code with colleagues and students. You'll contribute 
              to our community growth for each person who registers using your code.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
