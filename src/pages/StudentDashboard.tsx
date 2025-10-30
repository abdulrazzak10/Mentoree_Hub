import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { SessionCard } from "@/components/SessionCard";

export default function StudentDashboard() {
  const { userId } = useAuth();
  const sessionsQuery = useQuery({
    queryKey: ["sessions", "student", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, mentor_id, date, time, status, notes, profiles!sessions_mentor_id_fkey(name)")
        .eq("student_id", userId)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });
  const chatsQuery = useQuery({
    queryKey: ["chats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("student_id", userId);
      if (error) throw error;
      return data || [];
    },
  });

  const sessions = sessionsQuery.data || [];
  const upcomingSessions = sessions
    .filter((s) => s.status === "upcoming")
    .map((s) => ({ id: s.id, mentorId: s.mentor_id, mentorName: s.profiles?.name || "Mentor", date: s.date, time: s.time, status: s.status, notes: s.notes || undefined }));
  const mentorsBooked = new Set(sessions.map((s: any) => s.mentor_id)).size;
  const sessionsCompleted = sessions.filter((s: any) => s.status === "completed").length;
  const activeChats = (chatsQuery.data || []).length;

  const stats = [
    {
      title: "Mentors Booked",
      value: String(mentorsBooked),
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "",
    },
    {
      title: "Sessions Done",
      value: String(sessionsCompleted),
      icon: <Calendar className="h-5 w-5 text-primary" />,
      change: "",
    },
    {
      title: "Active Chats",
      value: String(activeChats),
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      change: "",
    },
  ];

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
              <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-muted-foreground">Here's what's happening with your learning journey</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {stat.icon}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No upcoming sessions. Book a session with a mentor to get started!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
