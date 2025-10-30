import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Languages } from "lucide-react";
import { Mentor } from "@/utils/dummyData";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface MentorCardProps {
  mentor: Mentor;
  index?: number;
}

export function MentorCard({ mentor, index = 0 }: MentorCardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, userId, profile } = useAuth();

  const handleMessage = async () => {
    if (!isAuthenticated || !userId) {
      toast.error("Please login to start a chat");
      navigate("/login");
      return;
    }
    // Only students can start chat from mentor card
    if (profile?.role !== "student") {
      toast.info("Switch to a student account to message mentors");
      return;
    }
    // Find or create chat between current student and this mentor
    const { data: existing, error: findErr } = await supabase
      .from("chats")
      .select("id")
      .eq("mentor_id", mentor.id)
      .eq("student_id", userId)
      .maybeSingle();
    if (findErr) {
      toast.error(findErr.message);
      return;
    }
    let chatId = existing?.id;
    if (!chatId) {
      const { data: created, error: createErr } = await supabase
        .from("chats")
        .insert({ mentor_id: mentor.id, student_id: userId })
        .select("id")
        .single();
      if (createErr) {
        toast.error(createErr.message);
        return;
      }
      chatId = created.id;
    }
    navigate(`/chat?chatId=${chatId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <img
              src={mentor.image}
              alt={mentor.name}
              className="w-20 h-20 rounded-full bg-muted"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{mentor.name}</h3>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{mentor.rating}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{mentor.country}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                <Languages className="h-3.5 w-3.5" />
                <span>{mentor.language.join(", ")}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{mentor.bio}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {mentor.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {mentor.skills.length > 3 && (
              <Badge variant="outline">+{mentor.skills.length - 3}</Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(`/mentor/${mentor.id}`)}>
            View Profile
          </Button>
          <Button className="flex-1" onClick={() => navigate(`/book-session/${mentor.id}`)}>
            Book Session
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleMessage}>
            Message
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
