import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api, { getCurrentUser, isAuthenticated } from '../utils/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('AdminDashboard: Fetching dashboard data...');
    try {
      setLoading(true);
      
      // Check authentication status
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      console.log('AdminDashboard: User authenticated:', authenticated);
      console.log('AdminDashboard: Current user:', currentUser);
      
      if (!authenticated) {
        console.error('AdminDashboard: User not authenticated');
        alert('Please log in to access the admin dashboard.');
        return;
      }
      
      if (currentUser?.role !== 'admin') {
        console.error('AdminDashboard: Insufficient permissions - user is not admin');
        alert('Access denied. Admin privileges required.');
        return;
      }
      
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      console.log('AdminDashboard: Users received:', usersRes.data.length);
      console.log('AdminDashboard: Stats received:', statsRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('AdminDashboard: Error fetching dashboard data:', error);
      console.error('AdminDashboard: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.error('AdminDashboard: Authentication failed - token may be invalid or expired');
        alert('Authentication failed. Please log in again.');
        // Optionally trigger logout
        // onLogout();
      } else if (error.response?.status === 403) {
        console.error('AdminDashboard: Access forbidden - insufficient permissions');
        alert('You do not have permission to access this data.');
      } else {
        console.error('AdminDashboard: Server error:', error.response?.data || error.message);
        alert('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      team_leader: 'info',
      worker: 'success'
    };
    return colors[role] || 'default';
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading dashboard...</Typography>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HistoryIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Activity Logs
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalActivityLogs || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Recent Users
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.slice(0, 10).map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Avatar>{u.name.charAt(0).toUpperCase()}</Avatar>
                </TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    label={u.role.replace('_', ' ')}
                    color={getRoleColor(u.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.status || 'Active'}
                    color={u.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default AdminDashboard;