import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Boxes from './pages/Boxes';
import Parts from './pages/Parts';
import Accessories from './pages/Accessories';
import Admins from './pages/Admins';

const Login = React.lazy(() => import('./pages/Login'));

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function Dashboard() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2 tracking-tight">Welcome to TechClinic Admin Panel</h1>
      <p className="text-lg text-gray-600">Manage your inventory, parts, accessories, and admins with a modern dashboard.</p>
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
  {
    text: 'Admins',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" /></svg>
    ),
    path: '/admins',
  },
];

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  return (
    <div className="flex min-h-screen bg-[#f4f6fa] text-[#22223b]">
      {/* Sidebar */}
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-60 bg-gradient-to-b from-blue-600 via-blue-700 to-purple-400 text-white flex-col shadow-xl transition-transform duration-300 z-30`}>
        <div className="h-16 flex items-center justify-center font-bold text-2xl tracking-tight border-b border-blue-800 bg-white/10">TechClinic Admin</div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className="flex items-center px-6 py-2 hover:bg-blue-700/80 hover:text-yellow-200 transition rounded-r-full group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-white group-hover:text-yellow-300">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
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
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 bg-white/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      {/* Mobile Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-blue-600 via-blue-700 to-purple-400 text-white flex-col shadow-xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="h-16 flex items-center justify-between px-4 font-bold text-2xl tracking-tight border-b border-blue-800 bg-white/10">
          TechClinic Admin
          <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-yellow-300 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
          {navItems.map((item) => (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className="flex items-center px-6 py-2 hover:bg-blue-700/80 hover:text-yellow-200 transition rounded-r-full group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-white group-hover:text-yellow-300">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
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
        <header className="h-16 bg-white shadow flex items-center px-4 md:px-8">
          {/* Hamburger for mobile */}
          <button
            className="md:hidden mr-4 text-blue-700 hover:text-purple-500 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-lg font-semibold text-blue-700 flex-1 tracking-tight">TechClinic Admin Panel</h1>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
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
                        <Route path="/admins" element={<Admins />} />
                      </Routes>
                    </Layout>
                  </RequireAuth>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </SnackbarProvider>
  );
}
