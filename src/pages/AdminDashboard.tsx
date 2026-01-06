import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Mail, Award, GraduationCap, ShieldCheck, Loader2 } from "lucide-react";
import RegistrationsTable from "@/components/admin/RegistrationsTable";
import NewsletterTable from "@/components/admin/NewsletterTable";
import AmbassadorsTable from "@/components/admin/AmbassadorsTable";
import TutorsTable from "@/components/admin/TutorsTable";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const userEmail = session.user.email?.toLowerCase();
      const isSuperEmail = userEmail === 'superadmin@ubatechcamp.com';
      const role = isSuperEmail ? 'super' : (session.user.user_metadata?.role || "admin");
      setUserRole(role);
      
      // Auto-redirect super admin to their dedicated panel unless they specifically chose to view the admin dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const isViewingAdmin = searchParams.get('view') === 'admin';
      
      if (role === 'super' && !isViewingAdmin) {
        navigate('/admin/super', { replace: true });
        return;
      }
      
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isSuperAdmin = userRole === "super";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">UBA Tech Camp Management</p>
          </div>
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <Link to="/admin/super">
                <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Command Centre
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="registrations" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Registrations</span>
            </TabsTrigger>
            <TabsTrigger value="ambassadors" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Ambassadors</span>
            </TabsTrigger>
            <TabsTrigger value="tutors" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Staff & Tutors</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Student Registrations</h2>
                <p className="text-sm text-muted-foreground">
                  Manage all student registration applications
                </p>
              </div>
            </div>
            <RegistrationsTable />
          </TabsContent>

          <TabsContent value="ambassadors" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Ambassador Management</h2>
                <p className="text-sm text-muted-foreground">
                  Verify students and approve recommendation codes
                </p>
              </div>
            </div>
            <AmbassadorsTable isSuperAdmin={isSuperAdmin} />
          </TabsContent>

          <TabsContent value="tutors" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Staff & Executive Management</h2>
                <p className="text-sm text-muted-foreground">
                  Monitor performance and manage permissions for Tutors and Executives
                </p>
              </div>
            </div>
            <TutorsTable isSuperAdmin={isSuperAdmin} />
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Newsletter Subscribers</h2>
                <p className="text-sm text-muted-foreground">
                  Manage newsletter subscription list
                </p>
              </div>
            </div>
            <NewsletterTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
