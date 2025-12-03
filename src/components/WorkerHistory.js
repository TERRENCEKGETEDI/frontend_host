import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const WorkerHistory = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchHistory();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/worker/history');
      setHistory(res.data.history || []);
      setTotalEarnings(res.data.totalEarnings || 0);
    } catch (error) {
      console.error('Error fetching history:', error);
      showAlert('error', 'Failed to fetch job history');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const calculateDuration = (arrivedAt, completedAt) => {
    if (!arrivedAt || !completedAt) return 'N/A';
    const start = new Date(arrivedAt);
    const end = new Date(completedAt);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  const calculateEarnings = (arrivedAt, completedAt) => {
    if (!arrivedAt || !completedAt) return 0;
    const start = new Date(arrivedAt);
    const end = new Date(completedAt);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    // Assuming R180 per hour (equivalent to $10/hour at 1 USD = 18 ZAR)
    return Math.round(diffHours * 180 * 100) / 100; // Round to 2 decimal places
  };

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
        Job History
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Your completed jobs and earnings summary
      </Typography>

      {/* Earnings Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WorkIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Jobs Completed
                  </Typography>
                  <Typography variant="h4">
                    {history.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
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

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccessTimeIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average per Job
                  </Typography>
                  <Typography variant="h4">
                    R{history.length > 0 ? (totalEarnings / history.length).toFixed(2) : '0.00'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Job History Table */}
      <Typography variant="h5" component="h2" gutterBottom>
        Completed Jobs
      </Typography>

      {history.length === 0 ? (
        <Typography color="textSecondary">No completed jobs yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {job.JobCard?.Incident?.title || 'Unknown Job'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {job.JobCard?.Incident?.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {job.JobCard?.Incident?.location || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {job.JobCard?.Team?.name || 'Unknown Team'}
                  </TableCell>
                  <TableCell>
                    {calculateDuration(job.arrived_at, job.completed_at)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      R{calculateEarnings(job.arrived_at, job.completed_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completed"
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary Note */}
      {history.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Note:</strong> Earnings are calculated at R180 per hour (equivalent to $10/hour at current exchange rates) based on the time spent working on each job.
            The total earnings shown above reflects the sum of all completed jobs.
          </Typography>
        </Box>
      )}
    </Layout>
  );
};

export default WorkerHistory;