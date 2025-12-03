import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Login from './components/Login';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminStats from './components/AdminStats';
import AdminReports from './components/AdminReports';
import ManagerDashboard from './components/ManagerDashboard';
import ManagerTeams from './components/ManagerTeams';
import ManagerIncidents from './components/ManagerIncidents';
import ManagerStats from './components/ManagerStats';
import TeamLeaderDashboard from './components/TeamLeaderDashboard';
import TeamLeaderJobs from './components/TeamLeaderJobs';
import TeamLeaderProgress from './components/TeamLeaderProgress';
import TeamLeaderReports from './components/TeamLeaderReports';
import WorkerDashboard from './components/WorkerDashboard';
import WorkerJobs from './components/WorkerJobs';
import WorkerHistory from './components/WorkerHistory';
import PublicIncident from './components/PublicIncident';
import PublicProgress from './components/PublicProgress';
import Profile from './components/Profile';
import api from './utils/api';
import './App.css';

// Create theme with green/blue colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green
    },
    secondary: {
      main: '#2196F3', // Blue
    },
  },
});

// Map role to correct path
const getRolePath = (role) => {
  const rolePaths = {
    admin: '/admin',
    manager: '/manager',
    team_leader: '/teamleader',
    worker: '/worker'
  };
  return rolePaths[role] || '/';
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) return <Navigate to="/" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRolePath(user.role)} />;
  }

  return children;
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      console.log('Starting token verification');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Token found:', !!token);
      if (token) {
        // Try to load user data from localStorage first
        const storedUser = localStorage.getItem('user');
        console.log('Stored user:', storedUser);
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Setting user from storage:', userData);
            setUser(userData);
          } catch (err) {
            console.error('Error parsing stored user data:', err);
          }
        }

        // Verify token with backend
        try {
          console.log('Verifying token with backend');
          // Decode the token to get basic info
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Fetch full user data from backend with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          );
          const res = await Promise.race([api.get('/auth/profile'), timeoutPromise]);
          console.log('Backend verification successful:', res.data);
          setUser(res.data);
          // Store updated user data
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          // Don't delete tokens on verification failure
          console.error('Token verification failed:', err);
          // If we have stored user data, keep using it
          if (!storedUser) {
            console.log('No stored user, setting user to null');
            // No stored data and verification failed, clear user
            setUser(null);
          } else {
            console.log('Keeping stored user data');
          }
        }
      } else {
        console.log('No token found');
      }
      console.log('Setting loading to false');
      setLoading(false);
    };
    verifyToken();
  }, []);

  // Redirect to home when user logs out, but not if already on public pages
  useEffect(() => {
    const publicPaths = ['/', '/login', '/incident-report', '/incident-progress'];
    if (!loading && !user && !publicPaths.includes(location.pathname)) {
      navigate('/');
    }
  }, [user, loading, navigate, location.pathname]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        {user ? (
          <Routes>
            <Route path="/admin" element={<ProtectedRoute user={user} allowedRoles={['admin']}><AdminDashboard user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute user={user} allowedRoles={['admin']}><AdminUsers user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/admin/stats" element={<ProtectedRoute user={user} allowedRoles={['admin']}><AdminStats user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute user={user} allowedRoles={['admin']}><AdminReports user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/manager" element={<ProtectedRoute user={user} allowedRoles={['manager']}><ManagerDashboard user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/manager/teams" element={<ProtectedRoute user={user} allowedRoles={['manager']}><ManagerTeams user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/manager/incidents" element={<ProtectedRoute user={user} allowedRoles={['manager']}><ManagerIncidents user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/manager/stats" element={<ProtectedRoute user={user} allowedRoles={['manager']}><ManagerStats user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/teamleader" element={<ProtectedRoute user={user} allowedRoles={['team_leader']}><TeamLeaderDashboard user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/teamleader/jobs" element={<ProtectedRoute user={user} allowedRoles={['team_leader']}><TeamLeaderJobs user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/teamleader/progress" element={<ProtectedRoute user={user} allowedRoles={['team_leader']}><TeamLeaderProgress user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/teamleader/reports" element={<ProtectedRoute user={user} allowedRoles={['team_leader']}><TeamLeaderReports user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/worker" element={<ProtectedRoute user={user} allowedRoles={['worker']}><WorkerDashboard user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/worker/jobs" element={<ProtectedRoute user={user} allowedRoles={['worker']}><WorkerJobs user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/worker/history" element={<ProtectedRoute user={user} allowedRoles={['worker']}><WorkerHistory user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'team_leader', 'worker']}><Profile user={user} onLogout={handleLogout} /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={getRolePath(user.role)} />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/incident-report" element={<PublicIncident />} />
            <Route path="/incident-progress" element={<PublicProgress />} />
          </Routes>
        )}
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
