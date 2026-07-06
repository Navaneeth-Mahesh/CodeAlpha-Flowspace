import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProjectsProvider } from "@/providers/ProjectsProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ProjectsProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </ProjectsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
