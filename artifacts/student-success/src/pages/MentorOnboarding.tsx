import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/hooks/use-app-state";
import { ALL_SUBJECTS, Resource } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, Plus, Trash2, ChevronRight, ChevronLeft,
  User, Users, Folder, Sparkles, FileText, Video, ClipboardList
} from "lucide-react";

const STEPS = [
  { label: "Profile", icon: User },
  { label: "Students", icon: Users },
  { label: "Resources", icon: Folder },
  { label: "Done!", icon: Sparkles },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const YEAR_GROUPS_SHORT = ["Year 7","Year 8","Year 9","Year 10","Year 11","Year 12","Year 13","Other"];

type StudentEntry = { name: string; yearGroup: string; id: string };
type ResourceEntry = { title: string; type: "NOTES" | "VIDEO" | "WORKSHEET"; id: string };

const TYPE_META: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  NOTES:     { icon: FileText,     color: "text-primary border-primary/30 bg-primary/5" },
  VIDEO:     { icon: Video,        color: "text-secondary border-secondary/30 bg-secondary/5" },
  WORKSHEET: { icon: ClipboardList, color: "text-success border-success/30 bg-success/5" },
};

export default function MentorOnboarding() {
  const { currentUser, completeMentorOnboarding, addResource } = useAppState();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const [displayName, setDisplayName] = useState(currentUser?.name ?? "");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState<StudentEntry[]>([
    { name: "", yearGroup: "", id: `st-${Date.now()}` },
  ]);
  const [resourceList, setResourceList] = useState<ResourceEntry[]>([
    { title: "", type: "NOTES", id: `r-${Date.now()}` },
  ]);

  if (!currentUser) return null;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const addStudent = () =>
    setStudents((prev) => [...prev, { name: "", yearGroup: "", id: `st-${Date.now()}` }]);
  const removeStudent = (id: string) =>
    setStudents((prev) => prev.filter((s) => s.id !== id));
  const updateStudent = (id: string, field: keyof StudentEntry, value: string) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));

  const addRes = () =>
    setResourceList((prev) => [...prev, { title: "", type: "NOTES", id: `r-${Date.now()}` }]);
  const removeRes = (id: string) =>
    setResourceList((prev) => prev.filter((r) => r.id !== id));
  const updateRes = (id: string, field: keyof ResourceEntry, value: string) =>
    setResourceList((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value as any } : r)));

  const handleFinish = () => {
    const filledStudents = students.filter((s) => s.name.trim());
    const filledResources = resourceList.filter((r) => r.title.trim());

    completeMentorOnboarding({
      displayName,
      subject,
      studentNames: filledStudents,
    });

    filledResources.forEach((r) => {
      addResource({ title: r.title, type: r.type, mentorId: currentUser.id });
    });
  };

  const canNext = [
    displayName.trim().length > 0 && subject.length > 0,
    students.some((s) => s.name.trim()),
    true,
    true,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-premium flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Setup</h1>
          <p className="text-muted-foreground mt-1">Let's configure your mentor dashboard</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => i < step && go(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step
                    ? "bg-secondary text-white shadow-md"
                    : i < step
                    ? "bg-success/20 text-success cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                {s.label}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 transition-colors ${i < step ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-8 min-h-[360px] flex flex-col">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                {step === 0 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">Tell us about yourself</h2>
                    <p className="text-muted-foreground mb-8">This will appear on your mentor profile</p>
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium block mb-2">Your name</label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your full name"
                          className="text-lg h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Your specialist subject</label>
                        <div className="flex flex-wrap gap-2">
                          {ALL_SUBJECTS.map((sub) => (
                            <button
                              key={sub}
                              onClick={() => setSubject(sub)}
                              className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                                subject === sub
                                  ? "bg-secondary text-white border-secondary shadow-md"
                                  : "bg-background border-border hover:border-secondary/50"
                              }`}
                            >
                              {subject === sub && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">Who are you mentoring?</h2>
                    <p className="text-muted-foreground mb-6">
                      Add your students — you can always edit this later
                    </p>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {students.map((student, idx) => (
                        <div key={student.id} className="flex gap-2 items-start">
                          <div className="w-7 h-9 flex items-center justify-center text-sm font-semibold text-muted-foreground">
                            {idx + 1}.
                          </div>
                          <Input
                            value={student.name}
                            onChange={(e) => updateStudent(student.id, "name", e.target.value)}
                            placeholder="Student name"
                            className="flex-1 h-9 text-sm"
                          />
                          <Select
                            value={student.yearGroup}
                            onValueChange={(v) => updateStudent(student.id, "yearGroup", v)}
                          >
                            <SelectTrigger className="w-28 h-9 text-xs">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {YEAR_GROUPS_SHORT.map((yg) => (
                                <SelectItem key={yg} value={yg}>{yg}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {students.length > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                              onClick={() => removeStudent(student.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-2 text-xs"
                      onClick={addStudent}
                    >
                      <Plus className="w-3 h-3" /> Add student
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">Add resources for your students</h2>
                    <p className="text-muted-foreground mb-6">
                      Upload study materials to share — optional, add more later
                    </p>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                      {resourceList.map((res, idx) => (
                        <div key={res.id} className="flex gap-2 items-center">
                          <div className="w-7 flex items-center justify-center text-sm font-semibold text-muted-foreground">
                            {idx + 1}.
                          </div>
                          <Input
                            value={res.title}
                            onChange={(e) => updateRes(res.id, "title", e.target.value)}
                            placeholder="Resource title"
                            className="flex-1 h-9 text-sm"
                          />
                          <Select
                            value={res.type}
                            onValueChange={(v) => updateRes(res.id, "type", v)}
                          >
                            <SelectTrigger className="w-32 h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NOTES">📄 Notes</SelectItem>
                              <SelectItem value="VIDEO">🎬 Video</SelectItem>
                              <SelectItem value="WORKSHEET">📋 Worksheet</SelectItem>
                            </SelectContent>
                          </Select>
                          {resourceList.length > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                              onClick={() => removeRes(res.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-2 text-xs"
                      onClick={addRes}
                    >
                      <Plus className="w-3 h-3" /> Add resource
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      You can skip this step and add resources from your dashboard.
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-xl">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">All done, {displayName}! 🎉</h2>
                      <p className="text-muted-foreground max-w-md">
                        Your mentor dashboard is ready. You can start tracking your students' progress right away.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Badge className="bg-secondary/10 text-secondary border-secondary/30">{subject}</Badge>
                      {students.filter((s) => s.name.trim()).slice(0, 3).map((s) => (
                        <Badge key={s.id} variant="outline">{s.name}</Badge>
                      ))}
                      {students.filter((s) => s.name.trim()).length > 3 && (
                        <Badge variant="outline">+{students.filter((s) => s.name.trim()).length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => go(step - 1)}
                disabled={step === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={() => go(step + 1)}
                  disabled={!canNext[step]}
                  className="bg-gradient-to-r from-secondary to-primary text-white gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-gradient-to-r from-secondary to-primary text-white gap-2 px-8"
                >
                  Launch Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
