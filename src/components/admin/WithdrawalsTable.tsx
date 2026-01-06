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
import { CheckCircle, Loader2, Wallet, AlertCircle } from 'lucide-react';

interface WithdrawalsTableProps {
  isSuperAdmin?: boolean;
}

export const WithdrawalsTable = ({ isSuperAdmin }: WithdrawalsTableProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*, ambassadors(full_name, phone)')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleComplete = async (id: string, ambassadorId: string, amount: number) => {
    try {
      // 1. Mark withdrawal as completed
      const { data: wData, error: wError } = await supabase
        .from('withdrawals')
        .update({ status: 'completed' })
        .eq('id', id)
        .select();

      if (wError) {
        toast({ title: "Error", description: wError.message, variant: "destructive" });
        return;
      }

      if (!wData || wData.length === 0) {
        toast({ title: "Update Failed", description: "Withdrawal status not updated. Check RLS policies.", variant: "destructive" });
        return;
      }

      // 2. Actually deduct from ambassador balance (Important!)
      const { data: amb, error: ambFetchError } = await supabase
        .from('ambassadors')
        .select('balance_cents')
        .eq('id', ambassadorId)
        .single();
      
      if (ambFetchError) {
        console.error('Error fetching ambassador for balance deduction:', ambFetchError);
      } else if (amb) {
        await supabase.from('ambassadors')
          .update({ balance_cents: Math.max(0, amb.balance_cents - amount) })
          .eq('id', ambassadorId);
      }

      toast({ title: "Payout Confirmed", description: "Withdrawal marked as completed." });
      
      // Update local state
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
    } catch (err: any) {
      console.error('Handle Complete Exception:', err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ambassador</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <div>{r.ambassadors?.full_name}</div>
                <div className="text-[10px] text-muted-foreground">{r.ambassadors?.phone}</div>
              </TableCell>
              <TableCell className="font-bold">{r.amount_cents} XAF</TableCell>
              <TableCell className="text-xs max-w-[150px] truncate">{r.payment_method}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'completed' ? 'default' : 'secondary'}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {r.status === 'pending' && (
                  isSuperAdmin ? (
                    <Button size="sm" variant="outline" onClick={() => handleComplete(r.id, r.ambassador_id, r.amount_cents)}>
                      <CheckCircle className="w-4 h-4 mr-1 text-green-600" /> Confirm Payout
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                      <AlertCircle className="w-3 h-3" /> Super Admin Only
                    </Badge>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No withdrawal requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WithdrawalsTable;
