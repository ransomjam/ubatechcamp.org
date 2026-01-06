
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  experience: string;
  skills: string;
  course_teaching: string;
  recommendation_code: string;
  balance_cents: number;
  status: string;
  role: string;
  created_at: string;
  student_count?: number;
  ambassador_count?: number;
}

interface TutorsTableProps {
  isSuperAdmin?: boolean;
}

const TutorsTable = ({ isSuperAdmin }: TutorsTableProps) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      
      // Fetch all tutors
      const { data: tutorsList, error: tutorsError } = await supabase
        .from("tutors")
        .select("*")
        .order("created_at", { ascending: false });

      if (tutorsError) throw tutorsError;

      // For each tutor, fetch their performance stats
      const enhancedTutors = await Promise.all((tutorsList || []).map(async (tutor) => {
        let sCount = 0;
        let aCount = 0;

        try {
          // Count students registered with their code
          const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('recommendation_code', tutor.recommendation_code);
          sCount = count || 0;
        } catch (e) {
          console.error("Error fetching student count for tutor", tutor.recommendation_code, e);
        }

        try {
          // Count ambassadors recruited by them
          const { count } = await supabase
            .from('ambassadors')
            .select('id', { count: 'exact', head: true })
            .eq('onboarded_by_code', tutor.recommendation_code);
          aCount = count || 0;
        } catch (e) {
          console.error("Error fetching ambassador count for tutor", tutor.recommendation_code, e);
        }
        
        return {
          ...tutor,
          student_count: sCount,
          ambassador_count: aCount
        };
      }));

      setVolunteers(enhancedTutors);
    } catch (error: any) {
      toast.error("Failed to fetch instructors: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("tutors")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
      toast.success(`Instructor status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleUpdate = async (id: string, newRole: string) => {
    try {
      setActionLoading(id + '_role');
      const { error } = await supabase
        .from("tutors")
        .update({ role: newRole })
        .eq("id", id);

      if (error) throw error;
      
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, role: newRole } : v));
      toast.success(`Role updated to ${newRole}`);
    } catch (error: any) {
      toast.error("Role update failed: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.recommendation_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search instructors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Info</TableHead>
              <TableHead>Background</TableHead>
              <TableHead>Requested Role/Course</TableHead>
              <TableHead>Rec. Code</TableHead>
              <TableHead>Performance</TableHead>
              {isSuperAdmin && <TableHead>Stipends</TableHead>}
              {isSuperAdmin && <TableHead>System Role</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 9 : 7} className="text-center py-8 text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredVolunteers.map((vol) => (
                <TableRow key={vol.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-primary">{vol.full_name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">{vol.role}</div>
                      <div className="text-xs text-muted-foreground">{vol.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] space-y-1">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground">{vol.department || 'N/A'}</div>
                      <div className="text-[10px] line-clamp-1 italic" title={vol.skills}>
                        {vol.skills || 'No skills listed'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-primary/5">
                      {vol.role === 'volunteer' ? vol.course_teaching : vol.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary">{vol.recommendation_code}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {vol.student_count} Students
                        </Badge>
                      </div>
                      {['pro', 'media', 'community'].includes(vol.role) && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] h-5 border-blue-200 text-blue-700 bg-blue-50">
                            {vol.ambassador_count} Ambassadors
                          </Badge>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="font-bold text-xs whitespace-nowrap">
                      {(vol.balance_cents / 1).toLocaleString()} XAF
                    </TableCell>
                  )}
                  {isSuperAdmin && (
                    <TableCell>
                        <select
                        className="text-[10px] bg-transparent border rounded p-1 font-medium"
                        value={vol.role || 'volunteer'}
                        onChange={(e) => handleRoleUpdate(vol.id, e.target.value)}
                        disabled={!!actionLoading}
                        >
                        <option value="volunteer">Volunteer</option>
                        <option value="pro">PRO</option>
                        <option value="media">Media</option>
                        <option value="community">Community</option>
                        <option value="super_admin">Super Admin</option>
                        </select>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge 
                      className="text-[10px] uppercase font-bold"
                      variant={vol.status === 'approved' ? 'default' : vol.status === 'rejected' ? 'destructive' : 'secondary'}
                    >
                      {vol.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {vol.status === 'pending' ? (
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(vol.id, 'approved')}
                          disabled={!!actionLoading || !isSuperAdmin}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(vol.id, 'rejected')}
                          disabled={!!actionLoading || !isSuperAdmin}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                       <span className="text-[10px] text-muted-foreground">{new Date(vol.created_at).toLocaleDateString()}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TutorsTable;
