import { useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export default function MentorRequests() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ["session_requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_requests")
        .select("id, student_id, mentor_id, date, time, topic, status, created_at, profiles!session_requests_student_id_fkey(name)")
        .eq("mentor_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (request: any) => {
      const { error: statusError } = await supabase
        .from("session_requests")
        .update({ status: "accepted" })
        .eq("id", request.id);
      if (statusError) throw statusError;

      const { error: sessionError } = await supabase.from("sessions").insert({
        student_id: request.student_id,
        mentor_id: request.mentor_id,
        date: request.date,
        time: request.time,
        status: "upcoming",
        notes: request.topic || null,
      });
      if (sessionError) throw sessionError;
    },
    onSuccess: async () => {
      toast.success("Session request accepted!");
      await queryClient.invalidateQueries({ queryKey: ["session_requests"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("session_requests")
        .update({ status: "declined" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.info("Session request declined");
      await queryClient.invalidateQueries({ queryKey: ["session_requests"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar role="mentor" />

        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Requests</h1>
              <p className="text-muted-foreground">Review and manage incoming session requests</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Session Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requestsQuery.data && requestsQuery.data.length > 0 ? (
                  requestsQuery.data.map((request: any) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{request.profiles?.name || "Student"}</h3>
                            <p className="text-sm text-muted-foreground">{request.topic || "Session request"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(request.date).toLocaleDateString()} at {request.time}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" onClick={() => acceptMutation.mutate(request)} className="gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => declineMutation.mutate(request.id)} className="gap-2">
                              <XCircle className="h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No pending requests at the moment</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}


