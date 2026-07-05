import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Find from './pages/Find';
import Driver from './pages/Driver';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletion from './pages/DataDeletion';
import BottomNav from './components/BottomNav';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Tab order defines direction of slide animations
const TAB_PATHS = ['/', '/find', '/driver'];

const tabIndex = (path) => {
  const idx = TAB_PATHS.indexOf(path);
  return idx === -1 ? null : idx;
};

// Keep-alive tab stack: all tab pages stay mounted, only shown/hidden
const TabStack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const prev = tabIndex(prevPathRef.current);
    const next = tabIndex(location.pathname);
    if (prev !== null && next !== null) {
      setDirection(next > prev ? 1 : -1);
    } else {
      setDirection(0);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // Android back button: if on a non-home tab, go back to '/' instead of exiting
  useEffect(() => {
    const isTab = TAB_PATHS.includes(location.pathname);
    if (isTab && location.pathname !== '/') {
      window.history.pushState({ tab: location.pathname }, '');
    }

    const handlePopState = () => {
      const current = window.location.pathname;
      const onTab = TAB_PATHS.includes(current);
      if (onTab && current !== '/') {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, navigate]);

  const isTab = TAB_PATHS.includes(location.pathname);

  return (
    <>
      {/* Tab pages: always mounted, visually hidden when not active */}
      {TAB_PATHS.map((path) => {
        const active = location.pathname === path;
        return (
          <div
            key={path}
            style={{
              position: active ? 'relative' : 'fixed',
              inset: active ? 'auto' : 0,
              visibility: active ? 'visible' : 'hidden',
              pointerEvents: active ? 'auto' : 'none',
              zIndex: active ? 1 : 0,
            }}
          >
            {path === '/' && <Home />}
            {path === '/find' && <Find />}
            {path === '/driver' && <Driver />}
          </div>
        );
      })}

      {/* Non-tab routes render normally with a simple fade */}
      {!isTab && (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : -direction * 40 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <Routes>
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/data-deletion" element={<DataDeletion />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #fff9c4 50%, #fce4ec 100%)' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [-8, 8, -8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl drop-shadow-md"
        >🍦</motion.div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
      <TabStack />
      <BottomNav />
    </>
  );
};

function App() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App