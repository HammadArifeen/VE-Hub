import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import { useAppState } from "@/hooks/use-app-state";
import { AUTH_USERS } from "@/lib/mock-data";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flame, Trophy, Calendar, Sparkles, BookOpen, Target, Star, CheckCircle2, ExternalLink, ClipboardCheck, GraduationCap, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { currentUser, getStudentProfile, sessions, notes, mockResults, homework, messages, sendMessage, getConversationMessages } = useAppState();
  const [showConfetti, setShowConfetti] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chatMentorId, setChatMentorId] = useState<string | null>(null);
  const [studentMsgInput, setStudentMsgInput] = useState("");
  const studentMsgEndRef = useRef<HTMLDivElement>(null);

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
  const myMockResults = mockResults.filter((r) => r.studentId === currentUser.id);
  const myHomework = homework.filter((h) => h.studentId === currentUser.id);
  const completedHw = myHomework.filter((h) => h.status === "graded").length;
  const hwProgress = myHomework.length > 0 ? Math.round((completedHw / myHomework.length) * 100) : 0;

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

  const overallProgress = (() => {
    const subjectAvg = profile.subjects.length > 0
      ? Math.round(profile.subjects.reduce((s, sub) => s + sub.current, 0) / profile.subjects.length)
      : 0;
    const mockAvg = myMockResults.length > 0
      ? Math.round(myMockResults.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / myMockResults.length)
      : 0;
    const parts = [subjectAvg, mockAvg, hwProgress].filter((v) => v > 0);
    return parts.length > 0 ? Math.round(parts.reduce((s, v) => s + v, 0) / parts.length) : 0;
  })();

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

      <main className="container mx-auto px-4 sm:px-8 mt-6 md:mt-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 md:space-y-8">

          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-premium p-6 sm:p-8 md:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
                    Welcome, {profile.displayName}!
                  </h1>
                  <p className="text-white/80 text-base md:text-lg max-w-xl">
                    Every student has potential. Keep building yours.
                  </p>
                  <Badge className="mt-3 bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {profile.yearGroup}
                  </Badge>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <div className="glass bg-white/20 p-3 md:p-4 rounded-2xl flex flex-col items-center min-w-[80px] md:min-w-[100px]">
                    <div className="flex items-center gap-1 md:gap-2 text-xl md:text-2xl font-bold text-white">
                      <Flame className="text-orange-400 fill-orange-400 w-5 h-5 md:w-6 md:h-6" />
                      {profile.streak}
                    </div>
                    <span className="text-white/80 text-xs md:text-sm font-medium">Day Streak</span>
                  </div>
                  <div className="glass bg-white/20 p-3 md:p-4 rounded-2xl flex flex-col items-center min-w-[90px] md:min-w-[120px]">
                    <div className="flex items-center gap-1 md:gap-2 text-xl md:text-2xl font-bold text-white">
                      <Sparkles className="text-yellow-300 w-5 h-5 md:w-6 md:h-6" />
                      {profile.xp}
                    </div>
                    <span className="text-white/80 text-xs md:text-sm font-medium">XP Earned</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-8 bg-black/20 rounded-full p-1.5 flex items-center gap-4 relative z-10">
                <Progress value={(profile.xp / profile.maxXp) * 100} className="h-3 bg-black/20 [&>div]:bg-white" />
                <span className="text-white font-medium text-xs md:text-sm whitespace-nowrap px-2">
                  {profile.xp} / {profile.maxXp} XP
                </span>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <Card className="glass-card border-t-4 border-t-primary">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-lg">Overall Progression</h3>
                  <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                </div>
                <Progress value={mounted ? overallProgress : 0} className="h-4" />
                <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Subjects</p>
                    <p className="font-semibold">{profile.subjects.length > 0 ? Math.round(profile.subjects.reduce((s, sub) => s + sub.current, 0) / profile.subjects.length) : 0}% avg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mock Exams</p>
                    <p className="font-semibold">{myMockResults.length > 0 ? Math.round(myMockResults.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / myMockResults.length) : 0}% avg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Homework</p>
                    <p className="font-semibold">{completedHw}/{myHomework.length} done</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">

              <motion.section variants={itemVariants}>
                <h2 className="text-xl md:text-2xl font-display font-bold mb-4 flex items-center gap-2">
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
                          <div key={idx} className="p-3 sm:p-4 md:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-foreground text-base md:text-lg">{sub.name}</span>
                                <Badge className={getGradeColor(sub.current)} variant="outline">
                                  {sub.current > 0 ? `${sub.current}%` : "Not graded"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 md:gap-4">
                                <Progress value={mounted ? sub.current : 0} className="h-2 flex-1" />
                                <span className="text-xs md:text-sm text-muted-foreground w-20 md:w-24 text-right">
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

              {myMockResults.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                    <GraduationCap className="text-primary" /> Mock Exam Results
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myMockResults.map((result) => {
                      const pct = Math.round((result.score / result.totalMarks) * 100);
                      return (
                        <Card key={result.id} className="glass-card">
                          <CardContent className="p-4 md:p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{result.subject}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(result.date), "MMM d, yyyy")}</p>
                              </div>
                              {result.grade && (
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="font-bold text-primary text-sm">{result.grade}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{result.score}/{result.totalMarks}</span>
                                <span className="font-semibold">{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-2" />
                            </div>
                            {result.notes && <p className="text-xs italic text-muted-foreground">"{result.notes}"</p>}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {myHomework.length > 0 && (
                <motion.section variants={itemVariants}>
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                    <ClipboardCheck className="text-primary" /> Homework
                  </h2>
                  <Card className="glass-card">
                    <CardContent className="p-0 divide-y divide-border/50">
                      {myHomework.map((hw) => {
                        const isOverdue = new Date(hw.dueDate) < new Date() && hw.status === "pending";
                        return (
                          <div key={hw.id} className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                              hw.status === "graded" ? "bg-success/10" : hw.status === "submitted" ? "bg-primary/10" : isOverdue ? "bg-destructive/10" : "bg-warning/10"
                            }`}>
                              <ClipboardCheck className={`w-4 h-4 md:w-5 md:h-5 ${
                                hw.status === "graded" ? "text-success" : hw.status === "submitted" ? "text-primary" : isOverdue ? "text-destructive" : "text-warning"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{hw.title}</p>
                              <p className="text-xs text-muted-foreground">{hw.subject} • Due {format(new Date(hw.dueDate), "MMM d")}</p>
                              {hw.grade && <p className="text-xs text-success">Grade: {hw.grade}</p>}
                              {hw.feedback && <p className="text-xs text-muted-foreground italic">"{hw.feedback}"</p>}
                            </div>
                            <Badge variant="outline" className={`text-xs shrink-0 ${
                              hw.status === "graded" ? "text-success border-success/30" :
                              hw.status === "submitted" ? "text-primary border-primary/30" :
                              isOverdue ? "text-destructive border-destructive/30" :
                              "text-warning border-warning/30"
                            }`}>
                              {hw.status === "graded" ? "GRADED" : hw.status === "submitted" ? "SUBMITTED" : isOverdue ? "OVERDUE" : "PENDING"}
                            </Badge>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {hasSubjectHistory && (
                <motion.section variants={itemVariants}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>8-Week Progress Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] md:h-[250px] w-full">
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

            <div className="space-y-6 md:space-y-8">

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
                      Key Advice
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
                                className="rounded-full bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs"
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

          {(() => {
            const mentors = AUTH_USERS.filter((u) => u.role === "mentor");
            const mentorConversations = mentors.map((m) => {
              const key = [currentUser.id, m.id].sort().join("-");
              const msgs = getConversationMessages(key);
              return { mentor: m, conversationKey: key, messages: msgs };
            }).filter((c) => c.messages.length > 0 || chatMentorId === c.mentor.id);

            const firstMentorWithMessages = mentorConversations.length > 0 ? mentorConversations[0].mentor.id : null;
            const effectiveChatMentorId = chatMentorId ?? firstMentorWithMessages;

            const activeMentor = effectiveChatMentorId ? mentors.find((m) => m.id === effectiveChatMentorId) : null;
            const activeConvKey = activeMentor ? [currentUser.id, activeMentor.id].sort().join("-") : "";
            const activeMessages = activeConvKey ? getConversationMessages(activeConvKey) : [];

            const handleStudentSend = (e: React.FormEvent) => {
              e.preventDefault();
              if (!studentMsgInput.trim() || !activeMentor || !activeConvKey) return;
              sendMessage({
                conversationKey: activeConvKey,
                senderId: currentUser.id,
                senderName: profile.displayName,
                text: studentMsgInput.trim(),
              });
              setStudentMsgInput("");
              setTimeout(() => studentMsgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            };

            if (mentorConversations.length === 0) return null;

            return (
              <motion.section variants={itemVariants}>
                <h2 className="text-xl md:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="text-primary" /> Messages
                </h2>
                <Card className="glass-card overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 min-h-[350px]">
                    <div className="border-b md:border-b-0 md:border-r border-border/30">
                      <div className="p-3 border-b border-border/30">
                        <p className="text-sm font-semibold text-muted-foreground">Conversations</p>
                      </div>
                      <div className="overflow-y-auto max-h-[300px]">
                        {mentors.map((m) => {
                          const key = [currentUser.id, m.id].sort().join("-");
                          const msgs = getConversationMessages(key);
                          if (msgs.length === 0 && chatMentorId !== m.id) return null;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setChatMentorId(m.id)}
                              className={`w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 ${effectiveChatMentorId === m.id ? "bg-primary/5" : ""}`}
                            >
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-gradient-premium text-white text-xs">{m.avatar}</AvatarFallback>
                              </Avatar>
                              <div className="text-left min-w-0">
                                <p className="font-semibold text-sm truncate">{m.name}</p>
                                <p className="text-xs text-muted-foreground">Mentor</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex flex-col">
                      <div className="p-3 border-b border-border/30 shrink-0">
                        <p className="text-sm font-semibold">{activeMentor?.name ?? "Select a conversation"}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
                        {activeMessages.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
                        )}
                        {activeMessages.map((msg) => {
                          const isMine = msg.senderId === currentUser.id;
                          return (
                            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                              <div className={`${isMine ? "bg-primary text-white rounded-2xl rounded-br-sm" : "bg-muted rounded-2xl rounded-bl-sm"} px-4 py-2 text-sm max-w-[80%]`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                                  {format(new Date(msg.timestamp), "h:mm a")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={studentMsgEndRef} />
                      </div>
                      {activeMentor && (
                        <form onSubmit={handleStudentSend} className="flex gap-3 p-3 border-t border-border/30 shrink-0">
                          <Input
                            value={studentMsgInput}
                            onChange={(e) => setStudentMsgInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                          />
                          <Button type="submit" disabled={!studentMsgInput.trim()} className="bg-gradient-premium text-white">
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.section>
            );
          })()}
        </motion.div>
      </main>
    </div>
  );
}
