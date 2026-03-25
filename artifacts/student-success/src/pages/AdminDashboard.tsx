import { useState } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { AUTH_USERS } from "@/lib/mock-data";
import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, GraduationCap, Link as LinkIcon, CalendarDays } from "lucide-react";

const ALL_STUDENTS = AUTH_USERS.filter((u) => u.role === "student");
const ALL_MENTORS = AUTH_USERS.filter((u) => u.role === "mentor");

export default function AdminDashboard() {
  const { currentUser, studentProfiles, mentorProfiles, sessions, isOnboardingComplete } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");

  if (!currentUser || currentUser.role !== "admin") return null;

  const completedStudents = ALL_STUDENTS.filter((s) => isOnboardingComplete(s.id));
  const completedMentors = ALL_MENTORS.filter((m) => isOnboardingComplete(m.id));
  const onboardingRate = ALL_STUDENTS.length > 0
    ? Math.round((completedStudents.length / ALL_STUDENTS.length) * 100)
    : 0;

  const filteredStudents = ALL_STUDENTS.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMentors = ALL_MENTORS.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <TopNav title="Voices Empowered Admin" />

      <main className="container mx-auto px-4 sm:px-8 mt-8 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Students</p>
                <h3 className="text-3xl font-bold font-display">{ALL_STUDENTS.length}</h3>
                <p className="text-xs text-muted-foreground">{completedStudents.length} onboarded</p>
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
                <h3 className="text-3xl font-bold font-display">{ALL_MENTORS.length}</h3>
                <p className="text-xs text-muted-foreground">{completedMentors.length} onboarded</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Sessions</p>
                <h3 className="text-3xl font-bold font-display">{sessions.length}</h3>
                <p className="text-xs text-muted-foreground">{sessions.filter((s) => s.status === "upcoming").length} upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Onboarding Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold font-display">{onboardingRate}%</h3>
                  <span className="text-sm text-success">{completedStudents.length} done</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Directory */}
        <Card className="glass-card border-border/50">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-display">User Directory</CardTitle>
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
                  <TabsTrigger value="students">Students ({ALL_STUDENTS.length})</TabsTrigger>
                  <TabsTrigger value="mentors">Mentors ({ALL_MENTORS.length})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="students" className="m-0 mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Student</th>
                        <th className="px-6 py-4 font-medium">Year Group</th>
                        <th className="px-6 py-4 font-medium">Subjects</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredStudents.map((s) => {
                        const profile = studentProfiles.find((p) => p.userId === s.id);
                        const onboarded = !!profile?.onboardingComplete;
                        return (
                          <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{s.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-semibold text-foreground">{profile?.displayName ?? s.name}</span>
                                  <p className="text-xs text-muted-foreground">@{s.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {profile?.yearGroup ?? "—"}
                            </td>
                            <td className="px-6 py-4">
                              {profile && profile.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {profile.subjects.slice(0, 3).map((sub) => (
                                    <Badge key={sub.name} variant="outline" className="text-xs">{sub.name}</Badge>
                                  ))}
                                  {profile.subjects.length > 3 && (
                                    <Badge variant="outline" className="text-xs">+{profile.subjects.length - 3}</Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={onboarded ? "border-success text-success bg-success/5" : "border-warning text-warning bg-warning/5"}>
                                {onboarded ? "ONBOARDED" : "PENDING"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="mentors" className="m-0 mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Mentor</th>
                        <th className="px-6 py-4 font-medium">Specialty</th>
                        <th className="px-6 py-4 font-medium">Mentees</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredMentors.map((m) => {
                        const profile = mentorProfiles.find((p) => p.userId === m.id);
                        const onboarded = !!profile?.onboardingComplete;
                        return (
                          <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-secondary/10 text-secondary text-xs">{m.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-semibold text-foreground">{profile?.displayName ?? m.name}</span>
                                  <p className="text-xs text-muted-foreground">@{m.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {profile?.subject ?? "—"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {profile ? `${profile.studentNames.length} student${profile.studentNames.length !== 1 ? "s" : ""}` : "—"}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={onboarded ? "border-primary text-primary bg-primary/5" : "border-warning text-warning bg-warning/5"}>
                                {onboarded ? "ACTIVE" : "PENDING"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
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
