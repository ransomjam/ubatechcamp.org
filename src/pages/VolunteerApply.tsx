import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, BookOpen, Phone, Mail, UserCircle, Briefcase, Building, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PROGRAM_OPTIONS } from '@/lib/programs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VolunteerApply = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [useOtherCourse, setUseOtherCourse] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    experience: '',
    skills: '',
    course_teaching: '',
    other_course: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalCourse = useOtherCourse ? formData.other_course : formData.course_teaching;

    if (!finalCourse) {
      toast({
        title: "Missing Information",
        description: "Please specify the course you want to teach.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('tutors').insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          experience: formData.experience,
          skills: formData.skills,
          course_teaching: finalCourse,
          role: 'volunteer',
          status: 'pending',
          balance_cents: 0
        }
      ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Applied",
            description: "An application with this email already exists.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast({
          title: "Application Submitted!",
          description: "We've received your instructor application. Our academic team will review your profile.",
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
          <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-primary">Application Received!</h2>
          <p className="text-muted-foreground text-lg">
            Thank you for applying to join the UBa Tech Camp as a Volunteer Instructor. 
            Our regional academic board will review your credentials and contact you via email with the next steps.
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-4 lg:text-5xl">
            Register as a Volunteer Instructor
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our academic team and contribute to the growth of Cameroon's tech ecosystem. Volunteers receive periodic stipends for their teaching contributions.
          </p>
        </div>

        <Card className="border-primary/20 shadow-xl overflow-hidden glass-card">
          <CardHeader className="bg-primary text-primary-foreground p-8">
            <CardTitle className="text-2xl">Volunteer Instructor Application</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Complete the form below with your professional background and teaching interests.
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
                    placeholder="Enter your full name" 
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
                    placeholder="example@email.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    required 
                    placeholder="6xx xxx xxx" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <Building className="w-4 h-4" /> Department / Institution
                  </Label>
                  <Input 
                    id="department" 
                    required 
                    placeholder="e.g. Computer Engineering, UBa" 
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Course to Teach
                  </Label>
                  <Select 
                    onValueChange={value => {
                      if (value === 'other') {
                        setUseOtherCourse(true);
                      } else {
                        setUseOtherCourse(false);
                        setFormData({...formData, course_teaching: value});
                      }
                    }}
                    required={!useOtherCourse}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select from available programs" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAM_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value="other" className="font-bold text-primary">Other (Not on list)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {useOtherCourse && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label htmlFor="other_course">Specify Course Name</Label>
                    <Input 
                      id="other_course" 
                      required 
                      placeholder="Enter the course title you wish to teach"
                      value={formData.other_course}
                      onChange={e => setFormData({...formData, other_course: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Professional Experience
                </Label>
                <Textarea 
                  id="experience" 
                  required 
                  placeholder="Tell us about your previous teaching or industry experience..." 
                  className="min-h-[5000px]"
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> Skills & Expertise
                </Label>
                <Textarea 
                  id="skills" 
                  required 
                  placeholder="Key technical skills, certifications, or programming languages..." 
                  className="min-h-[5000px]"
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full text-lg h-12 bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "Processing Registration..." : "Submit Volunteer Registration"}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  By submitting this form, you agree to our professional standards and code of conduct.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VolunteerApply;
