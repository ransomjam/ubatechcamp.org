import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface AmbassadorsTableProps {
  isSuperAdmin?: boolean;
}

export const AmbassadorsTable = ({ isSuperAdmin }: AmbassadorsTableProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ambassadors, setAmbassadors] = useState<any[]>([]);

  const fetchAmbassadors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ambassadors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Fetch recommender names separately
      const ambassadorsWithRecommenders = await Promise.all(
        (data || []).map(async (ambassador) => {
          if (ambassador.onboarded_by_code) {
            const { data: tutor } = await supabase
              .from('tutors')
              .select('full_name')
              .eq('recommendation_code', ambassador.onboarded_by_code)
              .single();
            return { ...ambassador, recommender_name: tutor?.full_name };
          }
          return { ...ambassador, recommender_name: null };
        })
      );
      setAmbassadors(ambassadorsWithRecommenders);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAmbassadors(); }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      // Generate a simple recommendation code: FIRSTNAME + random 3 digits
      const firstName = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
      const code = `${firstName}${Math.floor(5000 + Math.random() * 899)}`;

      console.log(`Approving ambassador ${id} with code ${code}`);

      const { data, error, status } = await supabase
        .from('ambassadors')
        .update({ 
          status: 'approved',
          recommendation_code: code 
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Approval Error:', error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No rows updated. Status:', status);
        toast({ 
          title: "Update Failed", 
          description: "Could not update status. Please check if RLS policies are applied.", 
          variant: "destructive" 
        });
        return;
      }

      console.log('Update Success:', data);
      toast({ title: "Approved!", description: `Ambassador code is ${code}` });
      
      // Update local state immediately for better UX
      setAmbassadors(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', recommendation_code: code } : a));
      
      // Optional: re-fetch to ensure sync with server
      // await fetchAmbassadors();
    } catch (err: any) {
      console.error('Handle Approve Exception:', err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>School & Dept</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Recommender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rec. Code</TableHead>
            {isSuperAdmin && <TableHead>Balance</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ambassadors.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.full_name}</TableCell>
              <TableCell>
                <div className="text-xs">{a.school_faculty}</div>
                <div className="text-[10px] text-muted-foreground">{a.department} - L{a.level}</div>
              </TableCell>
              <TableCell>
                <div className="text-xs">{a.email}</div>
                <div className="text-xs">{a.phone}</div>
              </TableCell>
              <TableCell className="text-xs">
                {a.recommender_name || a.onboarded_by_code || '-'}
              </TableCell>
              <TableCell>
                <Badge variant={a.status === 'approved' ? 'default' : 'secondary'}>
                  {a.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{a.recommendation_code || '-'}</TableCell>
              {isSuperAdmin && <TableCell>{a.balance_cents} XAF</TableCell>}
              <TableCell className="text-right">
                {a.status === 'pending' ? (
                  isSuperAdmin ? (
                    <Button size="sm" onClick={() => handleApprove(a.id, a.full_name)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                      <AlertCircle className="w-3 h-3" /> Super Admin only
                    </Badge>
                  )
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">Processed</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AmbassadorsTable;
