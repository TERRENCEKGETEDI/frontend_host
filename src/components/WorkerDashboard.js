import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const WorkerDashboard = ({ user, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, historyRes] = await Promise.all([
        api.get('/worker/jobs'),
        api.get('/worker/history')
      ]);
      setJobs(jobsRes.data || []);
      setHistory(historyRes.data || { history: [], totalEarnings: 0 });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('error', 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const getJobStats = () => {
    const total = jobs.length;
    const pending = jobs.filter(job => job.status === 'pending').length;
    const working = jobs.filter(job => job.status === 'working').length;
    const done = jobs.filter(job => job.status === 'done').length;
    return { total, pending, working, done };
  };

  const stats = getJobStats();
  const totalEarnings = history.totalEarnings || 0;

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Worker Dashboard
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Welcome back, {user.name}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Jobs
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {stats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WorkIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4">
                    {stats.working}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {stats.done}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Earnings
                  </Typography>
                  <Typography variant="h4">
                    R{totalEarnings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" component="h2" gutterBottom>
        Recent Jobs
      </Typography>

      {jobs.length === 0 ? (
        <Typography color="textSecondary">No jobs assigned yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {jobs.slice(0, 3).map((job) => (
            <Grid item xs={12} md={4} key={job.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {job.JobCard?.Incident?.title || 'Unknown Job'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Status: {job.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Assigned: {new Date(job.created_at || job.assigned_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
};

export default WorkerDashboard;