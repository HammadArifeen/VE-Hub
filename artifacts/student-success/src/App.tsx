import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider, useAppState } from "@/hooks/use-app-state";

import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import StudentDashboard from "@/pages/StudentDashboard";
import MentorDashboard from "@/pages/MentorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import StudentOnboarding from "@/pages/StudentOnboarding";
import MentorOnboarding from "@/pages/MentorOnboarding";

const queryClient = new QueryClient();

function Router() {
  const { currentUser, isOnboardingComplete } = useAppState();

  const roleHome = () => {
    if (!currentUser) return "/login";
    if (!isOnboardingComplete(currentUser.id)) return "/onboarding";
    if (currentUser.role === "admin") return "/admin";
    if (currentUser.role === "mentor") return "/mentor";
    return "/student";
  };

  return (
    <Switch>
      <Route path="/">
        <Redirect to={roleHome()} />
      </Route>

      <Route path="/login">
        {currentUser ? <Redirect to={roleHome()} /> : <Login />}
      </Route>

      <Route path="/onboarding">
        {!currentUser ? (
          <Redirect to="/login" />
        ) : isOnboardingComplete(currentUser.id) ? (
          <Redirect to={roleHome()} />
        ) : currentUser.role === "student" ? (
          <StudentOnboarding />
        ) : currentUser.role === "mentor" ? (
          <MentorOnboarding />
        ) : (
          <Redirect to="/admin" />
        )}
      </Route>

      <Route path="/student">
        {!currentUser ? (
          <Redirect to="/login" />
        ) : currentUser.role !== "student" ? (
          <Redirect to={roleHome()} />
        ) : !isOnboardingComplete(currentUser.id) ? (
          <Redirect to="/onboarding" />
        ) : (
          <StudentDashboard />
        )}
      </Route>

      <Route path="/mentor">
        {!currentUser ? (
          <Redirect to="/login" />
        ) : currentUser.role !== "mentor" ? (
          <Redirect to={roleHome()} />
        ) : !isOnboardingComplete(currentUser.id) ? (
          <Redirect to="/onboarding" />
        ) : (
          <MentorDashboard />
        )}
      </Route>

      <Route path="/admin">
        {!currentUser ? (
          <Redirect to="/login" />
        ) : currentUser.role !== "admin" ? (
          <Redirect to={roleHome()} />
        ) : (
          <AdminDashboard />
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}

export default App;
