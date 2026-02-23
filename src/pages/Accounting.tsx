import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  Lock, Loader2, LogOut, Search, Download, RefreshCw,
  DollarSign, Users, FileText, TrendingDown, TrendingUp,
  Plus, Trash2, BarChart3, Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────

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

interface Expenditure {
  id: string;
  description: string;
  category: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

const EXPENSE_CATEGORIES = [
  "Equipment",
  "Venue",
  "Marketing",
  "Transport",
  "Food & Refreshments",
  "Salaries & Stipends",
  "Printing & Stationery",
  "Miscellaneous",
];

// ── Component ──────────────────────────────────────────────

const Accounting = () => {
  const { toast } = useToast();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Data state
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("__all__");
  const [issuedByFilter, setIssuedByFilter] = useState("__all__");

  // Expenditure form
  const [expForm, setExpForm] = useState({
    description: "",
    category: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
  });
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // ── Auth ──────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsAuthenticated(true);
      toast({ title: "Login successful", description: "Welcome to Accounting" });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
  };

  // ── Data fetching ─────────────────────────────────────────

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const [receiptRes, expRes] = await Promise.all([
        supabase.from("receipts").select("*").order("created_at", { ascending: false }),
        supabase.from("expenditures").select("*").order("created_at", { ascending: false }),
      ]);

      if (receiptRes.error) console.error("Receipts error:", receiptRes.error);
      if (expRes.error) console.error("Expenditures error:", expRes.error);

      setReceipts(receiptRes.data || []);
      setExpenditures(expRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  // ── Expenditure CRUD ──────────────────────────────────────

  const handleAddExpense = async () => {
    if (!expForm.description.trim()) {
      toast({ title: "Error", description: "Please enter a description", variant: "destructive" });
      return;
    }
    if (!expForm.category) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }
    if (!expForm.amount || isNaN(Number(expForm.amount)) || Number(expForm.amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    setIsAddingExpense(true);
    try {
      const { error } = await supabase.from("expenditures").insert({
        description: expForm.description.trim(),
        category: expForm.category,
        amount: Number(expForm.amount),
        expense_date: expForm.expense_date,
      });
      if (error) throw error;

      setExpForm({
        description: "",
        category: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      fetchData();
      toast({ title: "Expense Added", description: "Expenditure recorded successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add expense", variant: "destructive" });
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenditures").delete().eq("id", id);
      if (error) throw error;
      fetchData();
      toast({ title: "Deleted", description: "Expenditure removed." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  // ── Computed data ─────────────────────────────────────────

  const totalRevenue = useMemo(() => receipts.reduce((s, r) => s + r.amount, 0), [receipts]);
  const totalExpenses = useMemo(() => expenditures.reduce((s, e) => s + e.amount, 0), [expenditures]);
  const netBalance = totalRevenue - totalExpenses;

  const programs = useMemo(() => {
    const set = new Set(receipts.map((r) => r.program));
    return Array.from(set).sort();
  }, [receipts]);

  const programBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    receipts.forEach((r) => {
      if (!map[r.program]) map[r.program] = { count: 0, total: 0 };
      map[r.program].count++;
      map[r.program].total += r.amount;
    });
    return Object.entries(map)
      .map(([program, data]) => ({ program, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [receipts]);

  const expenseCategoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenditures.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenditures]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.trans_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = programFilter === "__all__" || r.program === programFilter;
      const matchesIssued = issuedByFilter === "__all__" || r.issued_by === issuedByFilter;
      return matchesSearch && matchesProgram && matchesIssued;
    });
  }, [receipts, searchQuery, programFilter, issuedByFilter]);

  // ── CSV Export ────────────────────────────────────────────

  const exportCSV = () => {
    const headers = ["Name", "Email", "Institution", "Program", "Amount (XAF)", "Transaction ID", "Date", "Issued By"];
    const rows = filteredReceipts.map((r) => [
      r.full_name,
      r.email || "",
      r.institution || "",
      r.program,
      r.amount,
      r.trans_id,
      r.issued_date,
      r.issued_by,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ubatechcamp_accounting_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: `${filteredReceipts.length} records exported to CSV.` });
  };

  // ── Login screen ──────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl">
          <CardHeader className="text-center border-b border-primary/10 pb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Accounting Portal</CardTitle>
            <CardDescription>Sign in to access financial records — UBaTech Camp</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="acc-email">Email</Label>
                <Input
                  id="acc-email"
                  type="email"
                  placeholder="admin@ubatechcamp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acc-password">Password</Label>
                <Input
                  id="acc-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-primary/20"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isAuthLoading}>
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              Accounting Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">UBaTech Camp — Financial Overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isDataLoading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${isDataLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/80 backdrop-blur-md border-emerald-500/20 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">XAF</span></p>
              <p className="text-xs text-muted-foreground mt-1">{receipts.length} receipts</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-md border-red-500/20 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Expenditures</span>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">{totalExpenses.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">XAF</span></p>
              <p className="text-xs text-muted-foreground mt-1">{expenditures.length} records</p>
            </CardContent>
          </Card>

          <Card className={`bg-card/80 backdrop-blur-md shadow-lg ${netBalance >= 0 ? "border-blue-500/20" : "border-orange-500/20"}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Net Balance</span>
                <Wallet className={`w-4 h-4 ${netBalance >= 0 ? "text-blue-400" : "text-orange-400"}`} />
              </div>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-blue-400" : "text-orange-400"}`}>
                {netBalance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">XAF</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Revenue − Expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-md border-violet-500/20 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Participants</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-violet-400">
                {new Set(receipts.map((r) => r.full_name.toLowerCase())).size}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{programs.length} programs</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="expenditures">Expenditures</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Participants ───────────────────────── */}
          <TabsContent value="participants">
            <Card className="bg-card/90 backdrop-blur-md border-primary/10 shadow-xl">
              <CardHeader className="border-b border-primary/10 pb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      All Participants
                    </CardTitle>
                    <CardDescription>{filteredReceipts.length} of {receipts.length} records</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportCSV}>
                    <Download className="w-4 h-4 mr-1" /> Export CSV
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or trans ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 border-primary/20"
                    />
                  </div>
                  <Select value={programFilter} onValueChange={setProgramFilter}>
                    <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-primary/20">
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Programs</SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={issuedByFilter} onValueChange={setIssuedByFilter}>
                    <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-primary/20">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Sources</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="self">Self-Claimed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                {filteredReceipts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No records found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[24px]">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Institution</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Trans ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceipts.map((r, i) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{r.full_name}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.email || "—"}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{r.institution || "—"}</TableCell>
                          <TableCell className="text-sm">{r.program}</TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{r.amount.toLocaleString()} XAF</TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">{r.trans_id.substring(0, 12)}…</TableCell>
                          <TableCell className="text-sm">{new Date(r.issued_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={r.issued_by === "admin" ? "border-primary/50 text-primary" : "border-emerald-500/50 text-emerald-400"}
                            >
                              {r.issued_by === "admin" ? "Admin" : "Self"}
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

          {/* ── Tab 2: Expenditures ──────────────────────── */}
          <TabsContent value="expenditures">
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Add Expense Form */}
              <Card className="lg:col-span-2 bg-card/90 backdrop-blur-md border-primary/10 shadow-xl">
                <CardHeader className="border-b border-primary/10 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Expenditure
                  </CardTitle>
                  <CardDescription>Record a new expense — it will be subtracted from revenue</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      placeholder="e.g. Projector rental"
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v })}>
                      <SelectTrigger className="bg-background/50 border-primary/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (XAF) *</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={expForm.amount}
                      onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={expForm.expense_date}
                      onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })}
                      className="bg-background/50 border-primary/20"
                    />
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 mt-2"
                    onClick={handleAddExpense}
                    disabled={isAddingExpense}
                  >
                    {isAddingExpense ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Expense List */}
              <Card className="lg:col-span-3 bg-card/90 backdrop-blur-md border-primary/10 shadow-xl">
                <CardHeader className="border-b border-primary/10 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      All Expenditures
                    </CardTitle>
                    <CardDescription>{expenditures.length} records — {totalExpenses.toLocaleString()} XAF total</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[520px] overflow-y-auto">
                  {expenditures.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No expenditures recorded yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenditures.map((e, i) => (
                          <TableRow key={e.id}>
                            <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                            <TableCell className="font-medium">{e.description}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">{e.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-red-400 whitespace-nowrap">
                              −{e.amount.toLocaleString()} XAF
                            </TableCell>
                            <TableCell className="text-sm">{new Date(e.expense_date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => handleDeleteExpense(e.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* ── Tab 3: Breakdown ─────────────────────────── */}
          <TabsContent value="breakdown">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue by Program */}
              <Card className="bg-card/90 backdrop-blur-md border-primary/10 shadow-xl">
                <CardHeader className="border-b border-primary/10 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Revenue by Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {programBreakdown.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No data</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Program</TableHead>
                          <TableHead>Receipts</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {programBreakdown.map((p) => (
                          <TableRow key={p.program}>
                            <TableCell className="font-medium text-sm">{p.program}</TableCell>
                            <TableCell>{p.count}</TableCell>
                            <TableCell className="font-medium text-emerald-400 whitespace-nowrap">{p.total.toLocaleString()} XAF</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-primary/20">
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="font-bold">{receipts.length}</TableCell>
                          <TableCell className="font-bold text-emerald-400 whitespace-nowrap">{totalRevenue.toLocaleString()} XAF</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Expenses by Category */}
              <Card className="bg-card/90 backdrop-blur-md border-primary/10 shadow-xl">
                <CardHeader className="border-b border-primary/10 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {expenseCategoryBreakdown.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No expenses recorded</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>% of Expenses</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseCategoryBreakdown.map((c) => (
                          <TableRow key={c.category}>
                            <TableCell className="font-medium text-sm">{c.category}</TableCell>
                            <TableCell className="font-medium text-red-400 whitespace-nowrap">{c.total.toLocaleString()} XAF</TableCell>
                            <TableCell className="text-muted-foreground">
                              {totalExpenses > 0 ? ((c.total / totalExpenses) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-primary/20">
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="font-bold text-red-400 whitespace-nowrap">{totalExpenses.toLocaleString()} XAF</TableCell>
                          <TableCell className="font-bold">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card className="md:col-span-2 bg-gradient-to-r from-primary/5 via-card/90 to-primary/5 backdrop-blur-md border-primary/20 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                      <p className="text-xl font-bold text-emerald-400">{totalRevenue.toLocaleString()} XAF</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                      <p className="text-xl font-bold text-red-400">−{totalExpenses.toLocaleString()} XAF</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                      <p className={`text-xl font-bold ${netBalance >= 0 ? "text-blue-400" : "text-orange-400"}`}>
                        {netBalance.toLocaleString()} XAF
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Accounting;
