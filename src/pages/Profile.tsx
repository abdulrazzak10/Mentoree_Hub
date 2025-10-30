import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userRole = profile?.role || "student";
  const [profileImage, setProfileImage] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=User");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setCountry(profile.country || "");
    setBio(profile.bio || "");
    setProfileImage(profile.profile_image_url || profileImage);
  }, [profile]);

  useEffect(() => {
    const loadMentorData = async () => {
      if (userRole !== "mentor" || !profile?.id) return;
      const [{ data: skillsData }, { data: availData }] = await Promise.all([
        supabase.from("mentor_skills").select("skill").eq("mentor_id", profile.id),
        supabase.from("mentor_availability").select("day_of_week").eq("mentor_id", profile.id),
      ]);
      if (skillsData) setSkills(skillsData.map((s: any) => s.skill));
      if (availData) setAvailability(
        availData
          .map((a: any) => days[(a.day_of_week as number) % 7])
          .filter((d: string | undefined): d is string => Boolean(d))
      );
    };
    loadMentorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, profile?.id]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAvailabilityChange = (day: string) => {
    if (availability.includes(day)) {
      setAvailability(availability.filter((d) => d !== day));
    } else {
      setAvailability([...availability, day]);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ name, country, bio, profile_image_url: profileImage })
      .eq("id", profile?.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (userRole === "mentor" && profile?.id) {
      // Replace mentor_skills with current list
      const skillRows = skills
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => ({ mentor_id: profile.id, skill: s }));
      const { error: delSkillsErr } = await supabase.from("mentor_skills").delete().eq("mentor_id", profile.id);
      if (delSkillsErr) {
        toast.error(delSkillsErr.message);
        return;
      }
      if (skillRows.length > 0) {
        const { error: insSkillsErr } = await supabase.from("mentor_skills").insert(skillRows);
        if (insSkillsErr) {
          toast.error(insSkillsErr.message);
          return;
        }
      }

      // Replace mentor_availability from selected days
      const dayToIndex = (d: string) => days.indexOf(d);
      const availRows = availability
        .map((d) => dayToIndex(d))
        .filter((n) => n >= 0)
        .map((n) => ({ mentor_id: profile.id, day_of_week: n, start_time: "09:00", end_time: "17:00" }));
      const { error: delAvailErr } = await supabase.from("mentor_availability").delete().eq("mentor_id", profile.id);
      if (delAvailErr) {
        toast.error(delAvailErr.message);
        return;
      }
      if (availRows.length > 0) {
        const { error: insAvailErr } = await supabase.from("mentor_availability").insert(availRows);
        if (insAvailErr) {
          toast.error(insAvailErr.message);
          return;
        }
      }
    }
    toast.success("Profile updated successfully!");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(userRole === "mentor" ? "/mentor/dashboard" : "/student/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full bg-muted"
                  />
                  <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !profile?.id) return;
                        const ext = file.name.split(".").pop();
                        const path = `${profile.id}/avatar.${ext}`;
                        const { error: upErr } = await supabase.storage.from("profiles").upload(path, file, {
                          upsert: true,
                        });
                        if (upErr) {
                          toast.error(upErr.message);
                          return;
                        }
                        const { data: pub } = supabase.storage.from("profiles").getPublicUrl(path);
                        if (pub?.publicUrl) {
                          setProfileImage(pub.publicUrl);
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a professional photo
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability (Mentors Only) */}
              {userRole === "mentor" && (
                <div className="space-y-3">
                  <Label>Availability</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {days.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={availability.includes(day)}
                          onCheckedChange={() => handleAvailabilityChange(day)}
                        />
                        <label
                          htmlFor={day}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg" onClick={handleSave}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
