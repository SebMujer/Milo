import { Routes, Route } from "react-router-dom";
import { AuthPage } from "@/components/auth-page";
import { AppShell } from "@/components/app-shell";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <AppShell>
            <DashboardSkeleton />
          </AppShell>
        }
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;
