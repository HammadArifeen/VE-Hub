export type Role = "student" | "mentor" | "admin";

export interface User {
  id: string;
  username: string;
  password: string;
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
  mentorId: string;
  title: string;
  type: "NOTES" | "VIDEO" | "WORKSHEET";
}

export interface StudentProfile {
  userId: string;
  displayName: string;
  yearGroup: string;
  mentorId: string;
  streak: number;
  xp: number;
  maxXp: number;
  subjects: SubjectScore[];
  achievements: Achievement[];
  targets: { shortTerm: string[]; longTerm: string[] };
  onboardingComplete: boolean;
}

export interface MentorProfile {
  userId: string;
  displayName: string;
  subject: string;
  studentNames: { name: string; yearGroup: string; id: string }[];
  onboardingComplete: boolean;
}

export const ALL_SUBJECTS = [
  "Maths", "English Language", "English Literature", "Biology", "Chemistry",
  "Physics", "Combined Science", "History", "Geography", "French",
  "Spanish", "German", "Art & Design", "Music", "Drama", "Religious Studies",
  "Computer Science", "Business Studies", "Economics", "Psychology",
  "Sociology", "Physical Education", "Design & Technology", "Media Studies",
];

export const YEAR_GROUPS = [
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11",
  "Year 12", "Year 13", "Other",
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "7-Day Streak", icon: "🔥", unlocked: false },
  { id: "a2", title: "Essay Master", icon: "📚", unlocked: false },
  { id: "a3", title: "Quick Learner", icon: "⚡", unlocked: false },
  { id: "a4", title: "Top Performer", icon: "🏆", unlocked: false },
  { id: "a5", title: "Goal Crusher", icon: "🎯", unlocked: false },
];

export const AUTH_USERS: User[] = [
  { id: "s1", username: "abduljaleel", password: "student123", name: "Abduljaleel", role: "student", avatar: "AB" },
  { id: "s2", username: "sarah",       password: "student123", name: "Sarah",       role: "student", avatar: "SA" },
  { id: "s3", username: "omar",        password: "student123", name: "Omar",        role: "student", avatar: "OM" },
  { id: "m1", username: "abdelrahman", password: "mentor123",  name: "Abdelrahman", role: "mentor",  avatar: "AR" },
  { id: "m2", username: "fatima",      password: "mentor123",  name: "Fatima",      role: "mentor",  avatar: "FA" },
  { id: "admin1", username: "Musab",   password: "CEO123",     name: "Musab",       role: "admin",   avatar: "MU" },
  { id: "admin2", username: "Hammad",  password: "Admin123",   name: "Hammad",      role: "admin",   avatar: "HA" },
];
