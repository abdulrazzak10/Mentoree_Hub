import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MessageSquare, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Request {
  id: string;
  studentName: string;
  date: string;
  time: string;
  topic: string;
}

export default function MentorDashboard() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      studentName: "John Davis",
      date: "2025-11-10",
      time: "14:00",
      topic: "Career guidance in web development",
    },
    {
      id: "2",
      studentName: "Emma Wilson",
      date: "2025-11-12",
      time: "16:00",
      topic: "Portfolio review",
    },
  ]);

  const stats = [
    {
      title: "Total Students",
      value: "24",
      icon: <Users className="h-5 w-5 text-primary" />,
      change: "+4 this month",
    },
    {
      title: "Sessions Completed",
      value: "156",
      icon: <Calendar className="h-5 w-5 text-primary" />,
      change: "+12 this month",
    },
    {
      title: "Active Chats",
      value: "8",
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      change: "3 unread",
    },
    {
      title: "Earnings",
      value: "$2,340",
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      change: "+$480 this month",
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

            {/* Pending Requests */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Session Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <h3 className="font-semibold">{request.studentName}</h3>
                              <p className="text-sm text-muted-foreground">{request.topic}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(request.date).toLocaleDateString()} at {request.time}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(request.id)}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecline(request.id)}
                                className="gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No pending requests at the moment
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
