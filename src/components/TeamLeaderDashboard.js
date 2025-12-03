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
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Slider,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const TeamLeaderDashboard = ({ user, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [teamStatus, setTeamStatus] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unavailableDialogOpen, setUnavailableDialogOpen] = useState(false);
  const [settings, setSettings] = useState({
    is_available: true,
    max_capacity: 5,
    priority_level: 1
  });
  const [unavailableDuration, setUnavailableDuration] = useState(60);
  const [unavailableReason, setUnavailableReason] = useState('');
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  console.log('TeamLeaderDashboard render, user:', user);

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
        fetchTeamStatus(),
        fetchWorkload()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showAlert('error', 'Failed to fetch dashboard data');
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

  const fetchTeamStatus = async () => {
    try {
      const res = await api.get('/teamleader/team/status');
      setTeamStatus(res.data);
      setSettings({
        is_available: res.data.isAvailable,
        max_capacity: res.data.maxCapacity,
        priority_level: res.data.priorityLevel
      });
    } catch (error) {
      console.error('Error fetching team status:', error);
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

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const updateTeamAvailability = async (newSettings) => {
    try {
      await api.put('/teamleader/team/availability', newSettings);
      await fetchTeamStatus();
      showAlert('success', 'Team availability updated successfully');
    } catch (error) {
      console.error('Error updating team availability:', error);
      showAlert('error', 'Failed to update team availability');
    }
  };

  const handleSettingsSave = async () => {
    await updateTeamAvailability(settings);
    setSettingsOpen(false);
  };

  const setTemporarilyUnavailable = async () => {
    try {
      await api.post('/teamleader/team/unavailable', {
        duration_minutes: unavailableDuration,
        reason: unavailableReason
      });
      await fetchTeamStatus();
      setUnavailableDialogOpen(false);
      setUnavailableReason('');
      showAlert('success', `Team will be unavailable for ${unavailableDuration} minutes`);
    } catch (error) {
      console.error('Error setting team unavailable:', error);
      showAlert('error', 'Failed to set team unavailable');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getJobStats = () => {
    const total = jobs.length;
    const completed = jobs.filter(job => job.status === 'completed').length;
    const inProgress = jobs.filter(job => job.status === 'in_progress').length;
    const pending = jobs.filter(job => job.status === 'pending').length;
    return { total, completed, inProgress, pending };
  };

  const getUtilizationColor = (rate) => {
    if (rate >= 0.9) return 'error';
    if (rate >= 0.7) return 'warning';
    return 'success';
  };

  const stats = getJobStats();

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading dashboard...</Typography>
      </Layout>
    );
  }

  try {
    return (
      <Layout user={user} onLogout={onLogout}>
        {alert.show && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}
        
        <Typography variant="h4" component="h1" gutterBottom>
          Team Leader Dashboard
        </Typography>
        <Typography>Welcome, {user?.name || 'User'}</Typography>

        {/* Team Status Card */}
        {teamStatus && (
          <Card sx={{ mt: 3, mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Team Status & Availability
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setSettingsOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="outlined"
                    color={teamStatus.isAvailable ? "warning" : "success"}
                    onClick={() => teamStatus.isAvailable ? setUnavailableDialogOpen(true) : updateTeamAvailability({ is_available: true })}
                  >
                    {teamStatus.isAvailable ? "Set Unavailable" : "Set Available"}
                  </Button>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box display="flex" alignItems="center">
                    {teamStatus.isAvailable ? (
                      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                    ) : (
                      <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                    )}
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Team Status
                      </Typography>
                      <Typography variant="h6" color={teamStatus.isAvailable ? "success" : "error"}>
                        {teamStatus.isAvailable ? 'Available' : 'Unavailable'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box display="flex" alignItems="center">
                    <GroupIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Capacity
                      </Typography>
                      <Typography variant="h6">
                        {teamStatus.currentCapacity} / {teamStatus.maxCapacity}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={teamStatus.utilizationRate * 100} 
                        color={getUtilizationColor(teamStatus.utilizationRate)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box display="flex" alignItems="center">
                    <SpeedIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Utilization Rate
                      </Typography>
                      <Typography variant="h6">
                        {Math.round(teamStatus.utilizationRate * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Box display="flex" alignItems="center">
                    <TimerIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Priority Level
                      </Typography>
                      <Typography variant="h6">
                        Level {teamStatus.priorityLevel}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {teamStatus.availableFrom && !teamStatus.isAvailable && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Team will be available again at: {new Date(teamStatus.availableFrom).toLocaleString()}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

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
        </Grid>

        {/* Workload Analytics */}
        {workload && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Team Workload Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate (7 days)
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {workload.workloadStats.completionRate}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" color="info">
                    {workload.workloadStats.averageResponseTime}h
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography color="textSecondary" gutterBottom>
                    Active Members
                  </Typography>
                  <Typography variant="h4" color="success">
                    {workload.memberStats.activeMembers}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Recent Jobs Table */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Recent Jobs
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Incident</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.slice(0, 5).map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.Incident?.title || 'N/A'}</TableCell>
                  <TableCell>{job.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Team Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Team Availability Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.is_available}
                    onChange={(e) => setSettings({...settings, is_available: e.target.checked})}
                  />
                }
                label="Team Available for Assignments"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>
                Maximum Capacity: {settings.max_capacity} incidents
              </Typography>
              <Slider
                value={settings.max_capacity}
                onChange={(e, value) => setSettings({...settings, max_capacity: value})}
                step={1}
                marks
                min={1}
                max={20}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
              />

              <Typography gutterBottom>
                Priority Level: {settings.priority_level}
              </Typography>
              <Slider
                value={settings.priority_level}
                onChange={(e, value) => setSettings({...settings, priority_level: value})}
                step={1}
                marks
                min={1}
                max={5}
                valueLabelDisplay="auto"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSettingsSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* Temporarily Unavailable Dialog */}
        <Dialog open={unavailableDialogOpen} onClose={() => setUnavailableDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Set Team Temporarily Unavailable</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>
                Duration (minutes): {unavailableDuration}
              </Typography>
              <Slider
                value={unavailableDuration}
                onChange={(e, value) => setUnavailableDuration(value)}
                step={5}
                marks
                min={5}
                max={1440}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Reason (optional)"
                value={unavailableReason}
                onChange={(e) => setUnavailableReason(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnavailableDialogOpen(false)}>Cancel</Button>
            <Button onClick={setTemporarilyUnavailable} variant="contained" color="warning">
              Set Unavailable
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    );
  } catch (error) {
    console.error('Error rendering TeamLeaderDashboard:', error);
    return (
      <div>
        <h1>Error loading dashboard</h1>
        <p>{error.message}</p>
      </div>
    );
  }
};

export default TeamLeaderDashboard;