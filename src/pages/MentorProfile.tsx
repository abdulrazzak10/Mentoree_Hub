import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Languages, MessageSquare, Calendar as CalIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export default function MentorProfile() {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  const mentorQuery = useQuery({
    queryKey: ["view_mentors", mentorId],
    enabled: !!mentorId,
    queryFn: async () => {
      const { data, error } = await supabase.from("view_mentors").select("*").eq("id", mentorId).maybeSingle();
      if (error) throw error;
      return data as any | null;
    },
  });

  const mentor = mentorQuery.data;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {mentor ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <img
                    src={mentor.profile_image_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                    alt={mentor.name || "Mentor"}
                    className="w-28 h-28 rounded-full bg-muted"
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{mentor.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {mentor.country || ""}</span>
                      <span className="inline-flex items-center gap-1"><Languages className="h-4 w-4" /> {(mentor.languages || []).join(", ")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{mentor.bio}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {(mentor.skills || []).map((s: string) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button onClick={() => navigate(`/book-session/${mentor.id}`)} className="gap-2">
                        <CalIcon className="h-4 w-4" /> Book Session
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/chat`)} className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground">Loading mentor...</p>
          )}
        </div>
      </main>
    </div>
  );
}


