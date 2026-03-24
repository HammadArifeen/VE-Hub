import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider, useAppState } from "@/hooks/use-app-state";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import StudentDashboard from "@/pages/StudentDashboard";
import MentorDashboard from "@/pages/MentorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient();

// Route wrapper to handle basic auth checks
const ProtectedRoute = ({ component: Component, role }: { component: any, role: string }) => {
  const { currentUser } = useAppState();
  
  if (!currentUser) return <Redirect to="/login" />;
  if (currentUser.role !== role) {
    if (currentUser.role === 'admin') return <Redirect to="/admin" />;
    if (currentUser.role === 'mentor') return <Redirect to="/mentor" />;
    return <Redirect to="/student" />;
  }
  
  return <Component />;
};

function Router() {
  const { currentUser } = useAppState();

  return (
    <Switch>
      <Route path="/">
        {currentUser ? (
          currentUser.role === 'admin' ? <Redirect to="/admin" /> :
          currentUser.role === 'mentor' ? <Redirect to="/mentor" /> :
          <Redirect to="/student" />
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/student">
        <ProtectedRoute component={StudentDashboard} role="student" />
      </Route>
      <Route path="/mentor">
        <ProtectedRoute component={MentorDashboard} role="mentor" />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} role="admin" />
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
