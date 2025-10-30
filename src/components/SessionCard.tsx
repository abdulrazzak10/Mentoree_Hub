import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Session } from "@/utils/dummyData";

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{session.mentorName}</h3>
              <Badge className={getStatusColor(session.status)} variant="secondary">
                {session.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(session.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{session.time}</span>
              </div>
            </div>

            {session.notes && (
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
