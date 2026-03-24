import { useState } from "react";
import { useAppState } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, theme, toggleTheme } = useAppState();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    } else {
      toast({ title: "Login failed", description: "Invalid username or password.", variant: "destructive" });
    }
  };

  const autofill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background blur blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 rounded-full"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-4 z-10"
      >
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-premium flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
            <span className="text-white font-display font-bold text-4xl">S</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">SuccessFlow</h1>
          <p className="text-muted-foreground mt-2">Your premium academic companion</p>
        </div>

        <Card className="glass-card border-white/10 dark:border-white/5">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-white/10 focus:border-primary/50" 
                  placeholder="e.g. abduljaleel" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-white/10 focus:border-primary/50" 
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-premium hover:opacity-90 transition-opacity border-0 shadow-lg shadow-primary/25">
                Sign In
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-semibold mb-3 text-center uppercase tracking-wider">Demo Credentials</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => autofill('abduljaleel', 'student123')} className="text-xs">
                  Student (Abduljaleel)
                </Button>
                <Button variant="outline" size="sm" onClick={() => autofill('abdelrahman', 'mentor123')} className="text-xs">
                  Mentor (Abdelrahman)
                </Button>
                <Button variant="outline" size="sm" onClick={() => autofill('Musab', 'CEO123')} className="text-xs">
                  Admin (Musab)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
