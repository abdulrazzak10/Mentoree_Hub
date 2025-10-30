import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Calendar,
  MessageSquare,
  User,
  ClipboardList,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  role: "student" | "mentor";
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const location = useLocation();

  const studentItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: `/student/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Find Mentors",
      href: `/mentors`,
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "My Sessions",
      href: `/student/sessions`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: `/chat`,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: `/profile`,
      icon: <User className="h-5 w-5" />,
    },
  ];

  const mentorItems: SidebarItem[] = [
    {
      title: "Dashboard",
      href: `/mentor/dashboard`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Requests",
      href: `/mentor/requests`,
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "My Sessions",
      href: `/mentor/sessions`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: `/chat`,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: `/profile`,
      icon: <User className="h-5 w-5" />,
    },
  ];

  const items = role === "student" ? studentItems : mentorItems;

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
