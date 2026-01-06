
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { 
  TrendingUp, 
  Users, 
  Award, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trophy,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { toast } from "sonner";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CreditCard, Wallet, Banknote, ListOrdered } from "lucide-react";

import { useNavigate, Link } from "react-router-dom";
import PaymentsTable from "@/components/admin/PaymentsTable";
import WithdrawalsTable from "@/components/admin/WithdrawalsTable";
import StipendsTable from "@/components/admin/StipendsTable";

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStipends: 0,
    totalStudents: 0,
    totalAmbassadors: 0,
    totalTutors: 0,
    conversionRate: 0
  });
  const [topRecruiters, setTopRecruiters] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  
  // Drill-down states
  const [allRecruiters, setAllRecruiters] = useState<any[]>([]);
  const [selectedRecruiterCode, setSelectedRecruiterCode] = useState<string>("");
  const [recruitedStudents, setRecruitedStudents] = useState<any[]>([]);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email?.toLowerCase();
      const isSuper = userEmail === 'superadmin@ubatechcamp.com' || 
                      user?.user_metadata?.role === 'super';
      
      if (!user || !isSuper) {
        navigate("/admin/login");
        return;
      }
      fetchSuperStats();
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (selectedRecruiterCode) {
      fetchRecruitedStudents(selectedRecruiterCode);
    }
  }, [selectedRecruiterCode]);

  const fetchRecruitedStudents = async (code: string) => {
    try {
      setDrillDownLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select('full_name, email, program, status, created_at')
        .eq('recommendation_code', code)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRecruitedStudents(data || []);
    } catch (e) {
      toast.error("Failed to fetch students for this recruiter");
    } finally {
      setDrillDownLoading(false);
    }
  };

  const fetchSuperStats = async () => {
    try {
      setLoading(true);

      // 1. Fetch Total Revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount_cents')
        .eq('status', 'success');
      
      const revenue = (payments || []).reduce((acc, curr) => acc + (curr.amount_cents || 0), 0);

      // 2. Fetch Total Stipends
      const { data: stipends } = await supabase
        .from('tutor_stipends')
        .select('amount_cents');
      
      const totalStips = (stipends || []).reduce((acc, curr) => acc + (curr.amount_cents || 0), 0);

      // 3. Counts
      const { count: studentCount } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      const { count: ambCount } = await supabase.from('ambassadors').select('*', { count: 'exact', head: true });
      const { count: tutorCount } = await supabase.from('tutors').select('*', { count: 'exact', head: true }).eq('status', 'approved');

      // 4. Conversion (Mocked for now or based on total registrations vs paid)
      const { count: totalRegs } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
      const convRate = totalRegs ? ((studentCount || 0) / totalRegs) * 100 : 0;

      setStats({
        totalRevenue: revenue,
        totalStipends: totalStips,
        totalStudents: studentCount || 0,
        totalAmbassadors: ambCount || 0,
        totalTutors: tutorCount || 0,
        conversionRate: convRate
      });

      // 5. Top Recruiters Leaderboard
      const { data: tutors } = await supabase.from('tutors').select('full_name, recommendation_code, role');
      const recruiterPerformace = await Promise.all((tutors || []).slice(0, 10).map(async (t) => {
        let count = 0;
        try {
          if (t.recommendation_code) {
            const { count: c } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('recommendation_code', t.recommendation_code);
            count = c || 0;
          }
        } catch (e) {
          console.error("Error fetching recruiter stats:", e);
        }
        return { name: t.full_name, count, role: t.role };
      }));

      setTopRecruiters(recruiterPerformace.sort((a, b) => b.count - a.count).slice(0, 5));

      // 6. Fetch all potential recruiters (Staff + Ambassadors) for drill-down
      const { data: stf } = await supabase.from('tutors').select('full_name, recommendation_code, role');
      const { data: amb } = await supabase.from('ambassadors').select('full_name, recommendation_code');
      const combined = [
        ...(stf || []).map(s => ({ ...s, type: 'Staff' })),
        ...(amb || []).map(a => ({ ...a, type: 'Ambassador', role: 'ambassador' }))
      ].filter(r => r.recommendation_code);
      setAllRecruiters(combined);

      // 7. Mock Revenue Growth Data
      setRevenueData([
        { date: 'Jan 01', amount: revenue * 0.1 },
        { date: 'Jan 02', amount: revenue * 0.25 },
        { date: 'Jan 03', amount: revenue * 0.4 },
        { date: 'Jan 04', amount: revenue * 0.6 },
        { date: 'Jan 05', amount: revenue * 0.85 },
        { date: 'Jan 06', amount: revenue },
      ]);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load super stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-primary text-primary-foreground pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-primary-foreground/80" />
                <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 uppercase tracking-widest text-[10px]">Super Admin Access</Badge>
              </div>
              <h1 className="text-4xl font-bold font-heading tracking-tight">Executive Commander Centre</h1>
              <p className="text-primary-foreground/70 mt-2 max-w-xl">
                Global financial oversight and strategic performance monitoring for UBa Tech Camp operations.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
               <Link to="/admin/dashboard?view=admin">
                  <Button variant="outline" className="text-primary-foreground border-primary-foreground/30 hover:bg-white/10 w-full md:w-auto">
                    Manage Staff & Students
                  </Button>
               </Link>
               <Card className="bg-white/10 border-none text-white backdrop-blur-sm px-6 py-4">
                  <p className="text-xs uppercase tracking-widest font-bold opacity-70">Net Operating Profit</p>
                  <h2 className="text-2xl font-bold">{(stats.totalRevenue - stats.totalStipends).toLocaleString()} XAF</h2>
               </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Gross Revenue</p>
                  <h3 className="text-3xl font-bold mt-1 tracking-tighter">{(stats.totalRevenue).toLocaleString()} XAF</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-bold">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.5% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Staff</p>
                  <h3 className="text-3xl font-bold mt-1 tracking-tighter">{stats.totalTutors}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-blue-600 text-xs font-bold">
                <span>{stats.totalAmbassadors} Ambassadors active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Total Expenses</p>
                  <h3 className="text-3xl font-bold mt-1 tracking-tighter">{(stats.totalStipends).toLocaleString()} XAF</h3>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-red-600 text-xs font-bold">
                <ArrowDownRight className="w-4 h-4" />
                <span>Payouts to Staff</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Conversion</p>
                  <h3 className="text-3xl font-bold mt-1 tracking-tighter">{stats.conversionRate.toFixed(1)}%</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-muted-foreground text-xs font-bold">
                <span>Registration to Payout</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-white border-b border-muted/50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Revenue Trajectory
              </CardTitle>
              <CardDescription>Visual growth of intake from registrations</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `XAF ${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [val.toLocaleString() + ' XAF', 'Revenue']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-white border-b border-muted/50">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Top Commanders
              </CardTitle>
              <CardDescription>Highest recruitment impact by staff</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="">
                {(topRecruiters || []).map((recruiter, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                        idx === 1 ? 'bg-slate-100 text-slate-700' :
                        idx === 2 ? 'bg-amber-100 text-amber-900' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{recruiter.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{recruiter.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{recruiter.count}</p>
                      <p className="text-[10px] text-muted-foreground lowercase">signups</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-white border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Recruitment Drill-down
                    </CardTitle>
                    <CardDescription>View detailed list of students registered by individual staff or ambassadors.</CardDescription>
                </div>
                <div className="w-full md:w-64">
                    <Select value={selectedRecruiterCode} onValueChange={setSelectedRecruiterCode}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a recruiter..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allRecruiters.map((r) => (
                                <SelectItem key={r.recommendation_code} value={r.recommendation_code}>
                                    {r.full_name} ({r.recommendation_code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {drillDownLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : selectedRecruiterCode ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recruitedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                            No students found for this recruiter code yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recruitedStudents.map((s, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-bold">{s.full_name}</TableCell>
                                            <TableCell className="text-xs">{s.email}</TableCell>
                                            <TableCell className="text-xs">{s.program}</TableCell>
                                            <TableCell>
                                                <Badge variant={s.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                                                    {s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 text-muted-foreground">
                        <ArrowUpRight className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a staff member or ambassador above to view their recruits</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <section className="mt-12 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Financial & Payout Intelligence</h2>
                    <p className="text-muted-foreground">Manage transaction approvals and staff fund disbursements.</p>
                </div>
            </div>

            <Tabs defaultValue="payments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="payments" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Student Payments
                    </TabsTrigger>
                    <TabsTrigger value="withdrawals" className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Ambassador Payouts
                    </TabsTrigger>
                    <TabsTrigger value="stipends" className="gap-2">
                        <Banknote className="h-4 w-4" />
                        Staff Stipends
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="payments" className="space-y-4">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ListOrdered className="w-5 h-5 text-primary" />
                                Payment Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PaymentsTable isSuperAdmin={true} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdrawals" className="space-y-4">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-primary" />
                                Withdrawal Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <WithdrawalsTable isSuperAdmin={true} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stipends" className="space-y-4">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-primary" />
                                Stipend Disbursement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StipendsTable isSuperAdmin={true} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </section>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg bg-slate-900 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-400" />
                        System Management
                    </CardTitle>
                    <CardDescription className="text-slate-400">Global system configuration and data exports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Export Financial Report</p>
                                <p className="text-xs text-slate-400">Monthly CSV for internal auditing</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </div>

                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30">
                                <ShieldCheck className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Manage Admin Roles</p>
                                <p className="text-xs text-slate-400">Assign or revoke system permissions</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-primary via-primary to-indigo-700 text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
                    <Badge variant="secondary" className="bg-white text-primary font-black px-4 py-1 text-base">VIP</Badge>
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">UBa Tech Camp 2026</h3>
                <p className="text-primary-foreground/80 text-sm mb-6 max-w-[250px]">
                    You are currently in Super Admin mode. All data is real-time and immutable.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-primary hover:bg-slate-100 font-bold py-6"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/admin/login");
                  }}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Exit Command Centre
                </Button>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
