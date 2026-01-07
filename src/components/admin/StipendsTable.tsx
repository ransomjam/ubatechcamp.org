
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Stipend {
  id: string;
  tutor_id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  tutor: {
    full_name: string;
    email: string;
  } | null;
}

interface StipendsTableProps {
  isSuperAdmin?: boolean;
}

const StipendsTable = ({ isSuperAdmin }: StipendsTableProps) => {
  const [stipends, setStipends] = useState<Stipend[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStipends();
  }, []);

  const fetchStipends = async () => {
    try {
      setLoading(true);
      // We join with the tutors table to get the volunteer name
      const { data, error } = await supabase
        .from("tutor_stipends")
        .select(`
          *,
          tutor:tutors(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStipends(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch stipends: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayout = async (id: string, volunteerId: string, amountCents: number) => {
    try {
      setActionLoading(id);

      // Start a "transaction" via client-side (not atomic, but sufficient for this context)
      // 1. Update stipend status
      const { error: updateError } = await supabase
        .from("tutor_stipends")
        .update({ status: 'completed' })
        .eq("id", id);

      if (updateError) throw updateError;

      // 2. Deduct from volunteer balance
      // We fetch current balance first
      const { data: volunteer, error: fetchError } = await supabase
        .from("tutors")
        .select("balance_cents")
        .eq("id", volunteerId)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = (volunteer.balance_cents || 0) - amountCents;

      const { error: balanceError } = await supabase
        .from("tutors")
        .update({ balance_cents: newBalance })
        .eq("id", volunteerId);

      if (balanceError) throw balanceError;

      setStipends(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
      toast.success("Stipend marked as paid and balance deducted.");
    } catch (error: any) {
      toast.error("Process failed: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Volunteer Instructor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stipends.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No stipend requests found.
              </TableCell>
            </TableRow>
          ) : (
            stipends.map((stipend) => (
              <TableRow key={stipend.id}>
                <TableCell>
                  <div className="font-medium">{stipend.tutor?.full_name || 'Unknown'}</div>
                  <div className="text-xs text-muted-foreground">{stipend.tutor?.email}</div>
                </TableCell>
                <TableCell className="font-bold">
                  {(stipend.amount_cents / 5000).toLocaleString()} XAF
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {stipend.status === 'pending' ? (
                      <Badge variant="secondary" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Paid
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(stipend.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {stipend.status === 'pending' && (
                    isSuperAdmin ? (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary-hover h-8"
                        onClick={() => handleCompletePayout(stipend.id, stipend.tutor_id, stipend.amount_cents)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === stipend.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as Paid"}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                        <AlertCircle className="w-3 h-3" /> Super Admin Only
                      </Badge>
                    )
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StipendsTable;
