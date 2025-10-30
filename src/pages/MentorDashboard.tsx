import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface Request {
  id: string;
  studentName: string;
  date: string;
  time: string;
  topic: string;
}

export default function MentorDashboard() {
  const { userId } = useAuth();
  const sessionsQuery = useQuery({
    queryKey: ["sessions", "mentor", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, student_id, date, time, status")
        .eq("mentor_id", userId);
      if (error) throw error;
      return data || [];
    },
  });
  const chatsQuery = useQuery({
    queryKey: ["chats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id, student_id")
        .eq("mentor_id", userId);
      if (error) throw error;
      return data || [];
    },
  });

  const sessions = sessionsQuery.data || [];
  const totalStudents = new Set(sessions.map((s: any) => s.student_id)).size;
  const sessionsCompleted = sessions.filter((s: any) => s.status === "completed").length;
  const activeChats = (chatsQuery.data || []).length;

  const stats = [
    {
      title: "Total Students",
      value: String(totalStudents),
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "",
    },
    {
      title: "Sessions Completed",
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

  const handleAccept = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast.success("Session request accepted!");
  };

  const handleDecline = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast.info("Session request declined");
  };

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
              <h1 className="text-3xl font-bold mb-2">Mentor Dashboard</h1>
              <p className="text-muted-foreground">Manage your sessions and help students grow</p>
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

          </motion.div>
        </main>
      </div>
    </div>
  );
}
