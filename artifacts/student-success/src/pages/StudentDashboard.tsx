import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useAppState } from "@/hooks/use-app-state";
import { Student } from "@/lib/mock-data";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, Calendar, Sparkles, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { currentUser, students, sessions, notes } = useAppState();
  const [, setLocation] = useLocation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!currentUser || currentUser.role !== 'student') {
      setLocation('/login');
    }
    // Trigger confetti if they have an active streak
    const student = students.find(s => s.id === currentUser?.id);
    if (student && student.streak > 5) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [currentUser, setLocation, students]);

  if (!currentUser || currentUser.role !== 'student') return null;

  const student = students.find(s => s.id === currentUser.id) as Student;
  if (!student) return null;

  const mySessions = sessions.filter(s => s.studentId === student.id && s.status === 'upcoming');
  const myNotes = notes.filter(n => n.studentId === student.id);
  const keyAdvice = myNotes.find(n => n.isKeyAdvice);

  // Prepare chart data (average of all subjects per week)
  const chartData = Array.from({ length: 8 }).map((_, i) => {
    const sum = student.subjects.reduce((acc, sub) => acc + sub.history[i], 0);
    return {
      week: `W${i + 1}`,
      score: Math.round(sum / student.subjects.length)
    };
  });

  const getGradeColor = (score: number) => {
    if (score >= 80) return "bg-success text-success-foreground border-success-foreground/20";
    if (score >= 60) return "bg-warning text-warning-foreground border-warning-foreground/20";
    return "bg-destructive text-destructive-foreground border-destructive-foreground/20";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={500} />}
      <TopNav />
      
      <main className="container mx-auto px-4 sm:px-8 mt-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* Hero Section */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-premium p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                    Good morning, {student.name}! 👋
                  </h1>
                  <p className="text-white/80 text-lg max-w-xl">
                    "Success is the sum of small efforts, repeated day in and day out." Let's keep the momentum going.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="glass bg-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[100px]">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                      <Flame className="text-orange-400 fill-orange-400" />
                      {student.streak}
                    </div>
                    <span className="text-white/80 text-sm font-medium">Day Streak</span>
                  </div>
                  <div className="glass bg-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[120px]">
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                      <Sparkles className="text-yellow-300" />
                      {student.xp}
                    </div>
                    <span className="text-white/80 text-sm font-medium">XP Earned</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-black/20 rounded-full p-1.5 flex items-center gap-4 relative z-10">
                <Progress value={(student.xp / student.maxXp) * 100} className="h-3 bg-black/20 [&>div]:bg-white" />
                <span className="text-white font-medium text-sm whitespace-nowrap px-2">
                  {student.xp} / {student.maxXp} XP to next level
                </span>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Subjects & Charts */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Subject Breakdown */}
              <motion.section variants={itemVariants}>
                <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="text-primary" /> Current Performance
                </h2>
                <Card className="glass-card">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {student.subjects.map((sub, idx) => (
                        <div key={idx} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-foreground text-lg">{sub.name}</span>
                              <Badge className={getGradeColor(sub.current)} variant="outline">
                                {sub.current}%
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <Progress 
                                value={mounted ? sub.current : 0} 
                                className="h-2 flex-1" 
                              />
                              <span className="text-sm text-muted-foreground w-20 text-right">Target: {sub.target}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Progress Chart */}
              <motion.section variants={itemVariants}>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>8-Week Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                          <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

            </div>

            {/* Right Column: Badges, Schedule, Notes */}
            <div className="space-y-8">
              
              {/* Badges */}
              <motion.section variants={itemVariants}>
                <Card className="glass-card border-t-4 border-t-secondary">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="text-secondary" /> Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
                      {student.achievements.map(ach => (
                        <div 
                          key={ach.id} 
                          className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] border transition-all ${
                            ach.unlocked 
                              ? "bg-secondary/10 border-secondary/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                              : "bg-muted/50 border-border opacity-50 grayscale"
                          }`}
                        >
                          <span className="text-3xl mb-2 filter drop-shadow-md">{ach.icon}</span>
                          <span className="text-[10px] font-semibold text-center leading-tight">
                            {ach.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Key Advice */}
              {keyAdvice && (
                <motion.section variants={itemVariants}>
                  <div className="rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-16 h-16 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                      Key Advice 💡
                    </h3>
                    <p className="text-sm text-foreground/90 italic relative z-10">
                      "{keyAdvice.text}"
                    </p>
                  </div>
                </motion.section>
              )}

              {/* Upcoming Sessions */}
              <motion.section variants={itemVariants}>
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5" /> Next Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mySessions.length > 0 ? mySessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-semibold text-sm">{session.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.date), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" className="rounded-full">Join</Button>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No upcoming sessions.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.section>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
