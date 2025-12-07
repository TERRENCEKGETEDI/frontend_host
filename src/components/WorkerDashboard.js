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
  AttachMoney as MoneyIcon,
  Dashboard as DashboardIcon,
  WorkHistory as WorkHistoryIcon
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

      <Box
        display="flex"
        alignItems="center"
        mb={4}
        sx={{
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <DashboardIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
            Worker Dashboard
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Welcome back, {user.name}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              boxShadow: 3,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Total Jobs
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              boxShadow: 3,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Pending
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              boxShadow: 3,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <WorkIcon sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    In Progress
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.working}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              boxShadow: 3,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Completed
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.done}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
              color: 'white',
              boxShadow: 3,
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Total Earnings
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    R{totalEarnings}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box display="flex" alignItems="center" mb={2} sx={{ mt: 4 }}>
        <WorkHistoryIcon sx={{ mr: 2, fontSize: 30, color: 'secondary.main' }} />
        <Typography variant="h5" component="h2" fontWeight="bold" color="secondary.main">
          Recent Jobs
        </Typography>
      </Box>

      {jobs.length === 0 ? (
        <Typography color="textSecondary">No jobs assigned yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {jobs.slice(0, 3).map((job) => (
            <Grid item xs={12} md={4} key={job.id}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {job.JobCard?.Incident?.title || 'Unknown Job'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                    Status: <strong>{job.status}</strong>
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