import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  MOCK_STUDENTS, MOCK_MENTORS, MOCK_ADMINS, MOCK_SESSIONS, MOCK_NOTES, MOCK_RESOURCES,
  Student, Mentor, Session, Note, Resource, User
} from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

interface AppStateContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User | null;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  
  // Data
  students: Student[];
  mentors: Mentor[];
  sessions: Session[];
  notes: Note[];
  resources: Resource[];
  
  // Actions
  updateStudentTargets: (id: string, targets: any) => void;
  addNote: (note: Omit<Note, "id">) => void;
  deleteNote: (id: string) => void;
  addSession: (session: Omit<Session, "id">) => void;
  updateUserStatus: (id: string, type: 'student' | 'mentor', updates: any) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem("theme") as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, pass: string) => {
    // Simple mock validation based on requested credentials
    let user = null;
    if (pass === "student123") user = MOCK_STUDENTS.find(s => s.username === username);
    if (pass === "mentor123") user = MOCK_MENTORS.find(m => m.username === username);
    if (pass === "CEO123" || pass === "Admin123") user = MOCK_ADMINS.find(a => a.username === username);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  // Mock Data States
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [mentors, setMentors] = useState<Mentor[]>(MOCK_MENTORS);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);

  // Actions
  const updateStudentTargets = (id: string, targets: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, targets } : s));
    toast({ title: "Targets updated successfully", variant: "default" });
  };

  const addNote = (note: Omit<Note, "id">) => {
    const newNote = { ...note, id: `n${Date.now()}` };
    setNotes(prev => [newNote, ...prev]);
    toast({ title: "Note added", variant: "default" });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    toast({ title: "Note removed", variant: "default" });
  };

  const addSession = (session: Omit<Session, "id">) => {
    const newSession = { ...session, id: `ses${Date.now()}` };
    setSessions(prev => [...prev, newSession].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    toast({ title: "Session scheduled", variant: "default" });
  };

  const updateUserStatus = (id: string, type: 'student' | 'mentor', updates: any) => {
    if (type === 'student') {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } else {
      setMentors(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }
    toast({ title: "User updated", variant: "default" });
  };

  return (
    <AppStateContext.Provider value={{
      theme, toggleTheme,
      currentUser, login, logout,
      students, mentors, sessions, notes, resources,
      updateStudentTargets, addNote, deleteNote, addSession, updateUserStatus
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) throw new Error("useAppState must be used within a AppStateProvider");
  return context;
}
