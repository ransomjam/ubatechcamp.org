import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Wallet, 
  Share2, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  Copy, 
  LogOut, 
  Search,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export const AmbassadorPortal = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [ambassador, setAmbassador] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        toast({
          title: "Account Not Found",
          description: "We couldn't find an ambassador account with that email.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (data.status !== 'approved') {
        toast({
          title: "Application Pending",
          description: "Your application is still being reviewed by our admin team.",
          variant: "default"
        });
        setLoading(false);
        return;
      }

      setAmbassador(data);
      fetchRecommendations(data.recommendation_code);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (code: string) => {
    const { data } = await supabase
      .from('registrations')
      .select('full_name, status, created_at')
      .eq('recommendation_code', code)
      .order('created_at', { ascending: false });
    
    setRecommendations(data || []);
  };

  const copyRecommendationCode = () => {
    navigator.clipboard.writeText(ambassador.recommendation_code);
    toast({
      title: "Copied!",
      description: "Recommendation code copied to clipboard.",
    });
  };

  const shareRecommendationLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/#registration?code=${ambassador.recommendation_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join UBa Tech Camp',
        text: 'Register for UBa Tech Camp with my recommendation code',
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Registration link with your code has been copied.",
      });
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < 2000) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is 2,000 XAF.",
        variant: "destructive"
      });
      return;
    }

    if (amount > ambassador.balance_cents) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds in your balance.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from('withdrawals').insert({
        ambassador_id: ambassador.id,
        amount_cents: amount,
        payment_method: paymentMethod,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: "Admin will review and process your payout soon.",
      });
      setShowWithdrawDialog(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  if (!ambassador) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Ambassador Login</CardTitle>
            <CardDescription>Enter your email to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@university.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {ambassador.full_name}</h1>
            <p className="text-muted-foreground pt-1">Track your recommendations and earnings in real-time.</p>
          </div>
          <Button variant="outline" onClick={() => setAmbassador(null)} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/70 text-sm font-medium">Balance</p>
                  <h3 className="text-3xl font-bold mt-1">{ambassador.balance_cents.toLocaleString()} XAF</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4 bg-white text-primary hover:bg-white/90 font-bold border-none">
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                      Funds will be sent to your specified payment method.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Amount (XAF)</Label>
                      <Input 
                        type="number" 
                        placeholder="Min 2000" 
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method & Details</Label>
                      <Input 
                        placeholder="Momo/OM/Bank - Name and Number" 
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleWithdraw} className="w-full">Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Recommendations</p>
                  <h3 className="text-3xl font-bold mt-1 text-foreground">{recommendations.length}</h3>
                </div>
                <div className="p-2 bg-blue-5000 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Live Tracking
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Successful</p>
                  <h3 className="text-3xl font-bold mt-1 text-foreground">
                    {recommendations.filter(r => r.status === 'completed' || r.status === 'approved').length}
                  </h3>
                </div>
                <div className="p-2 bg-green-5000 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Earnings: {recommendations.filter(r => r.status === 'completed' || r.status === 'approved').length * 50} XAF
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-primary shadow-none bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary text-sm font-medium">Your Code</p>
                  <h3 className="text-2xl font-mono font-bold mt-1 text-primary">{ambassador.recommendation_code}</h3>
                </div>
                <Button size="icon" variant="ghost" className="text-primary mr-1" onClick={copyRecommendationCode}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-primary" onClick={shareRecommendationLink}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="mt-3 text-xs text-primary/70">Share this code with students to earn rewards.</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Recommendations Table */}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <div>
                <CardTitle className="text-xl">Your Recommendations</CardTitle>
                <CardDescription>List of students who used your code</CardDescription>
              </div>
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="p-4 font-semibold">Student Name</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recommendations.length > 0 ? recommendations.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{ref.full_name}</td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {new Date(ref.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            ref.status === 'completed' || ref.status === 'approved' 
                              ? 'bg-green-5000 text-green-700' 
                              : 'bg-yellow-5000 text-yellow-700'
                          }`}>
                            {ref.status === 'completed' || ref.status === 'approved' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {ref.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                          No recommendations yet. Share your code to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info / Guidelines */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">1</div>
                  <p className="text-sm">Share your unique code with students via WhatsApp and social media.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">2</div>
                  <p className="text-sm">When they pay their 5,000 registration fee, your balance increases by 500  XAF.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">3</div>
                  <p className="text-sm">Withdrawal requests are processed every Friday.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <CardTitle className="text-lg text-yellow-800">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  Having issues with your recommendations? Contact the tech team via WhatsApp for resolution.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbassadorPortal;
