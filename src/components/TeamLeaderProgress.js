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
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const TeamLeaderProgress = ({ user, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [workload, setWorkload] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobProgress, setJobProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchJobs(),
        fetchWorkload()
      ]);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      showAlert('error', 'Failed to fetch progress data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/teamleader/jobs');
      setJobs(res.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  };

  const fetchWorkload = async () => {
    try {
      const res = await api.get('/teamleader/team/workload');
      setWorkload(res.data);
    } catch (error) {
      console.error('Error fetching workload:', error);
      throw error;
    }
  };

  const fetchJobProgress = async (jobId) => {
    try {
      const res = await api.get(`/teamleader/jobs/${jobId}/progress`);
      setJobProgress(res.data || []);
    } catch (error) {
      console.error('Error fetching job progress:', error);
      setJobProgress([]);
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
      await fetchData();
      if (selectedJob) {
        await fetchJobProgress(selectedJob.id);
      }
      showAlert('success', 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      showAlert('error', 'Failed to update progress');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewJobProgress = (job) => {
    setSelectedJob(job);
    fetchJobProgress(job.id);
  };

  const getOverallProgress = () => {
    if (!jobs.length) return 0;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    return Math.round((completedJobs / jobs.length) * 100);
  };

  const getWorkerPerformance = () => {
    const workerStats = {};
    jobs.forEach(job => {
      if (job.WorkerProgresses) {
        job.WorkerProgresses.forEach(progress => {
          const workerId = progress.worker_id;
          const workerName = progress.User?.name || 'Unknown';
          if (!workerStats[workerId]) {
            workerStats[workerId] = {
              name: workerName,
              totalTasks: 0,
              completedTasks: 0,
              inProgressTasks: 0
            };
          }
          workerStats[workerId].totalTasks++;
          if (progress.status === 'done') {
            workerStats[workerId].completedTasks++;
          } else if (progress.status === 'in_progress') {
            workerStats[workerId].inProgressTasks++;
          }
        });
      }
    });
    return Object.values(workerStats);
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading progress data...</Typography>
      </Layout>
    );
  }

  const workerPerformance = getWorkerPerformance();

  return (
    <Layout user={user} onLogout={onLogout}>
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Team Progress
      </Typography>

      {/* Progress Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Overall Progress
                  </Typography>
                  <Typography variant="h4">
                    {getOverallProgress()}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getOverallProgress()}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Jobs
                  </Typography>
                  <Typography variant="h4">
                    {jobs.filter(job => job.status === 'in_progress').length}
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
                <GroupIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Team Members
                  </Typography>
                  <Typography variant="h4">
                    {workload?.memberStats?.activeMembers || 0}
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
                <SpeedIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h4">
                    {workload?.workloadStats?.completionRate || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Job Progress" />
          <Tab label="Worker Performance" />
          <Tab label="Team Analytics" />
        </Tabs>
      </Box>

      {/* Job Progress Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Job Progress Tracking
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
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJobProgress(job);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Description:</strong> {job.description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Assigned:</strong> {new Date(job.assigned_at).toLocaleDateString()}
                      {job.completed_at && ` • Completed: ${new Date(job.completed_at).toLocaleDateString()}`}
                    </Typography>

                    {/* Progress Summary */}
                    {job.WorkerProgresses && job.WorkerProgresses.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Progress Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Typography color="textSecondary">Total Tasks</Typography>
                            <Typography variant="h6">{job.WorkerProgresses.length}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography color="textSecondary">Completed</Typography>
                            <Typography variant="h6" color="success.main">
                              {job.WorkerProgresses.filter(p => p.status === 'done').length}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography color="textSecondary">In Progress</Typography>
                            <Typography variant="h6" color="info.main">
                              {job.WorkerProgresses.filter(p => p.status === 'in_progress').length}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography color="textSecondary">Blocked</Typography>
                            <Typography variant="h6" color="error.main">
                              {job.WorkerProgresses.filter(p => p.status === 'blocked').length}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      )}

      {/* Worker Performance Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Worker Performance
          </Typography>

          {workerPerformance.length === 0 ? (
            <Typography>No worker data available.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Worker</TableCell>
                    <TableCell>Total Tasks</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>In Progress</TableCell>
                    <TableCell>Completion Rate</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workerPerformance.map((worker, index) => {
                    const completionRate = worker.totalTasks > 0
                      ? Math.round((worker.completedTasks / worker.totalTasks) * 100)
                      : 0;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            {worker.name}
                          </Box>
                        </TableCell>
                        <TableCell>{worker.totalTasks}</TableCell>
                        <TableCell>{worker.completedTasks}</TableCell>
                        <TableCell>{worker.inProgressTasks}</TableCell>
                        <TableCell>{completionRate}%</TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={completionRate}
                            color={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'error'}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Team Analytics Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Team Analytics
          </Typography>

          {workload && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workload Statistics
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Total Jobs: {workload.workloadStats.totalJobs}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Not Started: {workload.workloadStats.notStartedJobs}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        In Progress: {workload.workloadStats.inProgressJobs}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Completed: {workload.workloadStats.completedJobs}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated: {new Date(workload.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Capacity & Performance
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Current Capacity: {workload.teamCapacity.currentCapacity} / {workload.teamCapacity.maxCapacity}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Utilization Rate: {workload.teamCapacity.utilizationRate}%
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Available Slots: {workload.teamCapacity.availableSlots}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Avg Response Time: {workload.workloadStats.averageResponseTime}h
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={workload.teamCapacity.utilizationRate}
                      color={workload.teamCapacity.utilizationRate > 90 ? 'error' : 'primary'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Job Progress Details Dialog */}
      <Dialog
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Progress Details: {selectedJob?.Incident?.title || 'Unknown Job'}
        </DialogTitle>
        <DialogContent>
          {jobProgress.length === 0 ? (
            <Typography>No progress data available.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Worker</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobProgress.map((progress) => (
                    <TableRow key={progress.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            <PersonIcon />
                          </Avatar>
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
                        {progress.completed_at
                          ? new Date(progress.completed_at).toLocaleDateString()
                          : 'Not completed'
                        }
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
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedJob(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TeamLeaderProgress;