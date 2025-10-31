import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 cursor-default select-none">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">GetMentor</span>
            </div>
          ) : (
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">GetMentor</span>
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                {profile?.is_admin ? (
                  <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                    Admin
                  </Link>
                ) : (
                  <Link
                    to={profile?.role === "student" ? "/student/dashboard" : "/mentor/dashboard"}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : profile?.is_admin ? (
              <>
                <Link to="/admin" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/admin" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                <button
                  onClick={async () => {
                    await handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : profile?.role === "student" ? (
              <>
                <Link to="/student/dashboard" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/mentors" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Find Mentors</Link>
                <Link to="/student/sessions" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>My Sessions</Link>
                <Link to="/chat" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                <Link to="/profile" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button
                  onClick={async () => {
                    await handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/mentor/dashboard" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/mentor/requests" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Requests</Link>
                <Link to="/mentor/sessions" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>My Sessions</Link>
                <Link to="/chat" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                <Link to="/profile" className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button
                  onClick={async () => {
                    await handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
