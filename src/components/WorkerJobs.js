import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const WorkerJobs = ({ user, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchJobs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/worker/jobs');
      setJobs(res.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showAlert('error', 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      working: 'info',
      done: 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'working':
        return <PlayArrowIcon />;
      case 'done':
        return <CheckCircleIcon />;
      default:
        return <WorkIcon />;
    }
  };

  const handleUpdateStatus = async (progressId, newStatus) => {
    try {
      await api.put(`/worker/progress/${progressId}`, { status: newStatus });
      await fetchJobs();
      showAlert('success', 'Job status updated successfully');
      setStatusDialogOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('error', 'Failed to update job status');
    }
  };

  const handleStatusChange = (job, newStatus) => {
    setSelectedJob({ ...job, newStatus });
    setStatusDialogOpen(true);
  };

  const getJobStats = () => {
    const total = jobs.length;
    const pending = jobs.filter(job => job.status === 'pending').length;
    const working = jobs.filter(job => job.status === 'working').length;
    const done = jobs.filter(job => job.status === 'done').length;
    return { total, pending, working, done };
  };

  const stats = getJobStats();

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
        My Jobs
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
      </Grid>

      {/* Jobs List */}
      <Typography variant="h5" component="h2" gutterBottom>
        Assigned Jobs
      </Typography>

      {jobs.length === 0 ? (
        <Typography color="textSecondary">No jobs assigned yet.</Typography>
      ) : (
        jobs.map((job) => (
          <Accordion key={job.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%">
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {job.JobCard?.Incident?.title || 'Unknown Incident'}
                </Typography>
                <Chip
                  icon={getStatusIcon(job.status)}
                  label={job.status.replace('_', ' ')}
                  color={getStatusColor(job.status)}
                  size="small"
                  sx={{ mr: 2 }}
                />
                <Typography color="textSecondary" sx={{ mr: 2 }}>
                  Assigned: {new Date(job.created_at || job.assigned_at).toLocaleDateString()}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong> {job.JobCard?.Incident?.description || 'No description available'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Location:</strong> {job.JobCard?.Incident?.location || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Team:</strong> {job.JobCard?.Team?.name || 'Unknown Team'}
                </Typography>

                {job.arrived_at && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Started:</strong> {new Date(job.arrived_at).toLocaleString()}
                  </Typography>
                )}

                {job.completed_at && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Completed:</strong> {new Date(job.completed_at).toLocaleString()}
                  </Typography>
                )}

                {/* Action Buttons */}
                <Box display="flex" gap={2} sx={{ mt: 2 }}>
                  {job.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleStatusChange(job, 'working')}
                    >
                      Start Job
                    </Button>
                  )}

                  {job.status === 'working' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleStatusChange(job, 'done')}
                    >
                      Mark Complete
                    </Button>
                  )}

                  {job.status === 'done' && (
                    <Chip
                      label="Completed"
                      color="success"
                      icon={<CheckCircleIcon />}
                    />
                  )}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Status Update</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to update the status of this job?
          </Typography>
          {selectedJob && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Job: {selectedJob.JobCard?.Incident?.title || 'Unknown Incident'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                New Status: {selectedJob.newStatus}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedJob && handleUpdateStatus(selectedJob.id, selectedJob.newStatus)}
            variant="contained"
            color="primary"
          >
            Confirm Update
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default WorkerJobs;