import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useAppState } from "@/hooks/use-app-state";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flame, Trophy, Calendar, Sparkles, BookOpen, Target, Star, CheckCircle2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { currentUser, getStudentProfile, sessions, notes } = useAppState();
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!currentUser || currentUser.role !== "student") return null;

  const profile = getStudentProfile(currentUser.id);
  if (!profile) return null;

  const mySessions = sessions.filter(
    (s) => s.studentId === currentUser.id && s.status === "upcoming"
  );
  const myNotes = notes.filter((n) => n.studentId === currentUser.id);
  const keyAdvice = myNotes.find((n) => n.isKeyAdvice);

  const hasSubjectHistory =
    profile.subjects.length > 0 && profile.subjects[0].history.some((h) => h > 0);

  const chartData = Array.from({ length: 8 }).map((_, i) => {
    if (profile.subjects.length === 0) return { week: `W${i + 1}`, score: 0 };
    const sum = profile.subjects.reduce((acc, sub) => acc + (sub.history[i] ?? 0), 0);
    return {
      week: `W${i + 1}`,
      score: Math.round(sum / profile.subjects.length),
    };
  });

  const getGradeColor = (score: number) => {
    if (score >= 80) return "bg-success/10 text-success border-success/30";
    if (score >= 60) return "bg-warning/10 text-warning border-warning/30";
    if (score === 0) return "bg-muted text-muted-foreground border-border";
    return "bg-destructive/10 text-destructive border-destructive/30";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={400} />}
      <TopNav />

      <main className="container mx-auto px-4 sm:px-8 mt-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">

          {/* Hero */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-premium p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                    Good morning, {profile.displayName}! 👋
                  </h1>
                  <p className="text-white/80 text-lg max-w-xl">
                    "Success is the sum of small efforts, repeated day in and day out." Let's keep the momentum going.
                  </p>
                  <Badge className="mt-3 bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {profile.yearGroup}
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <div className="glass bg-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[100px]">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                      <Flame className="text-orange-400 fill-orange-400" />
                      {profile.streak}
                    </div>
                    <span className="text-white/80 text-sm font-medium">Day Streak</span>
                  </div>
                  <div className="glass bg-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                      <Sparkles className="text-yellow-300" />
                      {profile.xp}
                    </div>
                    <span className="text-white/80 text-sm font-medium">XP Earned</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 bg-black/20 rounded-full p-1.5 flex items-center gap-4 relative z-10">
                <Progress value={(profile.xp / profile.maxXp) * 100} className="h-3 bg-black/20 [&>div]:bg-white" />
                <span className="text-white font-medium text-sm whitespace-nowrap px-2">
                  {profile.xp} / {profile.maxXp} XP to next level
                </span>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Subjects + Chart */}
            <div className="lg:col-span-2 space-y-8">

              <motion.section variants={itemVariants}>
                <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="text-primary" /> Current Performance
                </h2>
                <Card className="glass-card">
                  <CardContent className="p-0">
                    {profile.subjects.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <BookOpen className="mx-auto mb-3 w-10 h-10 opacity-30" />
                        <p>No subjects added yet. Your mentor will update your scores here.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {profile.subjects.map((sub, idx) => (
                          <div key={idx} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground text-lg">{sub.name}</span>
                                <Badge className={getGradeColor(sub.current)} variant="outline">
                                  {sub.current > 0 ? `${sub.current}%` : "Not graded"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4">
                                <Progress value={mounted ? sub.current : 0} className="h-2 flex-1" />
                                <span className="text-sm text-muted-foreground w-24 text-right">
                                  Target: {sub.target}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.section>

              {hasSubjectHistory && (
                <motion.section variants={itemVariants}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>8-Week Progress Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Goals */}
              {(profile.targets.shortTerm.length > 0 || profile.targets.longTerm.length > 0) && (
                <motion.section variants={itemVariants}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="text-primary" /> My Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {profile.targets.shortTerm.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Short Term</h4>
                            <ul className="space-y-2">
                              {profile.targets.shortTerm.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {profile.targets.longTerm.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Long Term</h4>
                            <ul className="space-y-2">
                              {profile.targets.longTerm.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Star className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}
            </div>

            {/* Right: Achievements, Key Advice, Sessions */}
            <div className="space-y-8">

              <motion.section variants={itemVariants}>
                <Card className="glass-card border-t-4 border-t-secondary">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="text-secondary" /> Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 pb-2">
                      {profile.achievements.map((ach) => (
                        <div
                          key={ach.id}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] border transition-all ${
                            ach.unlocked
                              ? "bg-secondary/10 border-secondary/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                              : "bg-muted/50 border-border opacity-50 grayscale"
                          }`}
                        >
                          <span className="text-3xl mb-2 filter drop-shadow-md">{ach.icon}</span>
                          <span className="text-[10px] font-semibold text-center leading-tight">{ach.title}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {keyAdvice && (
                <motion.section variants={itemVariants}>
                  <div className="rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-16 h-16 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                      Key Advice 💡
                    </h3>
                    <p className="text-sm text-foreground/90 italic relative z-10">"{keyAdvice.text}"</p>
                  </div>
                </motion.section>
              )}

              <motion.section variants={itemVariants}>
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" /> Next Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mySessions.length > 0 ? (
                      mySessions.map((session) => (
                        <div key={session.id} className="p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm">{session.type}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(session.date), "EEE, MMM d 'at' h:mm a")}
                              </p>
                            </div>
                            <a
                              href={session.googleClassroomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                            >
                              <Button
                                size="sm"
                                className="rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white gap-1.5 text-xs"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Join
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming sessions yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.section>

              {myNotes.filter((n) => !n.isKeyAdvice).length > 0 && (
                <motion.section variants={itemVariants}>
                  <Card className="glass-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Mentor Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {myNotes.filter((n) => !n.isKeyAdvice).map((note) => (
                        <div key={note.id} className="p-3 rounded-lg border bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">
                            {format(new Date(note.date), "MMM d")}
                          </p>
                          <p className="text-sm leading-relaxed">{note.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.section>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
