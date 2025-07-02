import React, { Suspense, useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Boxes from './pages/Boxes';
import Parts from './pages/Parts';
import Accessories from './pages/Accessories';

const Login = React.lazy(() => import('./pages/Login'));

// Dark mode context
const DarkModeContext = createContext();
export function useDarkMode() { return useContext(DarkModeContext); }

function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [dark]);
  return <DarkModeContext.Provider value={{ dark, setDark }}>{children}</DarkModeContext.Provider>;
}

function DarkModeToggle() {
  const { dark, setDark } = useDarkMode();
  return (
    <button
      className="ml-2 p-2 rounded-full bg-white/70 dark:bg-gray-800/70 shadow hover:bg-white/90 dark:hover:bg-gray-700 transition"
      onClick={() => setDark(d => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.95 7.05l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
      )}
    </button>
  );
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function Dashboard() {
  const [counts, setCounts] = useState({ boxes: null, parts: null, accessories: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/boxes/count', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/parts/count', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch('https://techclinic-api.techclinic-api.workers.dev/api/accessories/count', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
    ])
      .then(([boxes, parts, accessories]) => {
        setCounts({
          boxes: typeof boxes.count === 'number' ? boxes.count : 0,
          parts: typeof parts.count === 'number' ? parts.count : 0,
          accessories: typeof accessories.count === 'number' ? accessories.count : 0,
        });
        setLoading(false);
      })
      .catch((e) => {
        setError('Failed to load stats');
        setLoading(false);
      });
  }, []);

  const statCard = (label, value) => (
    <div className="rounded-2xl bg-white/80 dark:bg-[#23263a]/80 border border-blue-100 dark:border-gray-800 shadow p-5 flex flex-col items-center min-h-[80px] w-full">
      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
        {loading ? (
          <span className="animate-pulse bg-blue-100 dark:bg-blue-900 h-7 w-12 rounded" />
        ) : error ? (
          <span className="text-red-500">--</span>
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-300">{label}</div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-8 px-2">
      <div className="max-w-2xl w-full mx-auto">
        <div className="rounded-3xl shadow-xl bg-white/80 dark:bg-[#23263a]/80 backdrop-blur-xl border border-blue-100 dark:border-gray-800 p-8 flex flex-col items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2 tracking-tight text-center">Welcome to TechClinic Admin Panel</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-4">Manage your inventory, parts, accessories, and admins with a modern dashboard.</p>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCard('Boxes', counts.boxes)}
          {statCard('Parts', counts.parts)}
          {statCard('Accessories', counts.accessories)}
        </div>
        {error && <div className="text-center text-red-500 mt-4">{error}</div>}
      </div>
    </div>
  );
}

const navItems = [
  {
    text: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" /></svg>
    ),
    path: '/',
  },
  {
    text: 'Boxes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2z" /></svg>
    ),
    path: '/boxes',
  },
  {
    text: 'Parts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 21m6-4l.75 4M9 21h6M4.5 10.5l15 0M4.5 10.5l1.5-6h12l1.5 6" /></svg>
    ),
    path: '/parts',
  },
  {
    text: 'Accessories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    path: '/accessories',
  },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark } = useDarkMode();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  return (
    <div className={
      `flex min-h-screen text-[#22223b] dark:text-gray-100 bg-[#f4f6fa] dark:bg-[#181a20] transition-colors duration-300`
    }>
      {/* Sidebar */}
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-64 bg-white/70 dark:bg-[#23263a]/80 backdrop-blur-xl shadow-xl border-r border-blue-100 dark:border-gray-800 flex-col transition-transform duration-300 z-30`}> 
        <div className="h-16 flex items-center justify-center font-bold text-2xl tracking-tight border-b border-blue-100 dark:border-gray-800 bg-white/10 dark:bg-[#23263a]/30">TechClinic Admin</div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.text}>
                  <Link
                    to={item.path}
                    className={
                      `flex items-center px-6 py-2 rounded-lg transition group font-medium gap-3 ` +
                      (isActive
                        ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-800 dark:text-yellow-200 font-bold shadow'
                        : 'hover:bg-blue-100/80 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-yellow-200')
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={
                      'mr-2 ' +
                      (isActive
                        ? 'text-blue-800 dark:text-yellow-200'
                        : 'text-blue-700 dark:text-blue-300 group-hover:text-yellow-400')
                    }>{item.icon}</span>
                    <span>{item.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-400 hover:from-blue-700 hover:to-purple-500 rounded-lg text-white font-semibold shadow transition"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          Logout
        </button>
      </aside>
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white/90 dark:bg-[#23263a]/95 backdrop-blur-xl shadow-xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="h-16 flex items-center justify-between px-4 font-bold text-2xl tracking-tight border-b border-blue-100 dark:border-gray-800 bg-white/10 dark:bg-[#23263a]/30">
          TechClinic Admin
          <button onClick={() => setSidebarOpen(false)} className="text-gray-700 dark:text-gray-200 hover:text-yellow-300 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
          {navItems.map((item) => (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className="flex items-center px-6 py-2 rounded-lg hover:bg-blue-100/80 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-yellow-200 transition group font-medium gap-3"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-2 text-blue-700 dark:text-blue-300 group-hover:text-yellow-400">{item.icon}</span>
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-400 hover:from-blue-700 hover:to-purple-500 rounded-lg text-white font-semibold shadow transition"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-[#23263a]/80 shadow flex items-center px-4 md:px-8 sticky top-0 z-20 backdrop-blur-xl border-b border-blue-100 dark:border-gray-800">
          {/* Hamburger for mobile */}
          <button
            className="md:hidden mr-4 text-blue-700 dark:text-blue-200 hover:text-purple-500 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-semibold text-blue-700 dark:text-blue-200 flex-1 tracking-tight">TechClinic Admin Panel</h1>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <SnackbarProvider maxSnack={3} autoHideDuration={2500} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/boxes" element={<Boxes />} />
                        <Route path="/parts" element={<Parts />} />
                        <Route path="/accessories" element={<Accessories />} />
                      </Routes>
                    </Layout>
                  </RequireAuth>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </SnackbarProvider>
    </DarkModeProvider>
  );
}

// Tailwind dark mode must be enabled in tailwind.config.js: darkMode: 'class'
