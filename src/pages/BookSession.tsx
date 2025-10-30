import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Star, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export default function BookSession() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const mentorQuery = useQuery({
    queryKey: ["view_mentors", mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase.from("view_mentors").select("*").eq("id", mentorId).maybeSingle();
      if (error) throw error;
      return data as any | null;
    },
  });

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!mentorQuery.data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Mentor not found</p>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }
    if (!userId) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    // Validate not in the past (date-only check plus time if same day)
    const now = new Date();
    const selected = new Date(date);
    const [hh, mm] = time.split(":");
    selected.setHours(parseInt(hh || "0", 10), parseInt(mm || "0", 10), 0, 0);
    if (selected.getTime() < now.getTime()) {
      toast.error("Selected time is in the past");
      return;
    }

    // Validate against mentor availability (our schema uses 0=Monday..6=Sunday)
    const jsDay = new Date(date).getDay(); // 0=Sun..6=Sat
    const dayIndex = (jsDay + 6) % 7; // map Sun->6, Mon->0, ...
    const { data: availability, error: availError } = await supabase
      .from("mentor_availability")
      .select("start_time,end_time")
      .eq("mentor_id", mentorId)
      .eq("day_of_week", dayIndex);
    if (availError) {
      toast.error(availError.message);
      return;
    }
    const withinWindow = (availability || []).some((a: any) => a.start_time <= time && time < a.end_time);
    if (!withinWindow) {
      toast.error("Selected time is outside mentor availability");
      return;
    }

    // Check for schedule conflict for mentor at same date+time (pending/upcoming)
    const { data: conflicts, error: conflictError } = await supabase
      .from("sessions")
      .select("id")
      .eq("mentor_id", mentorId)
      .eq("date", date.toISOString().slice(0, 10))
      .eq("time", time)
      .in("status", ["pending", "upcoming"]);
    if (conflictError) {
      toast.error(conflictError.message);
      return;
    }
    if ((conflicts || []).length > 0) {
      toast.error("This slot is already booked");
      return;
    }

    const { error } = await supabase.from("session_requests").insert({
      student_id: userId,
      mentor_id: mentorId,
      date: date.toISOString().slice(0, 10),
      time,
      topic: notes || null,
      status: "pending",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["session_requests"] });
    toast.success("Request sent! Mentor will review your request.");
    navigate("/student/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Mentor Info */}
            <Card className="md:col-span-1">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <img
                    src={mentorQuery.data.profile_image_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                    alt={mentorQuery.data.name || "Mentor"}
                    className="w-32 h-32 rounded-full mx-auto bg-muted"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{mentorQuery.data.name}</h2>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{mentorQuery.data.country}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {(mentorQuery.data.skills || []).map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground">{mentorQuery.data.bio}</p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Select Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Session Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="What would you like to discuss?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <h3 className="font-semibold mb-2">Session Details</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Duration: 60 minutes</li>
                      <li>• Format: Video call</li>
                      <li>• Language: {(mentorQuery.data.languages || []).join(", ")}</li>
                    </ul>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleBooking}>
                    Confirm Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
