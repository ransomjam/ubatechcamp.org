import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateInvoice } from "@/lib/invoice";
import { PROGRAM_OPTIONS } from "@/lib/programs";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import { supabase } from "@/lib/supabase";
import { Receipt, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkData {
  id: string;
  token: string;
  program: string | null;
  amount: number | null;
  is_used: boolean;
  expires_at: string;
}

const ClaimReceipt = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [status, setStatus] = useState<'loading' | 'valid' | 'used' | 'expired' | 'not_found'>('loading');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institution: "",
    program: "",
    amount: PAYMENT_CONFIG.REGISTRATION_FEE_XAF.toString(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedTransId, setGeneratedTransId] = useState("");

  useEffect(() => {
    if (token) {
      validateLink();
    } else {
      setStatus('not_found');
    }
  }, [token]);

  const validateLink = async () => {
    try {
      const { data, error } = await supabase
        .from('receipt_links')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        setStatus('not_found');
        return;
      }

      if (data.is_used) {
        setStatus('used');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setStatus('expired');
        return;
      }

      setLinkData(data);
      setStatus('valid');
      
      // Pre-fill form if link has program/amount set
      if (data.program) {
        setFormData(prev => ({ ...prev, program: data.program }));
      }
      if (data.amount) {
        setFormData(prev => ({ ...prev, amount: data.amount.toString() }));
      }
    } catch (err) {
      console.error('Error validating link:', err);
      setStatus('not_found');
    }
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SLF-${timestamp}-${random}`.toUpperCase();
  };

  const handleClaimReceipt = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast({ title: "Error", description: "Please enter your full name", variant: "destructive" });
      return;
    }
    if (!formData.program) {
      toast({ title: "Error", description: "Please select a program/course", variant: "destructive" });
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({ title: "Error", description: "Invalid amount", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const transId = generateTransactionId();

    try {
      // Call the database function to claim the link atomically
      const { data, error } = await supabase.rpc('claim_receipt_link', {
        p_token: token,
        p_full_name: formData.fullName.trim(),
        p_email: formData.email.trim() || null,
        p_institution: formData.institution.trim() || null,
        p_program: formData.program,
        p_amount: Number(formData.amount),
        p_trans_id: transId,
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        toast({ title: "Error", description: data.error || "Failed to claim receipt", variant: "destructive" });
        if (data.error === 'This link has already been used') {
          setStatus('used');
        }
        return;
      }

      // Generate the PDF
      const formattedDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      generateInvoice({
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        institution: formData.institution.trim() || undefined,
        program: formData.program,
        amount: Number(formData.amount),
        transId: transId,
        date: formattedDate,
      });

      setGeneratedTransId(transId);
      setIsGenerated(true);
      toast({ title: "Success!", description: "Your receipt has been generated and downloaded." });
    } catch (err) {
      console.error('Error claiming receipt:', err);
      toast({ title: "Error", description: "Failed to generate receipt. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-xl font-bold text-foreground">Validating Link...</h3>
            <p className="text-muted-foreground mt-2">Please wait while we verify your receipt link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error States
  if (status === 'not_found' || status === 'used' || status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-red-500/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {status === 'not_found' && "Link Not Found"}
              {status === 'used' && "Link Already Used"}
              {status === 'expired' && "Link Expired"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {status === 'not_found' && "This receipt link is invalid or does not exist."}
              {status === 'used' && "This one-time link has already been used to generate a receipt."}
              {status === 'expired' && "This receipt link has expired. Please contact the administrator for a new link."}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State - Receipt Generated
  if (isGenerated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-green-500/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Receipt Generated!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your payment receipt has been downloaded. Please keep it safe.
            </p>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Name:</span> {formData.fullName}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Program:</span> {formData.program}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Amount:</span> {Number(formData.amount).toLocaleString()} XAF
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Transaction ID:</span> {generatedTransId}
              </p>
            </div>

            <Button
              onClick={() => {
                const formattedDate = new Date().toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });
                generateInvoice({
                  fullName: formData.fullName.trim(),
                  email: formData.email.trim() || undefined,
                  institution: formData.institution.trim() || undefined,
                  program: formData.program,
                  amount: Number(formData.amount),
                  transId: generatedTransId,
                  date: formattedDate,
                });
                toast({ title: "Downloaded!", description: "Receipt downloaded again." });
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Receipt Again
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Note: This link can no longer be used to generate another receipt.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form State - Claim Receipt
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl">
        <CardHeader className="text-center border-b border-primary/10 pb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Claim Your Receipt
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Fill in your details to generate your payment receipt - UBaTech Camp
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground font-medium">
              Your Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-background/50 border-primary/20"
            />
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Your Email <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background/50 border-primary/20"
            />
          </div>

          {/* School/Faculty (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="institution" className="text-foreground font-medium">
              School/Faculty <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="institution"
              placeholder="e.g., FEMS"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="bg-background/50 border-primary/20"
            />
          </div>

          {/* Program/Course */}
          <div className="space-y-2">
            <Label htmlFor="program" className="text-foreground font-medium">
              Program / Course *
            </Label>
            <Select
              value={formData.program}
              onValueChange={(value) => setFormData({ ...formData, program: value })}
              disabled={!!linkData?.program}
            >
              <SelectTrigger className="bg-background/50 border-primary/20">
                <SelectValue placeholder="Select your program" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAM_OPTIONS.map((program) => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {linkData?.program && (
              <p className="text-xs text-muted-foreground">Program has been pre-selected</p>
            )}
          </div>

          {/* Amount (Display Only if Pre-set) */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Amount
            </Label>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <span className="text-2xl font-bold text-foreground">
                {Number(formData.amount).toLocaleString()} XAF
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleClaimReceipt}
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate & Download Receipt
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Note: This is a one-time link. You can only generate one receipt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimReceipt;
