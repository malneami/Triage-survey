import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Restore the original path after the GitHub Pages 404.html redirect
// (404.html rewrites /Triage-survey/admin -> /Triage-survey/?p=/admin)
(function restoreSpaPath() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get("p");
  if (!p) return;
  const q = params.get("q");
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const restored =
    base +
    p.replace(/~and~/g, "&") +
    (q ? "?" + q.replace(/~and~/g, "&") : "") +
    window.location.hash;
  window.history.replaceState(null, "", restored);
})();

createRoot(document.getElementById("root")!).render(<App />);
