import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ProfileSetup from "@/pages/auth/ProfileSetup";
import NotFound from "@/pages/errors/NotFound";
import Unauthorized from "@/pages/errors/Unauthorized";
import Dashboard from "@/pages/dashboard/Dashboard";
import ProjectsList from "@/pages/projects/ProjectsList";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import Team from "@/pages/team/Team";
import Notifications from "@/pages/notifications/Notifications";
import Settings from "@/pages/settings/Settings";
import { AppShell } from "@/layouts/AppShell";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ROUTES } from "@/constants/routes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.landing} element={<Landing />} />
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.register} element={<Register />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPassword />} />
        <Route path={ROUTES.resetPassword} element={<ResetPassword />} />
        <Route
          path={ROUTES.profileSetup}
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.dashboard} element={<Dashboard />} />
          <Route path={ROUTES.projects} element={<ProjectsList />} />
          <Route path="/app/projects/:id" element={<ProjectDetail />} />
          <Route path={ROUTES.team} element={<Team />} />
          <Route path={ROUTES.notifications} element={<Notifications />} />
          <Route path={ROUTES.settings} element={<Settings />} />
        </Route>

        <Route path={ROUTES.unauthorized} element={<Unauthorized />} />
        <Route path={ROUTES.notFound} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
