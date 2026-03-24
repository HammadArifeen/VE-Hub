import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import {
  AUTH_USERS, ALL_ACHIEVEMENTS,
  StudentProfile, MentorProfile, Session, Note, Resource, User,
} from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

interface AppStateContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  currentUser: User | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;

  studentProfiles: StudentProfile[];
  mentorProfiles: MentorProfile[];
  sessions: Session[];
  notes: Note[];
  resources: Resource[];

  isOnboardingComplete: (userId: string) => boolean;
  completeStudentOnboarding: (data: Omit<StudentProfile, "userId" | "streak" | "xp" | "maxXp" | "achievements" | "onboardingComplete">) => void;
  completeMentorOnboarding: (data: Omit<MentorProfile, "userId" | "onboardingComplete">) => void;

  getStudentProfile: (userId: string) => StudentProfile | undefined;
  getMentorProfile: (userId: string) => MentorProfile | undefined;

  updateStudentTargets: (userId: string, targets: { shortTerm: string[]; longTerm: string[] }) => void;
  addNote: (note: Omit<Note, "id">) => void;
  deleteNote: (id: string) => void;
  addSession: (session: Omit<Session, "id">) => void;
  addResource: (resource: Omit<Resource, "id">) => void;
  updateStudentSubjectScore: (userId: string, subjectName: string, current: number) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  theme: "sf_theme",
  user: "sf_user",
  studentProfiles: "sf_student_profiles",
  mentorProfiles: "sf_mentor_profiles",
  sessions: "sf_sessions",
  notes: "sf_notes",
  resources: "sf_resources",
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    load<"light" | "dark">(STORAGE_KEYS.theme, "dark")
  );

  useEffect(() => {
    save(STORAGE_KEYS.theme, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    load<User | null>(STORAGE_KEYS.user, null)
  );

  const login = (username: string, pass: string): boolean => {
    const user = AUTH_USERS.find(
      (u) => u.username === username && u.password === pass
    );
    if (user) {
      setCurrentUser(user);
      save(STORAGE_KEYS.user, user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.user);
  };

  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>(() =>
    load<StudentProfile[]>(STORAGE_KEYS.studentProfiles, [])
  );
  const [mentorProfiles, setMentorProfiles] = useState<MentorProfile[]>(() =>
    load<MentorProfile[]>(STORAGE_KEYS.mentorProfiles, [])
  );
  const [sessions, setSessions] = useState<Session[]>(() =>
    load<Session[]>(STORAGE_KEYS.sessions, [])
  );
  const [notes, setNotes] = useState<Note[]>(() =>
    load<Note[]>(STORAGE_KEYS.notes, [])
  );
  const [resources, setResources] = useState<Resource[]>(() =>
    load<Resource[]>(STORAGE_KEYS.resources, [])
  );

  useEffect(() => { save(STORAGE_KEYS.studentProfiles, studentProfiles); }, [studentProfiles]);
  useEffect(() => { save(STORAGE_KEYS.mentorProfiles, mentorProfiles); }, [mentorProfiles]);
  useEffect(() => { save(STORAGE_KEYS.sessions, sessions); }, [sessions]);
  useEffect(() => { save(STORAGE_KEYS.notes, notes); }, [notes]);
  useEffect(() => { save(STORAGE_KEYS.resources, resources); }, [resources]);

  const isOnboardingComplete = useCallback(
    (userId: string) => {
      const user = AUTH_USERS.find((u) => u.id === userId);
      if (!user) return false;
      if (user.role === "student") {
        return studentProfiles.some((p) => p.userId === userId && p.onboardingComplete);
      }
      if (user.role === "mentor") {
        return mentorProfiles.some((p) => p.userId === userId && p.onboardingComplete);
      }
      return true; // admins skip onboarding
    },
    [studentProfiles, mentorProfiles]
  );

  const completeStudentOnboarding = (
    data: Omit<StudentProfile, "userId" | "streak" | "xp" | "maxXp" | "achievements" | "onboardingComplete">
  ) => {
    if (!currentUser) return;
    const profile: StudentProfile = {
      userId: currentUser.id,
      streak: 0,
      xp: 0,
      maxXp: 500,
      achievements: ALL_ACHIEVEMENTS.map((a) => ({ ...a })),
      onboardingComplete: true,
      ...data,
    };
    setStudentProfiles((prev) => {
      const existing = prev.filter((p) => p.userId !== currentUser.id);
      return [...existing, profile];
    });
    toast({ title: "Onboarding complete! Welcome to SuccessFlow 🎉" });
  };

  const completeMentorOnboarding = (
    data: Omit<MentorProfile, "userId" | "onboardingComplete">
  ) => {
    if (!currentUser) return;
    const profile: MentorProfile = {
      userId: currentUser.id,
      onboardingComplete: true,
      ...data,
    };
    setMentorProfiles((prev) => {
      const existing = prev.filter((p) => p.userId !== currentUser.id);
      return [...existing, profile];
    });
    toast({ title: "Onboarding complete! Your mentor dashboard is ready 🎉" });
  };

  const getStudentProfile = (userId: string) =>
    studentProfiles.find((p) => p.userId === userId);

  const getMentorProfile = (userId: string) =>
    mentorProfiles.find((p) => p.userId === userId);

  const updateStudentTargets = (
    userId: string,
    targets: { shortTerm: string[]; longTerm: string[] }
  ) => {
    setStudentProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, targets } : p))
    );
    toast({ title: "Targets updated ✅" });
  };

  const addNote = (note: Omit<Note, "id">) => {
    const newNote: Note = { ...note, id: `n${Date.now()}` };
    setNotes((prev) => [newNote, ...prev]);
    toast({ title: "Note saved ✅" });
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "Note removed" });
  };

  const addSession = (session: Omit<Session, "id">) => {
    const newSession: Session = { ...session, id: `ses${Date.now()}` };
    setSessions((prev) =>
      [...prev, newSession].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
    toast({ title: "Session scheduled ✅" });
  };

  const addResource = (resource: Omit<Resource, "id">) => {
    const newResource: Resource = { ...resource, id: `r${Date.now()}` };
    setResources((prev) => [newResource, ...prev]);
    toast({ title: "Resource added ✅" });
  };

  const updateStudentSubjectScore = (userId: string, subjectName: string, current: number) => {
    setStudentProfiles((prev) =>
      prev.map((p) => {
        if (p.userId !== userId) return p;
        return {
          ...p,
          subjects: p.subjects.map((s) =>
            s.name === subjectName
              ? { ...s, current, history: [...s.history.slice(1), current] }
              : s
          ),
        };
      })
    );
    toast({ title: "Score updated ✅" });
  };

  return (
    <AppStateContext.Provider
      value={{
        theme, toggleTheme,
        currentUser, login, logout,
        studentProfiles, mentorProfiles, sessions, notes, resources,
        isOnboardingComplete, completeStudentOnboarding, completeMentorOnboarding,
        getStudentProfile, getMentorProfile,
        updateStudentTargets, addNote, deleteNote, addSession, addResource,
        updateStudentSubjectScore,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
