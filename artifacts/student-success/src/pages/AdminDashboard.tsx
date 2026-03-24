import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAppState } from "@/hooks/use-app-state";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Users, GraduationCap, Link as LinkIcon, Edit2, Check, X } from "lucide-react";
import { Student, Mentor } from "@/lib/mock-data";

export default function AdminDashboard() {
  const { currentUser, students, mentors, updateUserStatus } = useAppState();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setLocation('/login');
    }
  }, [currentUser, setLocation]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  const pairedStudentsCount = students.filter(s => s.mentorId).length;
  const pairingRate = Math.round((pairedStudentsCount / students.length) * 100);

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMentors = mentors.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSaveEdit = (type: 'student' | 'mentor', field: string) => {
    if (editingId) {
      updateUserStatus(editingId, type, { [field]: editValue });
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <TopNav title="SuccessFlow Admin" />
      
      <main className="container mx-auto px-4 sm:px-8 mt-8 space-y-8">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Students</p>
                <h3 className="text-3xl font-bold font-display">{students.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Mentors</p>
                <h3 className="text-3xl font-bold font-display">{mentors.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Pairing Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold font-display">{pairingRate}%</h3>
                  <span className="text-sm text-success">{pairedStudentsCount} Paired</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card className="glass-card border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-display">Directory Management</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="students" className="w-full">
              <div className="px-6 pt-4">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="mentors">Mentors</TabsTrigger>
                </TabsList>
              </div>

              {/* STUDENTS TAB */}
              <TabsContent value="students" className="m-0 mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Student</th>
                        <th className="px-6 py-4 font-medium">Year Group</th>
                        <th className="px-6 py-4 font-medium">Mentor</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredStudents.map((s: Student) => (
                        <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{s.avatar}</AvatarFallback></Avatar>
                            <span className="font-semibold text-foreground">{s.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            {editingId === s.id ? (
                              <Input 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)} 
                                className="h-8 w-24 text-xs" 
                              />
                            ) : s.yearGroup}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {mentors.find(m => m.id === s.mentorId)?.name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={s.mentorId ? "border-success text-success bg-success/5" : "border-warning text-warning bg-warning/5"}>
                              {s.mentorId ? 'PAIRED' : 'PENDING'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingId === s.id ? (
                              <div className="flex justify-end gap-2">
                                <Button size="icon" variant="ghost" onClick={() => handleSaveEdit('student', 'yearGroup')} className="h-8 w-8 text-success hover:text-success hover:bg-success/10"><Check className="h-4 w-4"/></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><X className="h-4 w-4"/></Button>
                              </div>
                            ) : (
                              <Button size="icon" variant="ghost" onClick={() => { setEditingId(s.id); setEditValue(s.yearGroup); }} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* MENTORS TAB */}
              <TabsContent value="mentors" className="m-0 mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Mentor</th>
                        <th className="px-6 py-4 font-medium">Specialty</th>
                        <th className="px-6 py-4 font-medium">Mentees</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredMentors.map((m: Mentor) => (
                        <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary/10 text-secondary text-xs">{m.avatar}</AvatarFallback></Avatar>
                            <span className="font-semibold text-foreground">{m.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            {editingId === m.id ? (
                              <Input 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)} 
                                className="h-8 w-32 text-xs" 
                              />
                            ) : m.subject}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {m.studentIds.length} students
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="border-primary text-primary bg-primary/5">
                              ACTIVE
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingId === m.id ? (
                              <div className="flex justify-end gap-2">
                                <Button size="icon" variant="ghost" onClick={() => handleSaveEdit('mentor', 'subject')} className="h-8 w-8 text-success hover:text-success hover:bg-success/10"><Check className="h-4 w-4"/></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><X className="h-4 w-4"/></Button>
                              </div>
                            ) : (
                              <Button size="icon" variant="ghost" onClick={() => { setEditingId(m.id); setEditValue(m.subject); }} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
