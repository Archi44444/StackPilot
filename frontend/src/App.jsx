import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Documents } from './pages/Documents.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Prompts } from './pages/Prompts.jsx';
import { Register } from './pages/Register.jsx';
import { Settings } from './pages/Settings.jsx';
import { useAuth } from './hooks/useAuth.js';
import { getSettings } from './services/settingsService.js';

const Chat = lazy(() => import('./pages/Chat.jsx').then((module) => ({ default: module.Chat })));
const chatFallback = <main className="grid min-h-[50vh] place-items-center text-sm text-text-secondary">Loading chat…</main>;

function ThemeSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      document.documentElement.dataset.theme = 'dark';
      return;
    }
    getSettings()
      .then(({ theme }) => { document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark'; })
      .catch(() => { document.documentElement.dataset.theme = 'dark'; });
  }, [user]);
  return null;
}

export default function App() {
  return <><ThemeSync /><Routes>
    <Route path="/" element={<Landing />} />
    <Route element={<AuthLayout />}><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /></Route>
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route path="/dashboard" element={<Dashboard />} /><Route path="/chat/:conversationId?" element={<Suspense fallback={chatFallback}><Chat /></Suspense>} /><Route path="/documents" element={<Documents />} /><Route path="/prompts" element={<Prompts />} /><Route path="/settings" element={<Settings />} /></Route></Route>
    <Route path="*" element={<NotFound />} />
  </Routes></>;
}
