import { HashRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/HomePage";
import ListDetailPage from "./pages/ListDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ShareImportPage from "./pages/ShareImportPage";

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/list/:id" element={<ListDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/import" element={<ShareImportPage />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
