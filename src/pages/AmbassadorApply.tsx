import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, ArrowRight, UserCircle, School, BookOpen, GraduationCap, Phone, Mail, Award, UsersRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AmbassadorApply = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    school_faculty: '',
    department: '',
    level: '',
    role: 'Student Leader',
    phone: '',
    email: '',
    onboarded_by_code: ''
  });

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setFormData(prev => ({ ...prev, onboarded_by_code: codeFromUrl }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.from('ambassadors').insert([
        {
          full_name: formData.full_name,
          school_faculty: formData.school_faculty,
          department: formData.department,
          level: formData.level,
          role: formData.role,
          phone: formData.phone,
          email: formData.email,
          onboarded_by_code: formData.onboarded_by_code || null,
          status: 'pending',
          balance_cents: 0
        }
      ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Applied",
            description: "An application with this email or phone already exists.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast({
          title: "Application Submitted!",
          description: "We've received your application. We'll contact you soon.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold">Application Received!</h2>
          <p className="text-muted-foreground text-lg">
            Thank you for your interest in becoming a UBa Tech Camp Ambassador. 
            Our admin team will review your application and get back to you via email or phone within 48 hours.
          </p>
          <Button asChild className="mt-8">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-4 lg:text-5xl">
            Join the Ambassador Program
          </h1>
        </div>

        <Card className="border-primary/20 shadow-xl overflow-hidden glass-card">
          <CardHeader className="bg-primary text-primary-foreground p-8">
            <CardTitle className="text-2xl">Ambassador Application</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Fill out the form below to apply for the ambassador role at UBa Tech Camp.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Full Name
                  </Label>
                  <Input 
                    id="full_name" 
                    required 
                    placeholder="John Doe" 
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact Number (WhatsApp Preferred)
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    required 
                    placeholder="677 000 000" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Your Current Role
                  </Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={value => setFormData({...formData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student Leader">Student Leader</SelectItem>
                      <SelectItem value="Class Coordinator">Class Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_faculty" className="flex items-center gap-2">
                    <School className="w-4 h-4" /> School/Faculty
                  </Label>
                  <Input 
                    id="school_faculty" 
                    required 
                    placeholder="COLTECH / FS" 
                    value={formData.school_faculty}
                    onChange={e => setFormData({...formData, school_faculty: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Department
                  </Label>
                  <Input 
                    id="department" 
                    required 
                    placeholder="Computer Engineering" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level" className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Level
                  </Label>
                  <Input 
                    id="level" 
                    required 
                    placeholder="Level 200 / 300" 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                <Label htmlFor="onboarded_by_code" className="flex items-center gap-2 text-primary">
                  <Award className="w-4 h-4" /> Executive Onboarding Code (Optional)
                </Label>
                <Input 
                  id="onboarded_by_code" 
                  placeholder="CODE123" 
                  value={formData.onboarded_by_code}
                  onChange={e => setFormData({...formData, onboarded_by_code: e.target.value.toUpperCase()})}
                 // className="bg-white border-primary/20"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  If an executive (PRO, Media Lead, etc.) invited you, enter their recommendation code here.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold" 
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmbassadorApply;
