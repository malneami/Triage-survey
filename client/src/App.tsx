import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import QRPage from "./pages/QRPage";
import AdminPage from "./pages/AdminPage";

// Base path comes from Vite config: "/Triage-survey" on GitHub Pages, "" in dev
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <WouterRouter base={BASE_PATH}>
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/qr"} component={QRPage} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
