import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import {
  AUTH_USERS, ALL_ACHIEVEMENTS,
  StudentProfile, MentorProfile, Session, Note, Resource, User, Notification,
  Message, MockExamResult, HomeworkAssignment,
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
  notifications: Notification[];
  messages: Message[];
  mockResults: MockExamResult[];
  homework: HomeworkAssignment[];

  isOnboardingComplete: (userId: string) => boolean;
  completeStudentOnboarding: (data: Omit<StudentProfile, "userId" | "maxXp" | "achievements" | "onboardingComplete"> & { streak?: number; xp?: number }) => void;
  completeMentorOnboarding: (data: Omit<MentorProfile, "userId" | "onboardingComplete">) => void;

  getStudentProfile: (userId: string) => StudentProfile | undefined;
  getMentorProfile: (userId: string) => MentorProfile | undefined;

  updateStudentTargets: (userId: string, targets: { shortTerm: string[]; longTerm: string[] }) => void;
  addNote: (note: Omit<Note, "id">) => void;
  deleteNote: (id: string) => void;
  addSession: (session: Omit<Session, "id">) => void;
  addResource: (resource: Omit<Resource, "id">) => void;
  updateStudentSubjectScore: (userId: string, subjectName: string, current: number) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: (userId: string) => void;
  sendMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  getConversationMessages: (conversationKey: string) => Message[];
  addMockResult: (result: Omit<MockExamResult, "id">) => void;
  addHomework: (hw: Omit<HomeworkAssignment, "id">) => void;
  updateHomeworkStatus: (id: string, status: HomeworkAssignment["status"], grade?: string, feedback?: string) => void;
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
  notifications: "sf_notifications",
  messages: "sf_messages",
  mockResults: "sf_mock_results",
  homework: "sf_homework",
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
    const user = AUTH_USERS.find((u) => u.username === username && u.password === pass);
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
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    load<Notification[]>(STORAGE_KEYS.notifications, [])
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    load<Message[]>(STORAGE_KEYS.messages, [])
  );
  const [mockResults, setMockResults] = useState<MockExamResult[]>(() =>
    load<MockExamResult[]>(STORAGE_KEYS.mockResults, [])
  );
  const [homework, setHomework] = useState<HomeworkAssignment[]>(() =>
    load<HomeworkAssignment[]>(STORAGE_KEYS.homework, [])
  );

  useEffect(() => { save(STORAGE_KEYS.studentProfiles, studentProfiles); }, [studentProfiles]);
  useEffect(() => { save(STORAGE_KEYS.mentorProfiles, mentorProfiles); }, [mentorProfiles]);
  useEffect(() => { save(STORAGE_KEYS.sessions, sessions); }, [sessions]);
  useEffect(() => { save(STORAGE_KEYS.notes, notes); }, [notes]);
  useEffect(() => { save(STORAGE_KEYS.resources, resources); }, [resources]);
  useEffect(() => { save(STORAGE_KEYS.notifications, notifications); }, [notifications]);
  useEffect(() => { save(STORAGE_KEYS.messages, messages); }, [messages]);
  useEffect(() => { save(STORAGE_KEYS.mockResults, mockResults); }, [mockResults]);
  useEffect(() => { save(STORAGE_KEYS.homework, homework); }, [homework]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.sessions) setSessions(load<Session[]>(STORAGE_KEYS.sessions, []));
      if (e.key === STORAGE_KEYS.notifications) setNotifications(load<Notification[]>(STORAGE_KEYS.notifications, []));
      if (e.key === STORAGE_KEYS.notes) setNotes(load<Note[]>(STORAGE_KEYS.notes, []));
      if (e.key === STORAGE_KEYS.resources) setResources(load<Resource[]>(STORAGE_KEYS.resources, []));
      if (e.key === STORAGE_KEYS.messages) setMessages(load<Message[]>(STORAGE_KEYS.messages, []));
      if (e.key === STORAGE_KEYS.mockResults) setMockResults(load<MockExamResult[]>(STORAGE_KEYS.mockResults, []));
      if (e.key === STORAGE_KEYS.homework) setHomework(load<HomeworkAssignment[]>(STORAGE_KEYS.homework, []));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isOnboardingComplete = useCallback(
    (userId: string) => {
      const user = AUTH_USERS.find((u) => u.id === userId);
      if (!user) return false;
      if (user.role === "student") return studentProfiles.some((p) => p.userId === userId && p.onboardingComplete);
      if (user.role === "mentor") return mentorProfiles.some((p) => p.userId === userId && p.onboardingComplete);
      return true;
    },
    [studentProfiles, mentorProfiles]
  );

  const completeStudentOnboarding = (
    data: Omit<StudentProfile, "userId" | "maxXp" | "achievements" | "onboardingComplete"> & { streak?: number; xp?: number }
  ) => {
    if (!currentUser) return;
    const profile: StudentProfile = {
      userId: currentUser.id,
      streak: data.streak ?? 0,
      xp: data.xp ?? 0,
      maxXp: 500,
      achievements: ALL_ACHIEVEMENTS.map((a) => ({ ...a })),
      onboardingComplete: true,
      ...data,
    };
    setStudentProfiles((prev) => [...prev.filter((p) => p.userId !== currentUser.id), profile]);
    toast({ title: "Onboarding complete! Welcome to Voices Empowered" });
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
    setMentorProfiles((prev) => [...prev.filter((p) => p.userId !== currentUser.id), profile]);
    toast({ title: "Onboarding complete! Your mentor dashboard is ready" });
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
    toast({ title: "Targets updated" });
  };

  const addNote = (note: Omit<Note, "id">) => {
    setNotes((prev) => [{ ...note, id: `n${Date.now()}` }, ...prev]);
    toast({ title: "Note saved" });
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

    const mentorProfile = mentorProfiles.find((m) => m.userId === session.mentorId);
    const mentorName = mentorProfile?.displayName
      ?? AUTH_USERS.find((u) => u.id === session.mentorId)?.name
      ?? "Your mentor";

    const notification: Notification = {
      id: `notif${Date.now()}`,
      userId: session.studentId,
      title: "New session booked!",
      message: `${mentorName} has scheduled a "${session.type}" session for ${new Date(session.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.`,
      link: session.googleClassroomLink,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notification, ...prev]);
    toast({ title: "Session scheduled" });
  };

  const addResource = (resource: Omit<Resource, "id">) => {
    setResources((prev) => [{ ...resource, id: `r${Date.now()}` }, ...prev]);
    toast({ title: "Resource added" });
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
    toast({ title: "Score updated" });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = (userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
  };

  const sendMessage = (msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: `msg${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const getConversationMessages = useCallback(
    (conversationKey: string) => messages.filter((m) => m.conversationKey === conversationKey),
    [messages]
  );

  const addMockResult = (result: Omit<MockExamResult, "id">) => {
    setMockResults((prev) => [{ ...result, id: `mock${Date.now()}` }, ...prev]);
    toast({ title: "Mock result recorded" });
  };

  const addHomework = (hw: Omit<HomeworkAssignment, "id">) => {
    setHomework((prev) => [{ ...hw, id: `hw${Date.now()}` }, ...prev]);
    toast({ title: "Homework assigned" });
  };

  const updateHomeworkStatus = (id: string, status: HomeworkAssignment["status"], grade?: string, feedback?: string) => {
    setHomework((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status, grade, feedback } : h))
    );
    toast({ title: status === "graded" ? "Homework graded" : "Homework updated" });
  };

  return (
    <AppStateContext.Provider
      value={{
        theme, toggleTheme,
        currentUser, login, logout,
        studentProfiles, mentorProfiles, sessions, notes, resources, notifications, messages, mockResults, homework,
        isOnboardingComplete, completeStudentOnboarding, completeMentorOnboarding,
        getStudentProfile, getMentorProfile,
        updateStudentTargets, addNote, deleteNote, addSession, addResource,
        updateStudentSubjectScore, markNotificationRead, clearAllNotifications,
        sendMessage, getConversationMessages, addMockResult, addHomework, updateHomeworkStatus,
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
