import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MentorCard } from "@/components/MentorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ViewMentor = {
  id: string;
  name: string | null;
  country: string | null;
  bio: string | null;
  profile_image_url: string | null;
  skills: string[] | null;
  languages: string[] | null;
};

export default function MentorList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  const mentorsQuery = useQuery({
    queryKey: ["view_mentors", countryFilter, searchTerm],
    queryFn: async () => {
      let q = supabase.from("view_mentors").select("*");
      if (countryFilter !== "all") q = q.eq("country", countryFilter);
      if (searchTerm.trim()) q = q.ilike("name", `%${searchTerm.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ViewMentor[];
    },
  });

  const mentors = mentorsQuery.data || [];
  const filteredMentors = mentors.filter((mentor) => {
    const skills = mentor.skills || [];
    const nameMatches = (mentor.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatches = skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSearch = !searchTerm || nameMatches || skillMatches;
    const matchesCountry = countryFilter === "all" || mentor.country === countryFilter;
    const matchesSkill = skillFilter === "all" || skills.includes(skillFilter);
    return matchesSearch && matchesCountry && matchesSkill;
  });

  const allCountries = Array.from(new Set(mentors.map((m) => m.country).filter(Boolean))) as string[];
  const allSkills = Array.from(new Set(mentors.flatMap((m) => m.skills || [])));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Find Your Perfect Mentor</h1>
            <p className="text-xl text-muted-foreground">
              Browse our community of expert mentors from around the world
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {allCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="pt-4">
            {mentorsQuery.isLoading && (
              <p className="text-sm text-muted-foreground mb-6">Loading mentors...</p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor, index) => (
                <MentorCard
                  key={mentor.id}
                  mentor={{
                    id: mentor.id,
                    name: mentor.name || "Unknown",
                    image: mentor.profile_image_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
                    skills: mentor.skills || [],
                    country: mentor.country || "",
                    language: mentor.languages || [],
                    rating: 0,
                    bio: mentor.bio || "",
                    availability: [],
                  }}
                  index={index}
                />
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  No mentors found matching your criteria
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
