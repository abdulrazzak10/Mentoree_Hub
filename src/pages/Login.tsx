import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { profile } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      return;
    }
    // Fetch the fresh profile to check deactivation
    const { data: session } = await supabase.auth.getUser();
    const uid = session.user?.id;
    let userProfile = profile;
    if (uid) {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, role, is_admin, is_active, deactivated_reason")
        .eq("id", uid)
        .maybeSingle();
      if (p) userProfile = p as any;
    }

    if (userProfile && userProfile.is_active === false) {
      toast.error(`You have been deactivated for this reason: ${userProfile.deactivated_reason || "No reason provided"}`);
      await supabase.auth.signOut();
      return;
    }

    toast.success("Logged in successfully!");
    if (userProfile?.is_admin) {
      navigate("/admin");
    } else {
      navigate(userProfile?.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Welcome Back</CardTitle>
              <CardDescription>Login to your GetMentor account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>

                <Button className="w-full" size="lg" onClick={handleLogin}>
                  Login
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline font-medium"
                >
                  Create Account
                </button>
              </p>

              <div className="pt-4 border-t text-center text-xs text-muted-foreground"></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
