import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StudentSessions from "./pages/StudentSessions";
import MentorDashboard from "./pages/MentorDashboard";
import MentorRequests from "./pages/MentorRequests";
import MentorSessions from "./pages/MentorSessions";
import MentorList from "./pages/MentorList";
import MentorProfile from "./pages/MentorProfile";
import BookSession from "./pages/BookSession";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/sessions" element={<ProtectedRoute role="student"><StudentSessions /></ProtectedRoute>} />
          <Route path="/mentor/dashboard" element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/requests" element={<ProtectedRoute role="mentor"><MentorRequests /></ProtectedRoute>} />
          <Route path="/mentor/sessions" element={<ProtectedRoute role="mentor"><MentorSessions /></ProtectedRoute>} />
          <Route path="/mentors" element={<MentorList />} />
          <Route path="/mentor/:mentorId" element={<MentorProfile />} />
          <Route path="/book-session/:mentorId" element={<ProtectedRoute><BookSession /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
