import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">GetMentor</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting students with expert mentors worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Students</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/mentors" className="hover:text-primary transition-colors">
                  Find Mentors
                </Link>
              </li>
              <li>
                <Link to="/register?role=student" className="hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Mentors</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/register?role=mentor" className="hover:text-primary transition-colors">
                  Become a Mentor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GetMentor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
