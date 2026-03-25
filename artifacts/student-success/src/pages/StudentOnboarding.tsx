import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/hooks/use-app-state";
import { ALL_SUBJECTS, YEAR_GROUPS, SubjectScore } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Plus, Trash2, ChevronRight, ChevronLeft, GraduationCap, BookOpen, Target, Star, Sparkles, ClipboardCheck } from "lucide-react";

const STEPS = [
  { label: "Profile", icon: GraduationCap },
  { label: "Subjects", icon: BookOpen },
  { label: "Scores", icon: Target },
  { label: "Mocks", icon: ClipboardCheck },
  { label: "Goals", icon: Star },
  { label: "Done!", icon: Sparkles },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

type MockEntry = { subject: string; score: string; total: string; grade: string; id: string };

export default function StudentOnboarding() {
  const { currentUser, completeStudentOnboarding, addMockResult } = useAppState();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const [displayName, setDisplayName] = useState(currentUser?.name ?? "");
  const [yearGroup, setYearGroup] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectTargets, setSubjectTargets] = useState<Record<string, number>>({});
  const [subjectCurrents, setSubjectCurrents] = useState<Record<string, number>>({});
  const [mockEntries, setMockEntries] = useState<MockEntry[]>([
    { subject: "", score: "", total: "100", grade: "", id: `mock-${Date.now()}` },
  ]);
  const [shortTermGoals, setShortTermGoals] = useState<string[]>(["", ""]);
  const [longTermGoals, setLongTermGoals] = useState<string[]>(["", ""]);

  if (!currentUser) return null;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const generateHistory = (current: number): number[] => {
    if (current === 0) return Array(8).fill(0);
    const history: number[] = [];
    for (let i = 0; i < 8; i++) {
      const variance = Math.floor((i - 3) * (current * 0.02)) + Math.floor(((i * 7 + 3) % 5) * 2 - 4);
      history.push(Math.max(0, Math.min(100, current + variance - Math.floor((7 - i) * 1.5))));
    }
    return history;
  };

  const handleFinish = () => {
    const subjects: SubjectScore[] = selectedSubjects.map((name) => {
      const current = subjectCurrents[name] ?? 0;
      return {
        name,
        current,
        target: subjectTargets[name] ?? 75,
        history: generateHistory(current),
      };
    });

    const avgScore = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.current, 0) / subjects.length) : 0;
    const startingXp = Math.min(450, Math.floor(avgScore * 3.5) + (subjects.length * 15));
    const startingStreak = avgScore > 50 ? Math.min(14, Math.floor(avgScore / 10)) : 0;

    completeStudentOnboarding({
      displayName,
      yearGroup,
      mentorId: "",
      subjects,
      targets: {
        shortTerm: shortTermGoals.filter(Boolean),
        longTerm: longTermGoals.filter(Boolean),
      },
      streak: startingStreak,
      xp: startingXp,
    });

    const filledMocks = mockEntries.filter((m) => m.subject.trim() && m.score.trim());
    filledMocks.forEach((m) => {
      addMockResult({
        studentId: currentUser.id,
        mentorId: "",
        subject: m.subject,
        score: Number(m.score),
        totalMarks: Number(m.total) || 100,
        grade: m.grade,
        date: new Date().toISOString(),
        notes: "",
      });
    });
  };

  const canNext = [
    displayName.trim().length > 0 && yearGroup.length > 0,
    selectedSubjects.length > 0,
    selectedSubjects.every((s) => subjectCurrents[s] !== undefined && subjectTargets[s] !== undefined),
    true,
    shortTermGoals.some(Boolean) || longTermGoals.some(Boolean),
    true,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="text-center mb-8">
          <img src="/ve-logo.png" alt="VE" className="h-14 w-14 mx-auto rounded-2xl object-cover shadow-xl shadow-primary/20 mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Voices Empowered</h1>
          <p className="text-muted-foreground mt-1">Let's personalise your student dashboard</p>
        </div>

        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => i < step && go(i)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                  i === step
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : i < step
                    ? "bg-success/20 text-success cursor-pointer"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-3 sm:w-6 transition-colors ${i < step ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-premium transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-8 min-h-[360px] flex flex-col">
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
                    <p className="text-muted-foreground mb-8">We'll use this to personalise your dashboard</p>
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium block mb-2">Your name</label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter your name"
                          className="text-lg h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Your year group</label>
                        <div className="flex flex-wrap gap-2">
                          {YEAR_GROUPS.map((yg) => (
                            <button
                              key={yg}
                              onClick={() => setYearGroup(yg)}
                              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                                yearGroup === yg
                                  ? "bg-primary text-white border-primary shadow-md"
                                  : "bg-background border-border hover:border-primary/50"
                              }`}
                            >
                              {yg}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">What subjects are you studying?</h2>
                    <p className="text-muted-foreground mb-6">
                      Select all that apply — {selectedSubjects.length} selected
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto pr-1">
                      {ALL_SUBJECTS.map((sub) => {
                        const selected = selectedSubjects.includes(sub);
                        return (
                          <button
                            key={sub}
                            onClick={() => toggleSubject(sub)}
                            className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                              selected
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-background border-border hover:border-primary/40"
                            }`}
                          >
                            {selected && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">Where are you at?</h2>
                    <p className="text-muted-foreground mb-6">
                      Enter your current score and target for each subject
                    </p>
                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                      {selectedSubjects.map((sub) => {
                        const current = subjectCurrents[sub] ?? "";
                        const target = subjectTargets[sub] ?? "";
                        return (
                          <div key={sub} className="p-3 rounded-xl border border-border/50 bg-background/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{sub}</span>
                              {current && target && (
                                <span className="text-xs text-muted-foreground">
                                  {current}% → {target}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Current %</label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={current}
                                  onChange={(e) =>
                                    setSubjectCurrents((prev) => ({
                                      ...prev,
                                      [sub]: Math.min(100, Math.max(0, Number(e.target.value))),
                                    }))
                                  }
                                  placeholder="e.g. 65"
                                  className="h-9 text-sm mt-1"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Target %</label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={target}
                                  onChange={(e) =>
                                    setSubjectTargets((prev) => ({
                                      ...prev,
                                      [sub]: Math.min(100, Math.max(1, Number(e.target.value))),
                                    }))
                                  }
                                  placeholder="e.g. 85"
                                  className="h-9 text-sm mt-1"
                                />
                              </div>
                            </div>
                            {current !== "" && target !== "" && (
                              <Progress value={Number(current)} className="h-1.5 mt-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">Any recent mock exams?</h2>
                    <p className="text-muted-foreground mb-6">
                      Add your recent mock exam results — skip if none
                    </p>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {mockEntries.map((mock, idx) => (
                        <div key={mock.id} className="p-3 rounded-xl border border-border/50 bg-background/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">{idx + 1}.</span>
                            <span className="text-sm font-medium flex-1">Mock Exam</span>
                            {mockEntries.length > 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                                onClick={() => setMockEntries((prev) => prev.filter((m) => m.id !== mock.id))}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-2">
                              <Input
                                value={mock.subject}
                                onChange={(e) => setMockEntries((prev) => prev.map((m) => m.id === mock.id ? { ...m, subject: e.target.value } : m))}
                                placeholder="Subject"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                value={mock.score}
                                onChange={(e) => setMockEntries((prev) => prev.map((m) => m.id === mock.id ? { ...m, score: e.target.value } : m))}
                                placeholder="Score"
                                className="h-8 text-sm"
                                min={0}
                              />
                            </div>
                            <div>
                              <Input
                                value={mock.grade}
                                onChange={(e) => setMockEntries((prev) => prev.map((m) => m.id === mock.id ? { ...m, grade: e.target.value } : m))}
                                placeholder="Grade"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-2 text-xs"
                      onClick={() => setMockEntries((prev) => [...prev, { subject: "", score: "", total: "100", grade: "", id: `mock-${Date.now()}` }])}
                    >
                      <Plus className="w-3 h-3" /> Add mock result
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      You can skip this step if you haven't taken any mocks yet.
                    </p>
                  </div>
                )}

                {step === 4 && (
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1">What are your goals?</h2>
                    <p className="text-muted-foreground mb-6">Set goals to stay motivated and on track</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" /> Short-term goals
                        </h3>
                        <div className="space-y-2">
                          {shortTermGoals.map((g, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={g}
                                onChange={(e) => {
                                  const next = [...shortTermGoals];
                                  next[i] = e.target.value;
                                  setShortTermGoals(next);
                                }}
                                placeholder={`Short-term goal ${i + 1}`}
                                className="text-sm h-9"
                              />
                              {shortTermGoals.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                                  onClick={() => setShortTermGoals((prev) => prev.filter((_, j) => j !== i))}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => setShortTermGoals((prev) => [...prev, ""])}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add goal
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-secondary" /> Long-term goals
                        </h3>
                        <div className="space-y-2">
                          {longTermGoals.map((g, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={g}
                                onChange={(e) => {
                                  const next = [...longTermGoals];
                                  next[i] = e.target.value;
                                  setLongTermGoals(next);
                                }}
                                placeholder={`Long-term goal ${i + 1}`}
                                className="text-sm h-9"
                              />
                              {longTermGoals.length > 1 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                                  onClick={() => setLongTermGoals((prev) => prev.filter((_, j) => j !== i))}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => setLongTermGoals((prev) => [...prev, ""])}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add goal
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-premium flex items-center justify-center shadow-xl shadow-primary/30">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">You're all set, {displayName}!</h2>
                      <p className="text-muted-foreground max-w-md">
                        Your dashboard is personalised and ready. Head to your dashboard to start tracking your academic journey.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      <Badge variant="secondary">{yearGroup}</Badge>
                      {selectedSubjects.slice(0, 4).map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                      {selectedSubjects.length > 4 && (
                        <Badge variant="outline">+{selectedSubjects.length - 4} more</Badge>
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

              {step < 5 ? (
                <Button
                  onClick={() => go(step + 1)}
                  disabled={!canNext[step]}
                  className="bg-gradient-premium text-white gap-2"
                >
                  {step === 3 ? "Skip / Continue" : "Continue"} <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-gradient-premium text-white gap-2 px-8"
                >
                  Go to Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
