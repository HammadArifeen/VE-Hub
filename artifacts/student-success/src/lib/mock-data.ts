import { addDays, subDays, subWeeks, format } from "date-fns";

export type Role = "student" | "mentor" | "admin";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface SubjectScore {
  name: string;
  current: number;
  target: number;
  history: number[];
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export interface Session {
  id: string;
  studentId: string;
  mentorId: string;
  date: string;
  type: string;
  status: "upcoming" | "completed";
}

export interface Note {
  id: string;
  studentId: string;
  mentorId: string;
  date: string;
  text: string;
  subject: string;
  isKeyAdvice: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: "NOTES" | "VIDEO" | "WORKSHEET";
}

export interface Student extends User {
  role: "student";
  yearGroup: string;
  mentorId: string;
  streak: number;
  xp: number;
  maxXp: number;
  subjects: SubjectScore[];
  achievements: Achievement[];
  targets: { shortTerm: string[]; longTerm: string[] };
}

export interface Mentor extends User {
  role: "mentor";
  subject: string;
  studentIds: string[];
}

// Generate some history data
const generateHistory = (base: number, trend: 'up' | 'down' | 'flat') => {
  return Array.from({ length: 8 }).map((_, i) => {
    let val = base;
    if (trend === 'up') val = base - (7 - i) * 2 + Math.floor(Math.random() * 5);
    if (trend === 'down') val = base + (7 - i) * 2 - Math.floor(Math.random() * 5);
    if (trend === 'flat') val = base + Math.floor(Math.random() * 6) - 3;
    return Math.min(100, Math.max(0, val));
  });
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: "s1",
    username: "abduljaleel",
    name: "Abduljaleel",
    role: "student",
    avatar: "AB",
    yearGroup: "Year 11",
    mentorId: "m1",
    streak: 7,
    xp: 340,
    maxXp: 500,
    targets: {
      shortTerm: ["Complete Math past paper", "Revise Physics chapter 4"],
      longTerm: ["Achieve 9 in GCSE Math", "Get into top Sixth Form"]
    },
    subjects: [
      { name: "Maths", current: 78, target: 85, history: generateHistory(78, 'up') },
      { name: "English", current: 72, target: 80, history: generateHistory(72, 'flat') },
      { name: "Science", current: 65, target: 75, history: generateHistory(65, 'down') },
      { name: "History", current: 80, target: 90, history: generateHistory(80, 'up') },
      { name: "Art", current: 88, target: 90, history: generateHistory(88, 'flat') },
    ],
    achievements: [
      { id: "a1", title: "7-Day Streak", icon: "🔥", unlocked: true },
      { id: "a2", title: "Essay Master", icon: "📚", unlocked: true },
      { id: "a3", title: "Quick Learner", icon: "⚡", unlocked: true },
      { id: "a4", title: "Top Performer", icon: "🏆", unlocked: false },
      { id: "a5", title: "Goal Crusher", icon: "🎯", unlocked: false },
    ]
  },
  {
    id: "s2",
    username: "sarah",
    name: "Sarah",
    role: "student",
    avatar: "SA",
    yearGroup: "Year 10",
    mentorId: "m2",
    streak: 3,
    xp: 220,
    maxXp: 500,
    targets: {
      shortTerm: ["Read 3 chapters of English text", "Practice French vocab"],
      longTerm: ["Improve overall average to 80%"]
    },
    subjects: [
      { name: "Maths", current: 70, target: 80, history: generateHistory(70, 'flat') },
      { name: "English", current: 82, target: 85, history: generateHistory(82, 'up') },
      { name: "Science", current: 55, target: 70, history: generateHistory(55, 'down') },
      { name: "History", current: 68, target: 75, history: generateHistory(68, 'up') },
      { name: "French", current: 75, target: 80, history: generateHistory(75, 'flat') },
    ],
    achievements: [
      { id: "a1", title: "7-Day Streak", icon: "🔥", unlocked: false },
      { id: "a2", title: "Essay Master", icon: "📚", unlocked: true },
      { id: "a3", title: "Quick Learner", icon: "⚡", unlocked: false },
      { id: "a4", title: "Top Performer", icon: "🏆", unlocked: false },
      { id: "a5", title: "Goal Crusher", icon: "🎯", unlocked: false },
    ]
  },
  {
    id: "s3",
    username: "omar",
    name: "Omar",
    role: "student",
    avatar: "OM",
    yearGroup: "Year 12",
    mentorId: "m1",
    streak: 12,
    xp: 480,
    maxXp: 500,
    targets: {
      shortTerm: ["A-Level CS project setup", "Physics mechanics test prep"],
      longTerm: ["Acceptance to Imperial College"]
    },
    subjects: [
      { name: "Maths", current: 90, target: 95, history: generateHistory(90, 'up') },
      { name: "Physics", current: 85, target: 90, history: generateHistory(85, 'up') },
      { name: "Chemistry", current: 82, target: 85, history: generateHistory(82, 'up') },
      { name: "English", current: 75, target: 80, history: generateHistory(75, 'flat') },
      { name: "CS", current: 95, target: 95, history: generateHistory(95, 'flat') },
    ],
    achievements: [
      { id: "a1", title: "7-Day Streak", icon: "🔥", unlocked: true },
      { id: "a2", title: "Essay Master", icon: "📚", unlocked: true },
      { id: "a3", title: "Quick Learner", icon: "⚡", unlocked: true },
      { id: "a4", title: "Top Performer", icon: "🏆", unlocked: true },
      { id: "a5", title: "Goal Crusher", icon: "🎯", unlocked: true },
    ]
  }
];

export const MOCK_MENTORS: Mentor[] = [
  { id: "m1", username: "abdelrahman", name: "Abdelrahman", role: "mentor", avatar: "AR", subject: "Mathematics", studentIds: ["s1", "s3"] },
  { id: "m2", username: "fatima", name: "Fatima", role: "mentor", avatar: "FA", subject: "English", studentIds: ["s2"] },
];

export const MOCK_ADMINS: User[] = [
  { id: "admin1", username: "Musab", name: "Musab", role: "admin", avatar: "MU" },
  { id: "admin2", username: "Hammad", name: "Hammad", role: "admin", avatar: "HA" },
];

const today = new Date();

export const MOCK_SESSIONS: Session[] = [
  { id: "ses1", studentId: "s1", mentorId: "m1", date: format(addDays(today, 2), "yyyy-MM-dd'T'14:00:00"), type: "One-on-one", status: "upcoming" },
  { id: "ses2", studentId: "s1", mentorId: "m1", date: format(addDays(today, 5), "yyyy-MM-dd'T'16:00:00"), type: "Mock Exam Review", status: "upcoming" },
  { id: "ses3", studentId: "s2", mentorId: "m2", date: format(addDays(today, 1), "yyyy-MM-dd'T'10:00:00"), type: "Group Study", status: "upcoming" },
  { id: "ses4", studentId: "s3", mentorId: "m1", date: format(addDays(today, 3), "yyyy-MM-dd'T'15:30:00"), type: "One-on-one", status: "upcoming" },
];

export const MOCK_NOTES: Note[] = [
  { id: "n1", studentId: "s1", mentorId: "m1", date: format(subDays(today, 2), "yyyy-MM-dd"), text: "Great improvement in Algebra. Needs more focus on Geometry word problems.", subject: "Maths", isKeyAdvice: false },
  { id: "n2", studentId: "s1", mentorId: "m1", date: format(subDays(today, 5), "yyyy-MM-dd"), text: "Remember to show all working out steps to guarantee method marks even if the final answer is wrong.", subject: "Maths", isKeyAdvice: true },
  { id: "n3", studentId: "s2", mentorId: "m2", date: format(subDays(today, 1), "yyyy-MM-dd"), text: "Excellent essay structure. Work on expanding vocabulary for descriptive sections.", subject: "English", isKeyAdvice: true },
  { id: "n4", studentId: "s3", mentorId: "m1", date: format(subDays(today, 4), "yyyy-MM-dd"), text: "Consistent top performance. Ready to move onto advanced calculus topics.", subject: "Maths", isKeyAdvice: false },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: "r1", title: "Algebra Advanced Formulas", type: "NOTES" },
  { id: "r2", title: "Cell Biology Recap", type: "VIDEO" },
  { id: "r3", title: "Trigonometry Practice 1", type: "WORKSHEET" },
  { id: "r4", title: "Essay Writing Framework", type: "NOTES" },
  { id: "r5", title: "Physics Kinematics Simulation", type: "VIDEO" },
];

export const USERS = [...MOCK_STUDENTS, ...MOCK_MENTORS, ...MOCK_ADMINS];
