import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ConfigProvider } from './config/ConfigContext';
import { ToastProvider } from './components/ui';
import Landing from './pages/Landing';
import Wizard from './pages/Wizard';
import Docs from './pages/Docs';
import Portal from './pages/Portal';
import PortalAdmin from './pages/PortalAdmin';

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/wizard')) window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ConfigProvider>
        <ToastProvider>
          <ScrollReset />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/wizard" element={<Navigate to="/wizard/identity" replace />} />
            <Route path="/wizard/:step" element={<Wizard />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:slug" element={<Docs />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/portal/applications" element={<Portal list />} />
            <Route path="/portal/applications/:id" element={<Portal />} />
            <Route path="/portal/admin" element={<PortalAdmin />} />
            <Route path="/portal/admin/:id" element={<PortalAdmin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ConfigProvider>
    </HashRouter>
  );
}
