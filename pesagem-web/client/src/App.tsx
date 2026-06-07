import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CadastroMotorista from "./pages/CadastroMotorista";
import Dashboard from "./pages/Dashboard";
import DashboardRealtime from "./pages/DashboardRealtime";
import PesagemDetalhes from "./pages/PesagemDetalhes";
import Login from "./pages/Login";
import Relatorios from "./pages/Relatorios";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard-realtime" component={() => <ProtectedRoute component={DashboardRealtime} />} />
      <Route path="/pesagem/:id" component={() => <ProtectedRoute component={PesagemDetalhes} />} />
      <Route path="/relatorios" component={() => <ProtectedRoute component={Relatorios} />} />
      <Route path="/cadastro-motorista" component={() => <ProtectedRoute component={CadastroMotorista} />} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
