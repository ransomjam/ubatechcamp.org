import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Wallet, 
  BookOpen, 
  ArrowUpRight, 
  CheckCircle, 
  Copy, 
  LogOut, 
  DollarSign,
  Briefcase,
  Globe,
  UserCheck,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PROGRAM_OPTIONS } from '@/lib/programs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const VolunteerConsole = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [volunteer, setVolunteer] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [stipends, setStipends] = useState<any[]>([]);
  const [totalCourseEnrollment, setTotalCourseEnrollment] = useState(0);
  
  // Executive-specific state
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [requestForm, setRequestForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'pro',
    course_teaching: ''
  });
  const [allAmbassadorsCount, setAllAmbassadorsCount] = useState(0);
  const [myAmbassadors, setMyAmbassadors] = useState<any[]>([]);
  const [allParticipants, setAllParticipants] = useState<any[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        toast({
          title: "Account Not Found",
          description: "We couldn't find an executive or staff account with that email.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (data.status !== 'approved') {
        toast({
          title: "Access Restricted",
          description: "Your staff account is not yet active. Please contact admin.",
          variant: "default"
        });
        setLoading(false);
        return;
      }

      setVolunteer(data);
      fetchDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tutors')
        .insert([{
          ...requestForm,
          status: 'pending',
          recommendation_code: Math.random().toString(36).substring(2, 7).toUpperCase(),
          course_teaching: requestForm.role === 'volunteer' ? requestForm.course_teaching : 'N/A'
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            variant: "destructive",
            title: "Already Requested",
            description: "An account with this email already exists or has been requested.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Request Sent Successfully",
          description: "Your executive access request has been submitted. Our team will review and contact you.",
        });
        setIsRequestingAccess(false);
        setRequestForm({ full_name: '', email: '', phone: '', role: 'pro' });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (volunteerData: any) => {
    // 1. Fetch Recommendations (Global for all staff)
    const { data: refs } = await supabase
      .from('registrations')
      .select('full_name, status, created_at')
      .eq('recommendation_code', volunteerData.recommendation_code)
      .order('created_at', { ascending: false });
    
    setRecommendations(refs || []);

    // 2. Fetch Stipends (Global for all staff)
    const { data: stips } = await supabase
      .from('tutor_stipends')
      .select('*')
      .eq('tutor_id', volunteerData.id)
      .order('created_at', { ascending: false });
    
    setStipends(stips || []);

    // 3. Role-specific logic
    const isExecutive = ['pro', 'media', 'community'].includes(volunteerData.role);
    
    if (isExecutive) {
      // PRO, Media, Community: Fetch Ambassador Counts
      const { count: ambCount } = await supabase
        .from('ambassadors')
        .select('id', { count: 'exact', head: true });
      
      setAllAmbassadorsCount(ambCount || 0);

      // Fetch Ambassadors onboarded by THIS specific executive
      const { data: myAmbs } = await supabase
        .from('ambassadors')
        .select('full_name, email, status, created_at') // Removed city, institution as they might be missing
        .eq('onboarded_by_code', volunteerData.recommendation_code)
        .order('created_at', { ascending: false });
      
      setMyAmbassadors(myAmbs || []);
    }

    if (volunteerData.role === 'media' || volunteerData.role === 'community') {
      // Media & Community: Fetch all participants (basic info only)
      const { data: participants } = await supabase
        .from('registrations')
        .select('full_name, email, institution, program, status, created_at')
        .order('created_at', { ascending: false });
      
      setAllParticipants(participants || []);
    }

    // 4. Fetch Course Enrollment (specifically for volunteers)
    if (volunteerData.role === 'volunteer') {
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('program', volunteerData.course_teaching)
        .eq('status', 'completed');
      
      setTotalCourseEnrollment(count || 0);
    }
  };

  const copyRecommendationCode = () => {
    navigator.clipboard.writeText(volunteer.recommendation_code);
    toast({
      title: "Copied!",
      description: "Recommendation code copied.",
    });
  };

  if (!volunteer) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              {isRequestingAccess ? "Staff & Tutor Onboarding" : "Executive & Tutor Console"}
            </CardTitle>
            <CardDescription>
              {isRequestingAccess 
                ? "Apply for a staff or instructor role in the camp"
                : "Secure access for Tutors, PROs and Managers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isRequestingAccess ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="email">Official Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@institution.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11" disabled={loading}>
                  {loading ? "Verifying Credentials..." : "Access Professional Dashboard"}
                </Button>
                <div className="pt-2 text-center">
                  <button 
                    type="button"
                    onClick={() => setIsRequestingAccess(true)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    New Staff/Tutor? Request Portal Access
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      placeholder="John Doe" 
                      value={requestForm.full_name}
                      onChange={e => setRequestForm({...requestForm, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="req_email">Email Address</Label>
                    <Input 
                      id="req_email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={requestForm.email}
                      onChange={e => setRequestForm({...requestForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="677..." 
                        value={requestForm.phone}
                        onChange={e => setRequestForm({...requestForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Desired Role</Label>
                      <Select 
                        value={requestForm.role} 
                        onValueChange={(v) => setRequestForm({...requestForm, role: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volunteer">Volunteer Instructor</SelectItem>
                          <SelectItem value="pro">Public Relations (PRO)</SelectItem>
                          <SelectItem value="media">Media & Content</SelectItem>
                          <SelectItem value="community">Community Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {requestForm.role === 'volunteer' && (
                    <div className="space-y-2">
                      <Label>Course you are teaching</Label>
                      <Select 
                        value={requestForm.course_teaching} 
                        onValueChange={(v) => setRequestForm({...requestForm, course_teaching: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROGRAM_OPTIONS.map((course) => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-11" disabled={loading}>
                  {loading ? "Submitting Request..." : "Submit Access Request"}
                </Button>
                <div className="pt-2 text-center">
                  <button 
                    type="button"
                    onClick={() => setIsRequestingAccess(false)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleTitle = () => {
    switch(volunteer.role) {
      case 'pro': return 'Public Relations Officer';
      case 'media': return 'Media & Communications';
      case 'community': return 'Community Manager';
      default: return 'Volunteer Instructor';
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">{getRoleTitle()} Dashboard</h1>
            <p className="text-muted-foreground pt-1 italic font-medium font-sans">
              Welcome, {volunteer.full_name} 
              {volunteer.role === 'volunteer' && ` — ${volunteer.course_teaching}`}
            </p>
          </div>
          <Button variant="outline" onClick={() => setVolunteer(null)} className="flex items-center gap-2 border-primary/20 hover:bg-primary/5">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider uppercase">Your Stipends</p>
                  <h3 className="text-3xl font-bold mt-1 text-white">{(volunteer.balance_cents / 1).toLocaleString()} XAF</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-[10px] text-primary-foreground/80 font-medium">Accumulated rewards for your professional service.</p>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Direct Recommendations</p>
                  <h3 className="text-3xl font-bold mt-1 text-primary">{recommendations.length}</h3>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                Students registered with your code
              </div>
            </CardContent>
          </Card>

          {['pro', 'media', 'community'].includes(volunteer.role) ? (
            <>
              <Card className="border-primary/10">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total Ambassadors</p>
                      <h3 className="text-3xl font-bold mt-1 text-foreground">{allAmbassadorsCount}</h3>
                    </div>
                    <div className="p-2 bg-blue-5000 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground font-medium uppercase tracking-tighter italic">
                    All regions / institutions
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-primary/[0.02]">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Onboarded by You</p>
                      <h3 className="text-3xl font-bold mt-1 text-primary">{myAmbassadors.length}</h3>
                    </div>
                    <div className="p-2 bg-green-5000 rounded-lg">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                    Ambassadors recruited using your code
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="border-primary/10">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider font-sans">Course Enrollment</p>
                      <h3 className="text-3xl font-bold mt-1 text-foreground">{totalCourseEnrollment}</h3>
                    </div>
                    <div className="p-2 bg-purple-5000 rounded-lg">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                    Students in {volunteer.course_teaching}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed border-primary/40 shadow-none bg-primary/[0.02]">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-primary text-sm font-semibold uppercase tracking-wider">Your Code</p>
                      <h3 className="text-2xl font-mono font-bold mt-1 text-primary">{volunteer.recommendation_code}</h3>
                    </div>
                    <Button size="icon" variant="ghost" className="text-primary hover:bg-primary/10" onClick={copyRecommendationCode}>
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="mt-4 text-[10px] text-muted-foreground font-medium uppercase">Share for academic recommendations.</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {['pro', 'media', 'community'].includes(volunteer.role) && (
          <div className="mb-8">
            <Card className="border-primary/20 bg-primary/[0.01]">
              <CardContent className="py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Share2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Your Executive Recommendation Code</h4>
                    <p className="text-xs text-muted-foreground">Share this with prospective ambassadors and students.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <code className="bg-white border-2 border-primary/20 px-6 py-2 rounded-lg font-mono text-xl font-extrabold text-primary tracking-widest flex-1 text-center">
                    {volunteer.recommendation_code}
                  </code>
                  <Button onClick={copyRecommendationCode} className="h-11 px-6">
                    <Copy className="w-4 h-4 mr-2" /> Copy Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Executive Row (Ambassadors list) */}
        {['pro', 'media', 'community'].includes(volunteer.role) && (
          <div className="grid grid-cols-1 gap-8 mb-8">
            <Card>
              <CardHeader className="border-b bg-muted/20">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      Onboarded Ambassadors
                    </CardTitle>
                    <CardDescription>People recruited using your professional code.</CardDescription>
                  </div>
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold text-primary">
                    {myAmbassadors.length} TOTAL
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Institution</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myAmbassadors.map((amb, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm">{amb.full_name}</TableCell>
                          <TableCell className="text-xs">{amb.institution}</TableCell>
                          <TableCell className="text-xs">{amb.city}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              amb.status === 'active' ? 'bg-green-5000 text-green-700' : 'bg-yellow-5000 text-yellow-700'
                            }`}>
                              {amb.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-[10px] text-muted-foreground italic">
                            {new Date(amb.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {myAmbassadors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                            No ambassadors recruited yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Media / Community Row (All Participants) */}
        {['media', 'community'].includes(volunteer.role) && (
          <div className="grid grid-cols-1 gap-8 mb-8">
            <Card className="border-purple-200">
              <CardHeader className="border-b bg-purple-50/50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 text-purple-700">
                      <Globe className="w-5 h-5" />
                      Global Participant Directory
                    </CardTitle>
                    <CardDescription>Real-time view of all camp registrations (Basic Info).</CardDescription>
                  </div>
                  <div className="bg-purple-5000 px-3 py-1 rounded-full text-xs font-bold text-purple-700">
                    {allParticipants.length} TOTAL
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allParticipants.slice(0, 5000).map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm flex items-center gap-2">
                             {p.full_name}
                          </TableCell>
                          <TableCell className="text-xs font-mono">{p.email}</TableCell>
                          <TableCell className="text-[10px] font-bold uppercase text-primary italic">{p.program}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'completed' ? 'bg-green-5000 text-green-700' : 'bg-yellow-5000 text-yellow-700'
                            }`}>
                              {p.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {allParticipants.length > 5000 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-xs text-muted-foreground italic">
                            Showing first 5000 participants...
                          </TableCell>
                        </TableRow>
                      )}
                      {allParticipants.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                            No participants registered yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Details Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stipends Table */}
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Monthly Stipends
              </CardTitle>
              <CardDescription>Payments sent to you from administration.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stipends.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-bold">{s.amount_cents.toLocaleString()} XAF</TableCell>
                      <TableCell className="text-xs">{s.payment_method}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{s.reference || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {stipends.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No stipends record found yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recommendations Table */}
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Recommended Students
              </CardTitle>
              <CardDescription>Students who registered using your code.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">{r.full_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {r.status === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          )}
                          <span className="text-xs capitalize">{r.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {recommendations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                        No recommendations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VolunteerConsole;
