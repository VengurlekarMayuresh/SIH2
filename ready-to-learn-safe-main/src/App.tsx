import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardTest from "./pages/Dashboard-test";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import DisasterModules from "./pages/DisasterModules";
import DisasterDetail from "./pages/DisasterDetail";
import Quiz from "./pages/Quiz";
import QuizOverview from "./pages/QuizOverview";
import InteractiveQuiz from "./pages/InteractiveQuiz";
import Resources from "./pages/Resources";
import Progress from "./pages/Progress";
import Leaderboard from "./pages/Leaderboard";
import BadgeCollection from "./pages/BadgeCollection";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="safeed-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/institution" element={<InstitutionDashboard />} />
              <Route path="/modules" element={<DisasterModules />} />
              <Route path="/modules/:id" element={<DisasterDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz/:quizId/overview" element={<QuizOverview />} />
              <Route path="/quiz/:quizId" element={<InteractiveQuiz />} />
              <Route path="/quiz/:quizId/attempt/:attemptId" element={<InteractiveQuiz />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/badges" element={<BadgeCollection />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
