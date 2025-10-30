import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionCard } from "@/components/SessionCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export default function StudentSessions() {
  const { userId } = useAuth();
  const sessionsQuery = useQuery({
    queryKey: ["sessions", "student", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, student_id, mentor_id, date, time, status, notes, profiles!sessions_mentor_id_fkey(name)")
        .eq("student_id", userId)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const sessions = sessionsQuery.data || [];
  const upcoming = sessions.filter((s) => s.status === "upcoming").map((s) => ({
    id: s.id,
    mentorId: s.mentor_id,
    mentorName: s.profiles?.name || "Mentor",
    date: s.date,
    time: s.time,
    status: s.status,
    notes: s.notes || undefined,
  }));
  const pending = sessions.filter((s) => s.status === "pending").map((s) => ({
    id: s.id,
    mentorId: s.mentor_id,
    mentorName: s.profiles?.name || "Mentor",
    date: s.date,
    time: s.time,
    status: s.status,
    notes: s.notes || undefined,
  }));
  const completed = sessions.filter((s) => s.status === "completed").map((s) => ({
    id: s.id,
    mentorId: s.mentor_id,
    mentorName: s.profiles?.name || "Mentor",
    date: s.date,
    time: s.time,
    status: s.status,
    notes: s.notes || undefined,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <DashboardSidebar role="student" />

        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
              <p className="text-muted-foreground">Track your booked, pending, and past sessions</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcoming.length > 0 ? (
                  upcoming.map((session) => <SessionCard key={session.id} session={session} />)
                ) : (
                  <p className="text-center text-muted-foreground py-8">No upcoming sessions</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pending.length > 0 ? (
                  pending.map((session) => <SessionCard key={session.id} session={session} />)
                ) : (
                  <p className="text-center text-muted-foreground py-8">No pending sessions</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {completed.length > 0 ? (
                  completed.map((session) => <SessionCard key={session.id} session={session} />)
                ) : (
                  <p className="text-center text-muted-foreground py-8">No completed sessions yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}


