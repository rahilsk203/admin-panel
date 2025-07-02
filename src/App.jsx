import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import WidgetsIcon from '@mui/icons-material/Widgets';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import { SnackbarProvider } from 'notistack';
import Boxes from './pages/Boxes';
import Parts from './pages/Parts';
import Accessories from './pages/Accessories';
import Admins from './pages/Admins';

const drawerWidth = 220;
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
  return <Typography variant="h4">Dashboard</Typography>;
}

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Boxes', icon: <InventoryIcon />, path: '/boxes' },
  { text: 'Parts', icon: <BuildIcon />, path: '/parts' },
  { text: 'Accessories', icon: <WidgetsIcon />, path: '/accessories' },
  { text: 'Admins', icon: <PeopleIcon />, path: '/admins' },
];

function Layout({ children }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            TechClinic Admin Panel
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItem button key={item.text} component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f4f6fa' },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}
