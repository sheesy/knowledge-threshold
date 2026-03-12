import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage   from './pages/EditorPage';
import ExplorePage  from './pages/ExplorePage';
import Layout       from './components/Layout';

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter basename="/knowledge-threshold">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E2330', color: '#E8EAF0', border: '1px solid rgba(255,255,255,0.07)', fontSize: '14px' },
          success: { iconTheme: { primary: '#00C896', secondary: '#0D0F14' } },
        }}
      />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index           element={<DashboardPage />} />
          <Route path="new"      element={<EditorPage />} />
          <Route path="edit/:id" element={<EditorPage />} />
          <Route path="explore"  element={<ExplorePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
