import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  LinearProgress,
  IconButton,
  Tooltip,
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
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const TeamLeaderJobs = ({ user, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchJobs();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teamleader/jobs');
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
      not_started: 'default',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getProgressStatusColor = (status) => {
    const colors = {
      assigned: 'warning',
      in_progress: 'info',
      done: 'success',
      blocked: 'error'
    };
    return colors[status] || 'default';
  };

  const handleUpdateProgress = async (progressId, newStatus) => {
    try {
      await api.put(`/teamleader/progress/${progressId}`, { status: newStatus });
      await fetchJobs();
      showAlert('success', 'Progress updated successfully');
      setProgressDialogOpen(false);
    } catch (error) {
      console.error('Error updating progress:', error);
      showAlert('error', 'Failed to update progress');
    }
  };

  const handleRequestHelp = async (jobId) => {
    try {
      await api.post(`/teamleader/jobs/${jobId}/help`);
      showAlert('success', 'Help request sent successfully');
      setHelpDialogOpen(false);
    } catch (error) {
      console.error('Error requesting help:', error);
      showAlert('error', 'Failed to request help');
    }
  };

  const getJobStats = () => {
    const total = jobs.length;
    const completed = jobs.filter(job => job.status === 'completed').length;
    const inProgress = jobs.filter(job => job.status === 'in_progress').length;
    const notStarted = jobs.filter(job => job.status === 'not_started').length;
    return { total, completed, inProgress, notStarted };
  };

  const stats = getJobStats();

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading jobs...</Typography>
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
                <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {stats.completed}
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
                <ScheduleIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4">
                    {stats.inProgress}
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
                <WorkIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Not Started
                  </Typography>
                  <Typography variant="h4">
                    {stats.notStarted}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jobs List */}
      <Typography variant="h5" component="h2" gutterBottom>
        Job Assignments
      </Typography>

      {jobs.length === 0 ? (
        <Typography>No jobs assigned yet.</Typography>
      ) : (
        jobs.map((job) => (
          <Accordion key={job.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%">
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {job.Incident?.title || 'Unknown Incident'}
                </Typography>
                <Chip
                  label={job.status.replace('_', ' ')}
                  color={getStatusColor(job.status)}
                  size="small"
                  sx={{ mr: 2 }}
                />
                <Typography color="textSecondary" sx={{ mr: 2 }}>
                  Assigned: {new Date(job.assigned_at).toLocaleDateString()}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong> {job.description}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Incident:</strong> {job.Incident?.title || 'N/A'} - {job.Incident?.description || ''}
                </Typography>

                {/* Worker Progress */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Worker Progress
                </Typography>
                {job.WorkerProgresses && job.WorkerProgresses.length > 0 ? (
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Worker</TableCell>
                          <TableCell>Task</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Assigned</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {job.WorkerProgresses.map((progress) => (
                          <TableRow key={progress.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                                {progress.User?.name || 'Unknown'}
                              </Box>
                            </TableCell>
                            <TableCell>{progress.task_description}</TableCell>
                            <TableCell>
                              <Chip
                                label={progress.status.replace('_', ' ')}
                                color={getProgressStatusColor(progress.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(progress.assigned_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Update Status</InputLabel>
                                <Select
                                  value=""
                                  label="Update Status"
                                  onChange={(e) => handleUpdateProgress(progress.id, e.target.value)}
                                >
                                  <MenuItem value="assigned">Assigned</MenuItem>
                                  <MenuItem value="in_progress">In Progress</MenuItem>
                                  <MenuItem value="done">Done</MenuItem>
                                  <MenuItem value="blocked">Blocked</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary">No workers assigned yet.</Typography>
                )}

                {/* Action Buttons */}
                <Box display="flex" gap={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<HelpIcon />}
                    onClick={() => {
                      setSelectedJob(job);
                      setHelpDialogOpen(true);
                    }}
                  >
                    Request Help
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Help Request Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Help for Job</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to request additional help for this job?
          </Typography>
          {selectedJob && (
            <Typography variant="body2" color="textSecondary">
              Job: {selectedJob.Incident?.title || 'Unknown Incident'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedJob && handleRequestHelp(selectedJob.id)}
            variant="contained"
            color="primary"
          >
            Request Help
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TeamLeaderJobs;