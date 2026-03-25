# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

### `artifacts/student-success` — Voices Empowered Student Dashboard

A SaaS-style academic dashboard at the root path `/`. Built with React + TypeScript + Tailwind CSS v4.
Branded as "Voices Empowered" with a warm peach/coral/brown colour palette extracted from the VE branding images.

**Features:**
- Login page with Voices Empowered branding and demo credentials for 3 roles
- Role-based routing: student → `/student`, mentor → `/mentor`, admin → `/admin`
- Theme toggle (dark/light) persisted in localStorage
- **Student Dashboard:** Hero with streak/XP, subject progress bars, overall progression bar, mock exam results, homework tracker, achievement badges, 8-week area chart, upcoming sessions, mentor notes with key advice callout
- **Mentor Dashboard:** Full sidebar layout (mobile responsive with hamburger menu & overlay), tabs: Dashboard, Students, Schedule, Grades & Mocks, Homework, Achievements, Messages, Resources. Working chat system (sends/receives messages via localStorage). Student data input: grades, mock exam results, homework assignment tracker with grading workflow.
- **Admin Dashboard:** Stat cards, tabbed mentors/students tables with live search/filter
- **Google Classroom integration:** Session booking requires a Google Classroom link. Students get notified and can join via the link.
- **Cross-tab real-time sync:** window storage events for sessions, notifications, notes, resources, messages, mock results, homework

**Mock credentials:**
- Students: `abduljaleel/student123`, `sarah/student123`, `omar/student123`
- Mentors: `abdelrahman/mentor123`, `fatima/mentor123`
- Admins: `Musab/CEO123`, `Hammad/Admin123`

**Onboarding System:**
- Student onboarding (6 steps): Profile/year group → Subject selection → Current scores + target grades per subject → Mock exam results (optional) → Goals (short+long term) → Complete. Generates 8-week history data from current scores, calculates initial streak/XP from average performance.
- Mentor onboarding (6 steps): Profile/specialty subject → Add students (name + year group) → Add notes about students (with key advice flag) → Schedule initial sessions (optional) → Add resources (title + type) → Complete. Notes and sessions are persisted immediately so dashboard is populated from day one.
- All data persisted to localStorage (keys: sf_student_profiles, sf_mentor_profiles, sf_sessions, sf_notes, sf_resources, sf_theme, sf_user, sf_messages, sf_mock_results, sf_homework, sf_notifications)
- First-time users are gated behind onboarding before they can see their dashboard
- Admin users skip onboarding and go straight to their dashboard

**Design:**
- Colour palette: Warm peach/coral primary (#C06040), soft peach secondary, dark brown text, matching dark mode
- Fonts: Inter (body) + Outfit (headings)
- Glass-card effects, gradient buttons, responsive layout
- Mobile: collapsible sidebar with hamburger menu and overlay

**Dependencies:** recharts, framer-motion, react-confetti, date-fns, clsx, tailwind-merge

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/       # Express API (port 8080)
│   ├── student-success/  # React + Vite frontend (port 23117, path /)
│   └── mockup-sandbox/   # Component preview server
├── packages/
│   └── shared/           # Shared types/utilities
├── pnpm-workspace.yaml
└── replit.md
```
