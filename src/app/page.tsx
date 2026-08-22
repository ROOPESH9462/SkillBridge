import React from "react";
import { db } from "@/lib/db";
import { MentorCard } from "@/components/MentorCard";
import { Sparkles, CheckCircle, Search, ShieldCheck, Target, ArrowUpRight, Award, Zap } from "lucide-react";

async function getFeaturedMentors() {
  try {
    const mentors = await db.user.findMany({
      where: {
        role: "MENTOR",
        accountStatus: "ACTIVE",
      },
      include: {
        mentorProfile: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
      },
      take: 6,
    });

    return mentors.map((m) => {
      const profile = m.mentorProfile;
      return {
        id: m.id,
        name: m.name,
        avatar: m.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor",
        title: profile?.professionalTitle || "Senior Tech Specialist",
        yearsExp: profile?.yearsExperience || 5,
        bio: profile?.bio || "Experienced mentor helping developers master modern technology stacks.",
        rating: profile?.overallRating || 4.9,
        reviewCount: profile?.reviewCount || 12,
        isVerified: profile?.verificationStatus === "VERIFIED",
        skills: m.userSkills.map((us) => ({
          name: us.skill.name,
          proficiency: us.proficiency,
          yearsExp: us.yearsExperience,
        })),
        matchScore: 94,
        matchReasons: [
          `Teaches ${m.userSkills[0]?.skill.name || "Next.js"} & System Architecture`,
          `Verified ${profile?.yearsExperience || 5}+ yrs experience`,
          `4.9+ Star Rating`,
        ],
      };
    });
  } catch (error) {
    console.error("Error fetching mentors from db:", error);
    return [];
  }
}

async function getSkillCategories() {
  try {
    const skills = await db.skill.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return skills.map((s) => s.category);
  } catch (e) {
    return ["Software Engineering", "AI & Data", "Cloud & DevOps", "Product & Design"];
  }
}

export default async function HomePage() {
  const mentors = await getFeaturedMentors();
  const categories = await getSkillCategories();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-emerald-500/10 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 glow-green-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Intelligent Mentorship & Milestone Progress</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Learn from verified engineers who have{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              built at scale.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Match with verified technical mentors based on your exact skill gaps, track milestone progress, and book 1-on-1 sessions without double bookings.
          </p>

          {/* Hero CTA Search Bar */}
          <div className="max-w-xl mx-auto flex items-center gap-2 p-2 rounded-2xl glass-card glow-green">
            <div className="flex-1 flex items-center gap-2 pl-3">
              <Search className="w-5 h-5 text-emerald-500" />
              <input
                type="text"
                placeholder="Search skills (e.g. Next.js, FastAPI, Kubernetes)..."
                className="w-full bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20">
              Find Mentors
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Mentor Badges</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Explainable Match Scoring</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Zero Double Bookings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills Taxonomy Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Explore Skill Domains
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a domain to filter verified mentors and milestone roadmaps
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20">
            All Domains
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className="px-4 py-2 rounded-xl glass-card hover:border-emerald-500/40 text-slate-300 font-medium text-xs transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Mentors Section */}
      <section id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Award className="w-4 h-4 text-emerald-400" />
              Verified Industry Experts
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Top-Rated Tech Mentors
            </h2>
          </div>
          <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View All Mentors ({mentors.length})
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {mentors.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-2xl">
            <p className="text-sm text-slate-400">No mentors loaded yet. Please run database seed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </section>

      {/* Milestone Skill Progress Showcase */}
      <section id="skills" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-card p-8 border border-emerald-500/20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-4">
                <Target className="w-4 h-4 text-emerald-400" />
                Milestone-Based Learning
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-100">
                Track exact skill progress through completed milestones
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                SkillBridge doesn't use static self-reported percentages. Your progress updates dynamically as you complete structured skill milestones with verified mentors.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-200">Next.js App Router Mastery</span>
                    <span className="text-emerald-400">3 / 5 Milestones (60%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-950/50 overflow-hidden border border-emerald-500/20">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 w-[60%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-200">Distributed System Design</span>
                    <span className="text-emerald-400">1 / 3 Milestones (33%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-950/50 overflow-hidden border border-emerald-500/20">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 w-[33%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-bg/60 border border-emerald-500/20 space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Active Skill Goal Milestones
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-200">
                  <span>1. App Router & Dynamic Routing</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">COMPLETED</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-200">
                  <span>2. React Server Components & Streaming</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">COMPLETED</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-200">
                  <span>3. Server Actions & Form Validation</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">COMPLETED</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/10 flex items-center justify-between text-slate-400">
                  <span>4. Caching & Revalidation Strategies</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">IN PROGRESS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
