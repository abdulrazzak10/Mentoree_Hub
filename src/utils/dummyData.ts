export interface Mentor {
  id: string;
  name: string;
  image: string;
  skills: string[];
  country: string;
  language: string[];
  rating: number;
  bio: string;
  availability: string[];
}

export interface Session {
  id: string;
  mentorId: string;
  mentorName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "pending";
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export const dummyMentors: Mentor[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    skills: ["Web Development", "React", "TypeScript"],
    country: "United States",
    language: ["English"],
    rating: 4.9,
    bio: "Senior Software Engineer with 10+ years of experience in web development. Passionate about teaching and helping others grow.",
    availability: ["Monday", "Wednesday", "Friday"],
  },
  {
    id: "2",
    name: "Michael Chen",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    skills: ["Data Science", "Python", "Machine Learning"],
    country: "Canada",
    language: ["English", "Mandarin"],
    rating: 4.8,
    bio: "Data Scientist specializing in ML and AI. Love sharing knowledge and helping students break into tech.",
    availability: ["Tuesday", "Thursday", "Saturday"],
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    skills: ["UI/UX Design", "Figma", "Product Design"],
    country: "Spain",
    language: ["English", "Spanish"],
    rating: 5.0,
    bio: "Product Designer with expertise in creating user-centered experiences. Mentor for aspiring designers.",
    availability: ["Monday", "Tuesday", "Thursday"],
  },
  {
    id: "4",
    name: "David Kumar",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    skills: ["Backend Development", "Node.js", "PostgreSQL"],
    country: "India",
    language: ["English", "Hindi"],
    rating: 4.7,
    bio: "Full-stack developer with focus on scalable backend systems. Helping developers level up their skills.",
    availability: ["Wednesday", "Friday", "Sunday"],
  },
  {
    id: "5",
    name: "Lisa Anderson",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    skills: ["Digital Marketing", "SEO", "Content Strategy"],
    country: "United Kingdom",
    language: ["English"],
    rating: 4.9,
    bio: "Marketing strategist with 8 years of experience. Passionate about helping businesses grow online.",
    availability: ["Monday", "Wednesday", "Saturday"],
  },
  {
    id: "6",
    name: "James Wilson",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    skills: ["Mobile Development", "React Native", "iOS"],
    country: "Australia",
    language: ["English"],
    rating: 4.8,
    bio: "Mobile app developer creating cross-platform solutions. Love teaching mobile development best practices.",
    availability: ["Tuesday", "Thursday", "Friday"],
  },
];

export const dummySessions: Session[] = [
  {
    id: "1",
    mentorId: "1",
    mentorName: "Sarah Johnson",
    date: "2025-11-05",
    time: "14:00",
    status: "upcoming",
    notes: "Discuss React best practices",
  },
  {
    id: "2",
    mentorId: "2",
    mentorName: "Michael Chen",
    date: "2025-10-28",
    time: "16:00",
    status: "completed",
    notes: "Introduction to Machine Learning",
  },
  {
    id: "3",
    mentorId: "3",
    mentorName: "Emily Rodriguez",
    date: "2025-11-08",
    time: "10:00",
    status: "pending",
    notes: "Portfolio review",
  },
];

export const dummyChats: Chat[] = [
  {
    id: "1",
    userId: "1",
    userName: "Sarah Johnson",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Looking forward to our session!",
    timestamp: new Date(Date.now() - 3600000),
    unread: 2,
  },
  {
    id: "2",
    userId: "2",
    userName: "Michael Chen",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    lastMessage: "Thanks for the session today!",
    timestamp: new Date(Date.now() - 86400000),
    unread: 0,
  },
  {
    id: "3",
    userId: "3",
    userName: "Emily Rodriguez",
    userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    lastMessage: "Can we reschedule?",
    timestamp: new Date(Date.now() - 172800000),
    unread: 1,
  },
];
