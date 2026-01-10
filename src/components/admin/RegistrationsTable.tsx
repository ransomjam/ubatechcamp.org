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
import { BadgeCheck, Loader2, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const RegistrationsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch recommender names separately (only tutors/executives)
      const registrationsWithRecommenders = await Promise.all(
        (data || []).map(async (registration) => {
          if (registration.recommendation_code) {
            const { data: tutor } = await supabase
              .from('tutors')
              .select('full_name')
              .eq('recommendation_code', registration.recommendation_code)
              .single();
            
            return { 
              ...registration, 
              recommender_name: tutor?.full_name 
            };
          }
          return { ...registration, recommender_name: null };
        })
      );
      
      setRegistrations(registrationsWithRecommenders);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(
    (reg) =>
      (reg.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.phone || "").includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "pending":
      case "pending_payment":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading registrations...</p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Rec. Code</TableHead>
              <TableHead>Institution/Dept</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recommender</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">{registration.full_name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{registration.email}</div>
                      <div className="text-xs text-muted-foreground">{registration.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{registration.program}</TableCell>
                  <TableCell className="font-mono text-xs">{registration.recommendation_code || "-"}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{registration.institution || "-"}</div>
                      <div className="text-xs text-muted-foreground text-wrap max-w-[150px]">
                        {registration.field_of_study || registration.department || "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(registration.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(registration.status)}>
                      {registration.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {registration.recommender_name || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredRegistrations.length} of {registrations.length} registrations
      </div>
    </Card>
  );
};

export default RegistrationsTable;
