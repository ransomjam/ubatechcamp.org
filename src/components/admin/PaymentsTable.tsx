import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Download, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PaymentsTableProps {
  isSuperAdmin?: boolean;
}

const PaymentsTable = ({ isSuperAdmin }: PaymentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          registrations (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const studentName = payment.registrations?.full_name || "Unknown";
    const studentEmail = payment.registrations?.email || "Unknown";
    const transId = payment.provider_reference || "";
    
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "pending":
      case "created":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "failed":
      case "expired":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatAmount = (amount_cents: number) => {
    return `${(amount_cents || 0).toLocaleString()} XAF`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotal = () => {
    return filteredPayments
      .filter((p) => p.status === "succeeded" || p.status === "completed")
      .reduce((sum, payment) => sum + (payment.amount_cents || 0), 0);
  };

  const handleApprove = async (paymentId: string) => {
    try {
      setActionLoading(paymentId);
      const { error } = await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentId);

      if (error) throw error;
      
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'completed' } : p));
      toast.success("Payment manually approved");
    } catch (err: any) {
      toast.error("Failed to approve: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by student, email, or transaction reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isSuperAdmin && (
          <Card className="p-4 border-primary/20 bg-primary/5">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">
              {formatAmount(calculateTotal())}
            </p>
          </Card>
        )}
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Successful Payments</p>
          <p className="text-2xl font-bold text-green-500">
            {payments.filter((p) => p.status === "succeeded" || p.status === "completed").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending/Created</p>
          <p className="text-2xl font-bold text-yellow-500">
            {payments.filter((p) => p.status === "pending" || p.status === "created").length}
          </p>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{payment.registrations?.full_name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{payment.registrations?.email || "-"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.provider_reference || "-"}</TableCell>
                  <TableCell className="font-semibold">{formatAmount(payment.amount_cents)}</TableCell>
                  <TableCell className="text-xs">{payment.phone || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      {(payment.status === 'pending' || payment.status === 'created') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-1"
                          disabled={actionLoading === payment.id}
                          onClick={() => handleApprove(payment.id)}
                        >
                          {actionLoading === payment.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          )}
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredPayments.length} of {payments.length} transactions
      </div>
    </Card>
  );
};

export default PaymentsTable;
