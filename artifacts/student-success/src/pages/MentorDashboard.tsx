import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAppState } from "@/hooks/use-app-state";
import { 
  Home, BookOpen, Calendar as CalendarIcon, Trophy, MessageSquare, 
  Folder, Settings, ChevronLeft, ChevronRight, Plus, Target, CheckCircle2,
  Sun, Moon, LogOut, Send, FileText, Video, ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper for GitHub style heatmap
const Heatmap = () => {
  const days = Array.from({ length: 28 }); // 4 weeks
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1 w-full overflow-x-auto py-2">
      {days.map((_, i) => {
        const intensity = Math.floor(Math.random() * 5); // 0-4
        return (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-sm ${
              intensity === 0 ? 'bg-muted' :
              intensity === 1 ? 'bg-success/30' :
              intensity === 2 ? 'bg-success/60' :
              intensity === 3 ? 'bg-success/80' : 'bg-success'
            }`}
            title={`Day ${i+1}`}
          />
        );
      })}
    </div>
  );
};

export default function MentorDashboard() {
  const { currentUser, students, notes, addNote, sessions, logout, theme, toggleTheme } = useAppState();
  const [, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Note form state
  const [newNote, setNewNote] = useState("");
  const [isKeyAdvice, setIsKeyAdvice] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'mentor') {
      setLocation('/login');
    } else {
      const myStudents = students.filter(s => s.mentorId === currentUser.id);
      if (myStudents.length > 0 && !activeStudentId) {
        setActiveStudentId(myStudents[0].id);
      }
    }
  }, [currentUser, setLocation, students, activeStudentId]);

  if (!currentUser || currentUser.role !== 'mentor') return null;

  const myStudents = students.filter(s => s.mentorId === currentUser.id);
  const activeStudent = myStudents.find(s => s.id === activeStudentId);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !newNote.trim()) return;
    
    addNote({
      studentId: activeStudent.id,
      mentorId: currentUser.id,
      date: new Date().toISOString(),
      text: newNote,
      subject: "General", // Defaulting for mock
      isKeyAdvice
    });
    setNewNote("");
    setIsKeyAdvice(false);
    setIsNoteDialogOpen(false);
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'subjects', icon: BookOpen, label: 'Subjects' },
    { id: 'schedule', icon: CalendarIcon, label: 'Schedule' },
    { id: 'achievements', icon: Trophy, label: 'Achievements' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'resources', icon: Folder, label: 'Resources' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: collapsed ? 80 : 260 }}
        className="h-full bg-card border-r border-border/50 flex flex-col relative z-20 shrink-0"
      >
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          <div className="w-8 h-8 rounded bg-gradient-premium flex items-center justify-center shrink-0">
            <span className="text-white font-bold font-display">S</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-lg ml-3 whitespace-nowrap overflow-hidden"
              >
                SuccessFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${activeTab === item.id ? 'text-primary' : 'group-hover:text-foreground'}`} />
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border/50 space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="ml-3">Theme</span>}
          </button>
          <div className="flex items-center gap-3 mt-4">
            <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">{currentUser.avatar}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={logout}>Sign out</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-8 shrink-0">
          <h2 className="text-xl font-semibold capitalize font-display">{activeTab}</h2>
        </header>

        {activeTab === 'dashboard' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Students List */}
            <div className="w-80 border-r border-border/50 bg-muted/10 overflow-y-auto shrink-0 p-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">My Students</h3>
              <div className="space-y-2">
                {myStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setActiveStudentId(student.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      activeStudentId === student.id 
                        ? 'bg-card border-primary/30 shadow-md ring-1 ring-primary/20' 
                        : 'bg-transparent border-transparent hover:bg-card hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-premium text-white">{student.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.yearGroup}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Panel: Student Details */}
            {activeStudent ? (
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gradient-to-br from-background to-muted/20">
                
                {/* Profile Header Card */}
                <Card className="glass border-primary/10 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                      <AvatarFallback className="text-2xl bg-gradient-premium text-white">{activeStudent.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-display font-bold">{activeStudent.name}</h1>
                      <div className="flex gap-3 mt-2">
                        <Badge variant="secondary">{activeStudent.yearGroup}</Badge>
                        <Badge variant="outline" className="text-success border-success/30 bg-success/5">On Track</Badge>
                      </div>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-3xl font-bold text-primary">{activeStudent.xp}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Total XP</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-orange-500">{activeStudent.streak}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Activity & Targets (Col 1 & 2) */}
                  <div className="xl:col-span-2 space-y-8">
                    
                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" /> Activity & Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <p className="text-sm text-muted-foreground mb-2">30-Day Activity Heatmap</p>
                          <Heatmap />
                        </div>
                        <div className="h-[200px] mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeStudent.subjects[0].history.map((h,i) => ({ week: `W${i+1}`, score: h }))}>
                              <defs>
                                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="week" hide />
                              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#colorPerf)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Mentor Notes</CardTitle>
                        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20"><Plus className="w-4 h-4 mr-1" /> Add Note</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Add Note for {activeStudent.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddNote} className="space-y-4 pt-4">
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
                        <div className="space-y-4 mt-4">
                          {notes.filter(n => n.studentId === activeStudent.id).map(note => (
                            <div key={note.id} className={`p-4 rounded-xl border ${note.isKeyAdvice ? 'bg-amber-500/5 border-amber-500/20' : 'bg-background/50 border-border/50'}`}>
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className={note.isKeyAdvice ? 'text-amber-500 border-amber-500/50' : 'text-muted-foreground'}>
                                  {format(new Date(note.date), "MMM d")}
                                </Badge>
                                {note.isKeyAdvice && <Sparkles className="w-4 h-4 text-amber-500" />}
                              </div>
                              <p className="text-sm leading-relaxed">{note.text}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                  </div>

                  {/* Sidebar stats (Col 3) */}
                  <div className="space-y-8">
                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Current Goals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Short Term</h4>
                            <ul className="space-y-2">
                              {activeStudent.targets.shortTerm.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-4 border-t border-border/50">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">Long Term</h4>
                            <ul className="space-y-2">
                              {activeStudent.targets.longTerm.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Trophy className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Subject Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {activeStudent.subjects.map((sub, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{sub.name}</span>
                              <span className="font-semibold">{sub.current}%</span>
                            </div>
                            <Progress value={sub.current} className="h-1.5" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a student to view details
              </div>
            )}
          </div>
        ) : activeTab === 'subjects' ? (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <h2 className="text-2xl font-display font-bold">Subject Overview — All Students</h2>
            {myStudents.map(student => (
              <Card key={student.id} className="glass-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-premium text-white">{student.avatar}</AvatarFallback></Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{student.yearGroup}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.subjects.map((sub, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{sub.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">Target: {sub.target}%</span>
                          <Badge variant="outline" className={sub.current >= 80 ? "text-success border-success/30" : sub.current >= 60 ? "text-warning border-warning/30" : "text-destructive border-destructive/30"}>
                            {sub.current}%
                          </Badge>
                        </div>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${sub.current >= 80 ? 'bg-success' : sub.current >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${sub.current}%` }} />
                        <div className="absolute h-full w-0.5 bg-primary/50" style={{ left: `${sub.target}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Upcoming Sessions</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-premium text-white"><Plus className="w-4 h-4 mr-2" />Schedule Session</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Schedule New Session</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Student</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                        <SelectContent>{myStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input type="date" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Time</label><Input type="time" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Session Type</label>
                      <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-on-one">One-on-one</SelectItem>
                          <SelectItem value="group">Group Study</SelectItem>
                          <SelectItem value="mock-exam">Mock Exam Review</SelectItem>
                          <SelectItem value="parent">Parent Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-premium text-white">Confirm Session</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {sessions.filter(s => myStudents.some(ms => ms.id === s.studentId)).map(session => {
                const student = myStudents.find(s => s.id === session.studentId);
                return (
                  <Card key={session.id} className="glass-card hover:border-primary/30 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <CalendarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{session.type}</p>
                          <p className="text-sm text-muted-foreground">{student?.name} • {format(new Date(session.date), "EEE, MMM d 'at' h:mm a")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">UPCOMING</Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'achievements' ? (
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <h2 className="text-2xl font-display font-bold">Student Achievements</h2>
            {myStudents.map(student => (
              <Card key={student.id} className="glass-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-premium text-white">{student.avatar}</AvatarFallback></Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{student.achievements.filter(a => a.unlocked).length} / {student.achievements.length} unlocked</p>
                    </div>
                    <div className="ml-auto">
                      <Progress value={(student.achievements.filter(a => a.unlocked).length / student.achievements.length) * 100} className="h-2 w-32" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {student.achievements.map(ach => (
                      <div key={ach.id} className={`flex flex-col items-center p-4 rounded-xl border min-w-[90px] transition-all ${ach.unlocked ? 'bg-secondary/10 border-secondary/30 shadow-md' : 'bg-muted/30 border-border opacity-50 grayscale'}`}>
                        <span className="text-3xl mb-2">{ach.icon}</span>
                        <span className="text-xs font-semibold text-center">{ach.title}</span>
                        {ach.unlocked ? <span className="text-[10px] text-success mt-1">Earned</span> : <span className="text-[10px] text-muted-foreground mt-1">Locked</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeTab === 'messages' ? (
          <div className="flex-1 overflow-y-auto p-8">
            <h2 className="text-2xl font-display font-bold mb-6">Messages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
              <Card className="glass-card col-span-1">
                <CardHeader className="pb-3"><CardTitle className="text-base">Conversations</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {myStudents.map(student => (
                    <button key={student.id} onClick={() => setActiveStudentId(student.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b border-border/30 ${activeStudentId === student.id ? 'bg-primary/5' : ''}`}>
                      <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className="bg-gradient-premium text-white">{student.avatar}</AvatarFallback></Avatar>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">Last message from session...</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
              <Card className="glass-card col-span-2 flex flex-col">
                <CardHeader className="pb-3 border-b border-border/30">
                  <CardTitle className="text-base">{myStudents.find(s => s.id === activeStudentId)?.name ?? 'Select a conversation'}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 flex flex-col justify-end gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-end"><div className="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-xs">Hi! How are you getting on with the revision plan?</div></div>
                    <div className="flex justify-start"><div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2 text-sm max-w-xs">Going well! Finished chapter 4 last night.</div></div>
                    <div className="flex justify-end"><div className="bg-primary text-white rounded-2xl rounded-br-sm px-4 py-2 text-sm max-w-xs">Great progress! Keep it up 💪</div></div>
                  </div>
                  <div className="flex gap-3 mt-auto pt-4 border-t border-border/30">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button className="bg-gradient-premium text-white"><Send className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === 'resources' ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Resource Hub</h2>
              <Button className="bg-gradient-premium text-white"><Plus className="w-4 h-4 mr-2" />Add Resource</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(res => (
                <Card key={res.id} className="glass-card group hover:border-primary/30">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${res.type === 'VIDEO' ? 'bg-secondary/10' : res.type === 'NOTES' ? 'bg-primary/10' : 'bg-success/10'}`}>
                      {res.type === 'VIDEO' ? <Video className="w-6 h-6 text-secondary" /> : res.type === 'NOTES' ? <FileText className="w-6 h-6 text-primary" /> : <ClipboardList className="w-6 h-6 text-success" />}
                    </div>
                    <div>
                      <p className="font-semibold">{res.title}</p>
                      <Badge variant="outline" className={`mt-1 text-xs ${res.type === 'VIDEO' ? 'text-secondary border-secondary/30' : res.type === 'NOTES' ? 'text-primary border-primary/30' : 'text-success border-success/30'}`}>{res.type}</Badge>
                    </div>
                    <div className="flex gap-2 mt-auto pt-2 border-t border-border/30">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">View</Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">Share</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
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
                      <p className="font-semibold text-lg">{currentUser.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Display Name</label><Input defaultValue={currentUser.name} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input defaultValue={`${currentUser.username}@successflow.edu`} /></div>
                  </div>
                  <Button className="bg-gradient-premium text-white">Save Changes</Button>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme} className="gap-2">
                    {theme === 'dark' ? <><Sun className="w-4 h-4" />Light Mode</> : <><Moon className="w-4 h-4" />Dark Mode</>}
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
        ) : null}
      </main>
    </div>
  );
}
