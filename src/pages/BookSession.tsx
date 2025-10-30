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
import { dummyMentors } from "@/utils/dummyData";
import { toast } from "sonner";
import { ArrowLeft, Star, MapPin } from "lucide-react";

export default function BookSession() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const mentor = dummyMentors.find((m) => m.id === mentorId);

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!mentor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Mentor not found</p>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    toast.success("Session booked successfully!");
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
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-32 h-32 rounded-full mx-auto bg-muted"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{mentor.name}</h2>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{mentor.rating}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{mentor.country}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {mentor.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground">{mentor.bio}</p>
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
                      <li>• Language: {mentor.language.join(", ")}</li>
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
