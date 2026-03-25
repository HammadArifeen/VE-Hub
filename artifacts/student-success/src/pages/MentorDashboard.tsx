import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAppState } from "@/hooks/use-app-state";
import { AUTH_USERS } from "@/lib/mock-data";
import {
  Home, BookOpen, Calendar as CalendarIcon, Trophy, MessageSquare,
  Folder, Settings, ChevronLeft, ChevronRight, Plus, Target, CheckCircle2,
  Sun, Moon, LogOut, Send, FileText, Video, ClipboardList, Users, Sparkles, ExternalLink,
  Menu, X, GraduationCap, ClipboardCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const Heatmap = () => {
  const days = Array.from({ length: 28 });
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
      {days.map((_, i) => {
        const intensity = Math.floor(Math.random() * 5);
        return (
          <div key={i} className={`w-4 h-4 rounded-sm ${intensity === 0 ? "bg-muted" : intensity === 1 ? "bg-success/30" : intensity === 2 ? "bg-success/60" : intensity === 3 ? "bg-success/80" : "bg-success"}`} title={`Day ${i + 1}`} />
        );
      })}
    </div>
  );
};

export default function MentorDashboard() {
  const {
    currentUser, getMentorProfile, notes, addNote, deleteNote,
    sessions, addSession, resources, addResource, logout, theme, toggleTheme,
    sendMessage, getConversationMessages,
    mockResults, addMockResult, homework, addHomework, updateHomeworkStatus
  } = useAppState();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const [newNote, setNewNote] = useState("");
  const [noteSubject, setNoteSubject] = useState("General");
  const [isKeyAdvice, setIsKeyAdvice] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  const [sessionStudentId, setSessionStudentId] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionType, setSessionType] = useState("One-on-one");
  const [sessionLink, setSessionLink] = useState("");
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);

  const [newResTitle, setNewResTitle] = useState("");
  const [newResType, setNewResType] = useState<"NOTES" | "VIDEO" | "WORKSHEET">("NOTES");
  const [isResDialogOpen, setIsResDialogOpen] = useState(false);

  const [msgInput, setMsgInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isMockDialogOpen, setIsMockDialogOpen] = useState(false);
  const [mockSubject, setMockSubject] = useState("");
  const [mockScore, setMockScore] = useState("");
  const [mockTotal, setMockTotal] = useState("100");
  const [mockGrade, setMockGrade] = useState("");
  const [mockNotes, setMockNotes] = useState("");
  const [mockStudentId, setMockStudentId] = useState("");

  const [isHwDialogOpen, setIsHwDialogOpen] = useState(false);
  const [hwTitle, setHwTitle] = useState("");
  const [hwSubject, setHwSubject] = useState("");
  const [hwDueDate, setHwDueDate] = useState("");
  const [hwStudentId, setHwStudentId] = useState("");

  const [isGradeHwDialogOpen, setIsGradeHwDialogOpen] = useState(false);
  const [gradeHwId, setGradeHwId] = useState("");
  const [gradeHwGrade, setGradeHwGrade] = useState("");
  const [gradeHwFeedback, setGradeHwFeedback] = useState("");

  const mentorProfile = getMentorProfile(currentUser?.id ?? "");
  const myStudents = mentorProfile?.studentNames ?? [];
  const registeredStudents = AUTH_USERS.filter((u) => u.role === "student");

  useEffect(() => {
    if (myStudents.length > 0 && !activeStudentId) {
      setActiveStudentId(myStudents[0].id);
    }
  }, [myStudents.length]);

  if (!currentUser || currentUser.role !== "mentor") return null;
  if (!mentorProfile) return null;

  const activeStudent = myStudents.find((s) => s.id === activeStudentId) ?? null;
  const myNotes = notes.filter((n) => n.mentorId === currentUser.id);
  const myResources = resources.filter((r) => r.mentorId === currentUser.id);
  const mySessions = sessions.filter((s) => s.mentorId === currentUser.id);
  const myMockResults = mockResults.filter((r) => r.mentorId === currentUser.id);
  const myHomework = homework.filter((h) => h.mentorId === currentUser.id);

  const conversationKey = activeStudentId ? [currentUser.id, activeStudentId].sort().join("-") : "";
  const conversationMessages = getConversationMessages(conversationKey);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !newNote.trim()) return;
    addNote({
      studentId: activeStudent.id,
      mentorId: currentUser.id,
      date: new Date().toISOString(),
      text: newNote,
      subject: noteSubject,
      isKeyAdvice,
    });
    setNewNote("");
    setNoteSubject("General");
    setIsKeyAdvice(false);
    setIsNoteDialogOpen(false);
  };

  const handleScheduleSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionStudentId || !sessionDate || !sessionTime || !sessionLink) return;
    addSession({
      studentId: sessionStudentId,
      mentorId: currentUser.id,
      date: `${sessionDate}T${sessionTime}:00`,
      type: sessionType,
      googleClassroomLink: sessionLink,
      status: "upcoming",
    });
    setSessionStudentId("");
    setSessionDate("");
    setSessionTime("");
    setSessionLink("");
    setIsSessionDialogOpen(false);
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim()) return;
    addResource({ title: newResTitle, type: newResType, mentorId: currentUser.id });
    setNewResTitle("");
    setNewResType("NOTES");
    setIsResDialogOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeStudentId) return;
    sendMessage({
      conversationKey,
      senderId: currentUser.id,
      senderName: mentorProfile.displayName,
      text: msgInput.trim(),
    });
    setMsgInput("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleAddMockResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockStudentId || !mockSubject || !mockScore) return;
    addMockResult({
      studentId: mockStudentId,
      mentorId: currentUser.id,
      subject: mockSubject,
      score: Number(mockScore),
      totalMarks: Number(mockTotal) || 100,
      grade: mockGrade,
      date: new Date().toISOString(),
      notes: mockNotes,
    });
    setMockStudentId("");
    setMockSubject("");
    setMockScore("");
    setMockTotal("100");
    setMockGrade("");
    setMockNotes("");
    setIsMockDialogOpen(false);
  };

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwStudentId || !hwTitle || !hwSubject || !hwDueDate) return;
    addHomework({
      studentId: hwStudentId,
      mentorId: currentUser.id,
      title: hwTitle,
      subject: hwSubject,
      dueDate: hwDueDate,
      status: "pending",
    });
    setHwStudentId("");
    setHwTitle("");
    setHwSubject("");
    setHwDueDate("");
    setIsHwDialogOpen(false);
  };

  const handleGradeHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeHwId) return;
    updateHomeworkStatus(gradeHwId, "graded", gradeHwGrade, gradeHwFeedback);
    setGradeHwId("");
    setGradeHwGrade("");
    setGradeHwFeedback("");
    setIsGradeHwDialogOpen(false);
  };

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "subjects", icon: BookOpen, label: "Students" },
    { id: "schedule", icon: CalendarIcon, label: "Schedule" },
    { id: "grades", icon: GraduationCap, label: "Grades & Mocks" },
    { id: "homework", icon: ClipboardCheck, label: "Homework" },
    { id: "achievements", icon: Trophy, label: "Achievements" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "resources", icon: Folder, label: "Resources" },
  ];

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center px-4 border-b border-border/50">
        <img src="/ve-logo.png" alt="VE" className="h-8 w-8 rounded object-cover shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-display font-bold text-lg ml-3 whitespace-nowrap overflow-hidden"
            >
              Voices Empowered
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={() => setMobileOpen(false)} className="ml-auto md:hidden p-1">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => switchTab(item.id)}
            className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all group ${
              activeTab === item.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <item.icon className={`h-5 w-5 shrink-0 ${activeTab === item.id ? "text-primary" : "group-hover:text-foreground"}`} />
            {!collapsed && <span className="ml-3 truncate text-sm">{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 space-y-2">
        <button onClick={toggleTheme} className="w-full flex items-center px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
          {theme === "dark" ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
          {!collapsed && <span className="ml-3 text-sm">Toggle Theme</span>}
        </button>
        <div className="flex items-center gap-3 mt-4">
          <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary">{currentUser.avatar}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{mentorProfile.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{mentorProfile.subject}</p>
              <p className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={logout}>Sign out</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        className="hidden md:flex h-full bg-card border-r border-border/50 flex-col relative z-20 shrink-0"
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border/50 flex flex-col z-40 md:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 md:h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-4 md:px-8 shrink-0 gap-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg md:text-xl font-semibold capitalize font-display truncate">{navItems.find((n) => n.id === activeTab)?.label ?? activeTab}</h2>
          <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">{mentorProfile.subject}</Badge>
          <Badge variant="outline" className="hidden sm:inline-flex">{myStudents.length} students</Badge>
        </header>

        {activeTab === "dashboard" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border/50 bg-muted/10 overflow-y-auto shrink-0 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> My Students
              </h3>
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {myStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-2 py-4">No students added yet.</p>
                ) : (
                  myStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setActiveStudentId(student.id)}
                      className={`min-w-[160px] md:min-w-0 w-full text-left p-3 rounded-xl transition-all border shrink-0 ${
                        activeStudentId === student.id
                          ? "bg-card border-primary/30 shadow-md ring-1 ring-primary/20"
                          : "bg-transparent border-transparent hover:bg-card hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-premium text-white text-sm">{initials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.yearGroup || "Year not set"}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {activeStudent ? (
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-br from-background to-muted/20">
                <Card className="glass border-primary/10 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  <CardContent className="p-4 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 relative z-10">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-xl">
                      <AvatarFallback className="text-xl md:text-2xl bg-gradient-premium text-white">{initials(activeStudent.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-display font-bold">{activeStudent.name}</h1>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeStudent.yearGroup && <Badge variant="secondary">{activeStudent.yearGroup}</Badge>}
                        <Badge variant="outline" className="text-success border-success/30 bg-success/5">Active Student</Badge>
                      </div>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-2xl md:text-3xl font-bold text-primary">{myNotes.filter((n) => n.studentId === activeStudent.id).length}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Notes</p>
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-bold text-secondary">{mySessions.filter((s) => s.studentId === activeStudent.id).length}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Sessions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" /> Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">30-Day Activity Heatmap</p>
                        <Heatmap />
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Mentor Notes</CardTitle>
                        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                              <Plus className="w-4 h-4 mr-1" /> Add Note
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Add Note for {activeStudent.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddNote} className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input value={noteSubject} onChange={(e) => setNoteSubject(e.target.value)} placeholder="e.g. Maths, General" />
                              </div>
                              <Textarea
                                placeholder="Write observation or advice..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="min-h-[100px]"
                                required
                              />
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={isKeyAdvice} onChange={(e) => setIsKeyAdvice(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                                <span className="text-sm">Mark as Key Advice</span>
                              </label>
                              <Button type="submit" className="w-full">Save Note</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 mt-2">
                          {myNotes.filter((n) => n.studentId === activeStudent.id).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No notes yet. Add your first note above.</p>
                          ) : (
                            myNotes.filter((n) => n.studentId === activeStudent.id).map((note) => (
                              <div key={note.id} className={`p-4 rounded-xl border group relative ${note.isKeyAdvice ? "bg-amber-500/5 border-amber-500/20" : "bg-background/50 border-border/50"}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className={note.isKeyAdvice ? "text-amber-500 border-amber-500/50" : "text-muted-foreground"}>
                                      {format(new Date(note.date), "MMM d")}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">{note.subject}</Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {note.isKeyAdvice && <Sparkles className="w-4 h-4 text-amber-500" />}
                                    <button onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 text-xs ml-2 transition-opacity">Remove</button>
                                  </div>
                                </div>
                                <p className="text-sm leading-relaxed">{note.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mySessions.filter((s) => s.studentId === activeStudent.id && s.status === "upcoming").length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No sessions scheduled.</p>
                        ) : (
                          mySessions.filter((s) => s.studentId === activeStudent.id && s.status === "upcoming").map((sess) => (
                            <div key={sess.id} className="p-3 rounded-lg border bg-background/50 text-sm">
                              <p className="font-semibold">{sess.type}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(sess.date), "EEE MMM d, h:mm a")}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Student Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const studentMocks = myMockResults.filter((r) => r.studentId === activeStudent.id);
                          const studentHw = myHomework.filter((h) => h.studentId === activeStudent.id);
                          const completedHw = studentHw.filter((h) => h.status === "graded").length;
                          const totalHw = studentHw.length;
                          const hwProgress = totalHw > 0 ? Math.round((completedHw / totalHw) * 100) : 0;
                          const avgScore = studentMocks.length > 0
                            ? Math.round(studentMocks.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / studentMocks.length)
                            : 0;
                          return (
                            <>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Homework Completion</span>
                                  <span className="font-semibold">{completedHw}/{totalHw}</span>
                                </div>
                                <Progress value={hwProgress} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Mock Avg Score</span>
                                  <span className="font-semibold">{avgScore}%</span>
                                </div>
                                <Progress value={avgScore} className="h-2" />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {studentMocks.length} mock result{studentMocks.length !== 1 ? "s" : ""} recorded
                              </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Users className="w-12 h-12 opacity-20" />
                <p>Select a student to view their details</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <h2 className="text-2xl font-display font-bold">Student Overview</h2>
            {myStudents.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Users className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p>No students added yet.</p>
                </CardContent>
              </Card>
            ) : (
              myStudents.map((student) => {
                const studentNotes = myNotes.filter((n) => n.studentId === student.id);
                const studentSessions = mySessions.filter((s) => s.studentId === student.id);
                return (
                  <Card key={student.id} className="glass-card hover:border-primary/30 transition-all">
                    <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-gradient-premium text-white">{initials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.yearGroup || "Year not set"}</p>
                      </div>
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{studentNotes.length}</p>
                          <p className="text-xs text-muted-foreground uppercase">Notes</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-secondary">{studentSessions.length}</p>
                          <p className="text-xs text-muted-foreground uppercase">Sessions</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setActiveStudentId(student.id); switchTab("dashboard"); }}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-display font-bold">Upcoming Sessions</h2>
              <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-premium text-white"><Plus className="w-4 h-4 mr-2" />Schedule Session</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Schedule New Session</DialogTitle></DialogHeader>
                  <form onSubmit={handleScheduleSession} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student</label>
                      <Select value={sessionStudentId} onValueChange={setSessionStudentId}>
                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>
                          {registeredStudents.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required /></div>
                      <div className="space-y-2"><label className="text-sm font-medium">Time</label><Input type="time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required /></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session Type</label>
                      <Select value={sessionType} onValueChange={setSessionType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="One-on-one">One-on-one</SelectItem>
                          <SelectItem value="Group Study">Group Study</SelectItem>
                          <SelectItem value="Mock Exam Review">Mock Exam Review</SelectItem>
                          <SelectItem value="Parent Meeting">Parent Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        Google Classroom Link
                        <span className="text-[10px] font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Required</span>
                      </label>
                      <Input
                        type="url"
                        value={sessionLink}
                        onChange={(e) => setSessionLink(e.target.value)}
                        placeholder="https://classroom.google.com/..."
                        required
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Students will receive this link to join the session.</p>
                    </div>
                    <Button
                      type="submit"
                      disabled={!sessionStudentId || !sessionDate || !sessionTime || !sessionLink}
                      className="w-full bg-gradient-premium text-white"
                    >
                      Confirm Session & Notify Student
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {mySessions.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <CalendarIcon className="mx-auto mb-3 w-10 h-10 opacity-20" />
                    <p>No sessions scheduled yet.</p>
                  </CardContent>
                </Card>
              ) : (
                mySessions.map((session) => {
                  const student = registeredStudents.find((s) => s.id === session.studentId) ?? myStudents.find((s) => s.id === session.studentId);
                  return (
                    <Card key={session.id} className="glass-card hover:border-primary/30 transition-all">
                      <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold">{session.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {student?.name ?? "Unknown"} • {format(new Date(session.date), "EEE, MMM d 'at' h:mm a")}
                            </p>
                            <a
                              href={session.googleClassroomLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              Google Classroom Link
                            </a>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 shrink-0">UPCOMING</Badge>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-display font-bold">Grades & Mock Results</h2>
              <Dialog open={isMockDialogOpen} onOpenChange={setIsMockDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-premium text-white"><Plus className="w-4 h-4 mr-2" />Add Mock Result</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Record Mock Exam Result</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddMockResult} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student</label>
                      <Select value={mockStudentId} onValueChange={setMockStudentId}>
                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>
                          {registeredStudents.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input value={mockSubject} onChange={(e) => setMockSubject(e.target.value)} placeholder="e.g. Maths" required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Score</label>
                        <Input type="number" value={mockScore} onChange={(e) => setMockScore(e.target.value)} placeholder="72" required min={0} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Out of</label>
                        <Input type="number" value={mockTotal} onChange={(e) => setMockTotal(e.target.value)} placeholder="100" min={1} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Grade</label>
                        <Input value={mockGrade} onChange={(e) => setMockGrade(e.target.value)} placeholder="B+" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes (optional)</label>
                      <Textarea value={mockNotes} onChange={(e) => setMockNotes(e.target.value)} placeholder="Any observations..." className="min-h-[60px]" />
                    </div>
                    <Button type="submit" disabled={!mockStudentId || !mockSubject || !mockScore} className="w-full bg-gradient-premium text-white">Save Result</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {myMockResults.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <GraduationCap className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p>No mock results recorded yet. Add your first result above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myMockResults.map((result) => {
                  const student = registeredStudents.find((s) => s.id === result.studentId);
                  const pct = Math.round((result.score / result.totalMarks) * 100);
                  return (
                    <Card key={result.id} className="glass-card">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{student?.name ?? "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{result.subject}</p>
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
                        <p className="text-xs text-muted-foreground">{format(new Date(result.date), "MMM d, yyyy")}</p>
                        {result.notes && <p className="text-xs italic text-muted-foreground">"{result.notes}"</p>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "homework" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-2xl font-display font-bold">Homework Tracker</h2>
              <Dialog open={isHwDialogOpen} onOpenChange={setIsHwDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-premium text-white"><Plus className="w-4 h-4 mr-2" />Assign Homework</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddHomework} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student</label>
                      <Select value={hwStudentId} onValueChange={setHwStudentId}>
                        <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>
                          {registeredStudents.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} placeholder="e.g. Chapter 5 exercises" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Input value={hwSubject} onChange={(e) => setHwSubject(e.target.value)} placeholder="e.g. Maths" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <Input type="date" value={hwDueDate} onChange={(e) => setHwDueDate(e.target.value)} required />
                      </div>
                    </div>
                    <Button type="submit" disabled={!hwStudentId || !hwTitle || !hwSubject || !hwDueDate} className="w-full bg-gradient-premium text-white">Assign Homework</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isGradeHwDialogOpen} onOpenChange={setIsGradeHwDialogOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Grade Homework</DialogTitle></DialogHeader>
                <form onSubmit={handleGradeHomework} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grade</label>
                    <Input value={gradeHwGrade} onChange={(e) => setGradeHwGrade(e.target.value)} placeholder="e.g. A, B+, 85%" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback</label>
                    <Textarea value={gradeHwFeedback} onChange={(e) => setGradeHwFeedback(e.target.value)} placeholder="Great work on..." className="min-h-[80px]" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-premium text-white">Save Grade</Button>
                </form>
              </DialogContent>
            </Dialog>

            {myHomework.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <ClipboardCheck className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p>No homework assigned yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myHomework.map((hw) => {
                  const student = registeredStudents.find((s) => s.id === hw.studentId);
                  const isOverdue = new Date(hw.dueDate) < new Date() && hw.status === "pending";
                  return (
                    <Card key={hw.id} className={`glass-card ${isOverdue ? "border-destructive/30" : ""}`}>
                      <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            hw.status === "graded" ? "bg-success/10" : hw.status === "submitted" ? "bg-primary/10" : isOverdue ? "bg-destructive/10" : "bg-warning/10"
                          }`}>
                            <ClipboardCheck className={`w-5 h-5 ${
                              hw.status === "graded" ? "text-success" : hw.status === "submitted" ? "text-primary" : isOverdue ? "text-destructive" : "text-warning"
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold">{hw.title}</p>
                            <p className="text-sm text-muted-foreground">{student?.name ?? "Unknown"} • {hw.subject} • Due {format(new Date(hw.dueDate), "MMM d")}</p>
                            {hw.grade && <p className="text-xs text-success mt-0.5">Grade: {hw.grade}</p>}
                            {hw.feedback && <p className="text-xs text-muted-foreground italic mt-0.5">"{hw.feedback}"</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`shrink-0 ${
                            hw.status === "graded" ? "text-success border-success/30 bg-success/5" :
                            hw.status === "submitted" ? "text-primary border-primary/30 bg-primary/5" :
                            isOverdue ? "text-destructive border-destructive/30 bg-destructive/5" :
                            "text-warning border-warning/30 bg-warning/5"
                          }`}>
                            {hw.status === "graded" ? "GRADED" : hw.status === "submitted" ? "SUBMITTED" : isOverdue ? "OVERDUE" : "PENDING"}
                          </Badge>
                          {hw.status !== "graded" && (
                            <Button size="sm" variant="outline" onClick={() => {
                              if (hw.status === "pending") {
                                updateHomeworkStatus(hw.id, "submitted");
                              } else {
                                setGradeHwId(hw.id);
                                setGradeHwGrade("");
                                setGradeHwFeedback("");
                                setIsGradeHwDialogOpen(true);
                              }
                            }}>
                              {hw.status === "pending" ? "Mark Submitted" : "Grade"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            <h2 className="text-2xl font-display font-bold">Student Achievements</h2>
            {myStudents.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Trophy className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p>No students added yet.</p>
                </CardContent>
              </Card>
            ) : (
              myStudents.map((student) => (
                <Card key={student.id} className="glass-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-premium text-white">{initials(student.name)}</AvatarFallback></Avatar>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myNotes.filter((n) => n.studentId === student.id && n.isKeyAdvice).length > 0 && (
                        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Key Advice Given</p>
                          {myNotes.filter((n) => n.studentId === student.id && n.isKeyAdvice).map((n) => (
                            <p key={n.id} className="text-xs text-muted-foreground italic">"{n.text.slice(0, 80)}..."</p>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {mySessions.filter((s) => s.studentId === student.id).length} sessions scheduled • {myNotes.filter((n) => n.studentId === student.id).length} notes written
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="flex-1 overflow-hidden p-4 md:p-8">
            <h2 className="text-2xl font-display font-bold mb-4">Messages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
              <Card className="glass-card col-span-1 overflow-hidden">
                <CardHeader className="pb-3"><CardTitle className="text-base">Conversations</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {myStudents.map((student) => (
                    <button key={student.id} onClick={() => setActiveStudentId(student.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border/30 ${activeStudentId === student.id ? "bg-primary/5" : ""}`}>
                      <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className="bg-gradient-premium text-white">{initials(student.name)}</AvatarFallback></Avatar>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.yearGroup || "Year not set"}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
              <Card className="glass-card col-span-1 md:col-span-2 flex flex-col overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/30 shrink-0">
                  <CardTitle className="text-base">{myStudents.find((s) => s.id === activeStudentId)?.name ?? "Select a conversation"}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {conversationMessages.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
                    )}
                    {conversationMessages.map((msg) => {
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
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="flex gap-3 pt-3 border-t border-border/30 shrink-0">
                    <Input
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      placeholder={activeStudentId ? "Type a message..." : "Select a conversation first"}
                      className="flex-1"
                      disabled={!activeStudentId}
                    />
                    <Button type="submit" disabled={!activeStudentId || !msgInput.trim()} className="bg-gradient-premium text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
              <h2 className="text-2xl font-display font-bold">Resource Hub</h2>
              <Dialog open={isResDialogOpen} onOpenChange={setIsResDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-premium text-white"><Plus className="w-4 h-4 mr-2" />Add Resource</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Resource</DialogTitle></DialogHeader>
                  <form onSubmit={handleAddResource} className="space-y-4 pt-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="Resource title" required /></div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select value={newResType} onValueChange={(v) => setNewResType(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOTES">Notes</SelectItem>
                          <SelectItem value="VIDEO">Video</SelectItem>
                          <SelectItem value="WORKSHEET">Worksheet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-premium text-white">Add Resource</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {myResources.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Folder className="mx-auto mb-3 w-10 h-10 opacity-20" />
                  <p>No resources yet. Add your first resource above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myResources.map((res) => (
                  <Card key={res.id} className="glass-card group hover:border-primary/30">
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${res.type === "VIDEO" ? "bg-secondary/10" : res.type === "NOTES" ? "bg-primary/10" : "bg-success/10"}`}>
                        {res.type === "VIDEO" ? <Video className="w-6 h-6 text-secondary" /> : res.type === "NOTES" ? <FileText className="w-6 h-6 text-primary" /> : <ClipboardList className="w-6 h-6 text-success" />}
                      </div>
                      <div>
                        <p className="font-semibold">{res.title}</p>
                        <Badge variant="outline" className={`mt-1 text-xs ${res.type === "VIDEO" ? "text-secondary border-secondary/30" : res.type === "NOTES" ? "text-primary border-primary/30" : "text-success border-success/30"}`}>{res.type}</Badge>
                      </div>
                      <div className="flex gap-2 mt-auto pt-2 border-t border-border/30">
                        <Button size="sm" variant="outline" className="flex-1 text-xs">View</Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs">Share</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl">
            <h2 className="text-2xl font-display font-bold mb-8">Settings</h2>
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-premium text-white text-xl">{currentUser.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{mentorProfile.displayName}</p>
                      <p className="text-sm text-muted-foreground">{mentorProfile.subject} Mentor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme} className="gap-2">
                    {theme === "dark" ? <><Sun className="w-4 h-4" />Light Mode</> : <><Moon className="w-4 h-4" />Dark Mode</>}
                  </Button>
                </CardContent>
              </Card>
              <Card className="glass-card border-destructive/20">
                <CardHeader><CardTitle className="text-lg text-destructive">Danger Zone</CardTitle></CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={logout} className="border-destructive text-destructive hover:bg-destructive hover:text-white gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
