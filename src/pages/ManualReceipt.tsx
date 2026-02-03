import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { generateInvoice } from "@/lib/invoice";
import { PROGRAM_OPTIONS } from "@/lib/programs";
import { PAYMENT_CONFIG } from "@/lib/payment-config";
import { supabase } from "@/lib/supabase";
import { Receipt, FileText, CheckCircle, Link2, Copy, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReceiptLink {
  id: string;
  token: string;
  program: string | null;
  amount: number | null;
  is_used: boolean;
  used_at: string | null;
  used_by_name: string | null;
  expires_at: string;
  created_at: string;
}

interface ReceiptRecord {
  id: string;
  full_name: string;
  email: string | null;
  institution: string | null;
  program: string;
  amount: number;
  trans_id: string;
  issued_date: string;
  issued_by: string;
  created_at: string;
}

const ManualReceipt = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("issue");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institution: "",
    program: "",
    amount: PAYMENT_CONFIG.REGISTRATION_FEE_XAF.toString(),
    transId: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedTransId, setGeneratedTransId] = useState("");

  // Link generation state
  const [linkFormData, setLinkFormData] = useState({
    program: "",
    amount: PAYMENT_CONFIG.REGISTRATION_FEE_XAF.toString(),
  });
  const [generatedLink, setGeneratedLink] = useState("");
  const [links, setLinks] = useState<ReceiptLink[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch links and receipts on mount
  useEffect(() => {
    fetchLinks();
    fetchReceipts();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('receipt_links')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setLinks(data || []);
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  };

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setReceipts(data || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  };

  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MAN-${timestamp}-${random}`.toUpperCase();
  };

  const generateLinkToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 24; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleGenerateReceipt = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast({ title: "Error", description: "Please enter student's full name", variant: "destructive" });
      return;
    }
    if (!formData.program) {
      toast({ title: "Error", description: "Please select a program/course", variant: "destructive" });
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    // Generate transaction ID if empty
    const transId = formData.transId.trim() || generateTransactionId();
    setGeneratedTransId(transId);

    // Format the date
    const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Save to database
    try {
      const { error } = await supabase.from('receipts').insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim() || null,
        institution: formData.institution.trim() || null,
        program: formData.program,
        amount: Number(formData.amount),
        trans_id: transId,
        issued_date: formData.date,
        issued_by: 'admin',
      });

      if (error) {
        console.error('Error saving receipt:', error);
        toast({ title: "Warning", description: "Receipt generated but failed to save to database", variant: "destructive" });
      }
    } catch (err) {
      console.error('Error saving receipt:', err);
    }

    // Generate the invoice/receipt
    generateInvoice({
      fullName: formData.fullName.trim(),
      email: formData.email.trim() || undefined,
      institution: formData.institution.trim() || undefined,
      program: formData.program,
      amount: Number(formData.amount),
      transId: transId,
      date: formattedDate,
    });

    setIsGenerated(true);
    fetchReceipts();
    toast({ 
      title: "Receipt Generated!", 
      description: `Receipt for ${formData.fullName} has been downloaded.` 
    });
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      institution: "",
      program: "",
      amount: PAYMENT_CONFIG.REGISTRATION_FEE_XAF.toString(),
      transId: "",
      date: new Date().toISOString().split('T')[0],
    });
    setIsGenerated(false);
    setGeneratedTransId("");
  };

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const token = generateLinkToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase.from('receipt_links').insert({
        token,
        program: linkFormData.program || null,
        amount: linkFormData.amount ? Number(linkFormData.amount) : null,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      const link = `${window.location.origin}/receipt/claim/${token}`;
      setGeneratedLink(link);
      
      fetchLinks();
      toast({ title: "Link Generated!", description: "One-time receipt link created successfully." });
    } catch (err) {
      console.error('Error generating link:', err);
      toast({ title: "Error", description: "Failed to generate link", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Link copied to clipboard." });
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase.from('receipt_links').delete().eq('id', id);
      if (error) throw error;
      fetchLinks();
      toast({ title: "Deleted", description: "Link removed." });
    } catch (err) {
      console.error('Error deleting link:', err);
      toast({ title: "Error", description: "Failed to delete link", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Receipt Management</h1>
          <p className="text-muted-foreground">Issue receipts and manage one-time links - UBaTech Camp</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="issue">Issue Receipt</TabsTrigger>
            <TabsTrigger value="links">Generate Links</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Tab 1: Issue Receipt Manually */}
          <TabsContent value="issue">
            <Card className="bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl max-w-lg mx-auto">
              <CardHeader className="border-b border-primary/10 pb-4">
                <CardTitle className="text-xl">Issue Receipt Manually</CardTitle>
                <CardDescription>Fill in student details to generate a receipt</CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {!isGenerated ? (
                  <>
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground font-medium">
                        Student's Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter student's full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="bg-background/50 border-primary/20"
                      />
                    </div>

                    {/* Email (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">
                        Student's Email <span className="text-muted-foreground text-sm">(Optional)</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
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
                      >
                        <SelectTrigger className="bg-background/50 border-primary/20">
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROGRAM_OPTIONS.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                          <SelectItem value="Custom Course">Custom Course</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-foreground font-medium">
                        Amount (XAF) *
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="5000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="bg-background/50 border-primary/20"
                      />
                    </div>

                    {/* Transaction ID (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="transId" className="text-foreground font-medium">
                        Transaction ID <span className="text-muted-foreground text-sm">(Optional)</span>
                      </Label>
                      <Input
                        id="transId"
                        placeholder="Leave blank to auto-generate"
                        value={formData.transId}
                        onChange={(e) => setFormData({ ...formData, transId: e.target.value })}
                        className="bg-background/50 border-primary/20"
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-foreground font-medium">
                        Payment Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-background/50 border-primary/20"
                      />
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerateReceipt}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 mt-4"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Generate & Download Receipt
                    </Button>
                  </>
                ) : (
                  /* Success State */
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Receipt Generated!
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Receipt for <strong>{formData.fullName}</strong> has been downloaded and saved.
                    </p>
                    
                    <div className="bg-muted/30 rounded-lg p-3 mb-4 text-left text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Program:</span> {formData.program}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Amount:</span> {Number(formData.amount).toLocaleString()} XAF
                      </p>
                      {formData.institution && (
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">School/Faculty:</span> {formData.institution}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', {
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
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Download Again
                      </Button>
                      <Button onClick={handleReset} size="sm" className="flex-1">
                        Issue New Receipt
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Generate One-Time Links */}
          <TabsContent value="links">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Link Generator */}
              <Card className="bg-card/95 backdrop-blur-md border-primary/20 shadow-xl">
                <CardHeader className="border-b border-primary/10 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Generate One-Time Link
                  </CardTitle>
                  <CardDescription>Create a link for students to claim their receipt</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Pre-fill Program (Optional) */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Pre-fill Program <span className="text-muted-foreground text-sm">(Optional)</span>
                    </Label>
                    <Select
                      value={linkFormData.program}
                      onValueChange={(value) => setLinkFormData({ ...linkFormData, program: value === "__none__" ? "" : value })}
                    >
                      <SelectTrigger className="bg-background/50 border-primary/20">
                        <SelectValue placeholder="Let student choose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Let student choose</SelectItem>
                        {PROGRAM_OPTIONS.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pre-fill Amount (Optional) */}
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Pre-fill Amount (XAF) <span className="text-muted-foreground text-sm">(Optional)</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={linkFormData.amount}
                      onChange={(e) => setLinkFormData({ ...linkFormData, amount: e.target.value })}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateLink}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    {isLoading ? "Generating..." : "Generate Link"}
                  </Button>

                  {generatedLink && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400 mb-2 font-medium">Link Generated!</p>
                      <div className="flex gap-2">
                        <Input
                          value={generatedLink}
                          readOnly
                          className="bg-background/50 text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(generatedLink)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This link expires in 7 days and can only be used once.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Links List */}
              <Card className="bg-card/95 backdrop-blur-md border-primary/20 shadow-xl">
                <CardHeader className="border-b border-primary/10 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Generated Links</CardTitle>
                    <CardDescription>Recent one-time links</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={fetchLinks}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                  {links.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No links generated yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Used By</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {links.slice(0, 10).map((link) => (
                          <TableRow key={link.id}>
                            <TableCell className="font-mono text-xs">
                              {link.token.substring(0, 8)}...
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1"
                                onClick={() => copyToClipboard(`${window.location.origin}/receipt/claim/${link.token}`)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              {link.is_used ? (
                                <Badge variant="secondary" className="bg-green-500/20 text-green-400">Used</Badge>
                              ) : new Date(link.expires_at) < new Date() ? (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-400">Expired</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              {link.used_by_name || "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-400 hover:text-red-500"
                                onClick={() => handleDeleteLink(link.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Receipt History */}
          <TabsContent value="history">
            <Card className="bg-card/95 backdrop-blur-md border-primary/20 shadow-xl">
              <CardHeader className="border-b border-primary/10 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Receipt History</CardTitle>
                  <CardDescription>All issued receipts</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchReceipts}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {receipts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No receipts issued yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Trans ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Issued By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">
                            {receipt.full_name}
                            {receipt.institution && (
                              <span className="block text-xs text-muted-foreground">{receipt.institution}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{receipt.program}</TableCell>
                          <TableCell>{receipt.amount.toLocaleString()} XAF</TableCell>
                          <TableCell className="font-mono text-xs">{receipt.trans_id.substring(0, 10)}...</TableCell>
                          <TableCell className="text-sm">{new Date(receipt.issued_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={receipt.issued_by === 'admin' ? 'border-primary/50' : 'border-green-500/50 text-green-400'}>
                              {receipt.issued_by === 'admin' ? 'Admin' : 'Self'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManualReceipt;
