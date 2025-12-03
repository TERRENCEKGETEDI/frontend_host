import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const ManagerIncidents = ({ user, onLogout }) => {
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [assignTeamDialog, setAssignTeamDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');

  // Fetch incidents and teams
  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsResponse, teamsResponse] = await Promise.all([
        api.get('/manager/incidents'),
        api.get('/manager/teams')
      ]);
      
      setIncidents(incidentsResponse.data);
      setTeams(teamsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Assign team to incident
  const handleAssignTeam = async () => {
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    try {
      await api.post(`/manager/incidents/${selectedIncident.id}/assign/${selectedTeam}`, {
        reason: 'Manual assignment by manager'
      });
      setSuccess('Team assigned successfully');
      setAssignTeamDialog(false);
      setSelectedIncident(null);
      setSelectedTeam('');
      fetchData();
    } catch (err) {
      console.error('Error assigning team:', err);
      setError('Failed to assign team');
    }
  };

  // Remove team from incident
  const handleRemoveTeam = async (incidentId) => {
    try {
      await api.delete(`/manager/incidents/${incidentId}/assign`);
      setSuccess('Team removed successfully');
      fetchData();
    } catch (err) {
      console.error('Error removing team:', err);
      setError('Failed to remove team');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'verified':
        return 'info';
      case 'assigned':
        return 'primary';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'verified':
        return <RefreshIcon />;
      case 'assigned':
        return <AssignmentIcon />;
      case 'in_progress':
        return <PlayArrowIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getProgressStatus = (jobCard) => {
    if (!jobCard || !jobCard.WorkerProgress || jobCard.WorkerProgress.length === 0) {
      return 'not_started';
    }
    
    const allCompleted = jobCard.WorkerProgress.every(progress => progress.status === 'completed');
    const allStarted = jobCard.WorkerProgress.every(progress => progress.status !== 'not_started');
    
    if (allCompleted) return 'complete';
    if (allStarted) return 'in_progress';
    return 'not_started';
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case 'not_started':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'complete':
        return 'success';
      default:
        return 'default';
    }
  };

  const getProgressLabel = (progress) => {
    switch (progress) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'complete':
        return 'Complete';
      default:
        return 'Unknown';
    }
  };

  const handleAssignTeamDialog = (incident) => {
    setSelectedIncident(incident);
    setAssignTeamDialog(true);
    setError('');
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
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Incident Management
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchData}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {incidents.map((incident) => {
            const jobCard = incident.JobCard;
            const progressStatus = getProgressStatus(jobCard);
            const availableTeams = teams.filter(team =>
              !incident.JobCard || incident.JobCard.team_id !== team.id
            );

            return (
              <Grid item size={{ xs: 12, md: 6, lg: 4 }} key={incident.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2">
                        {incident.title}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(incident.status)}
                        label={incident.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(incident.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {incident.description}
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Location & Details:
                      </Typography>
                      <Typography variant="body2">
                        📍 {incident.location}
                      </Typography>
                    </Paper>

                    {jobCard ? (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2">
                            Assigned Team:
                          </Typography>
                          <Chip
                            label={getProgressLabel(progressStatus)}
                            color={getProgressColor(progressStatus)}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body1" fontWeight="bold" color="primary">
                          {jobCard.Team?.name || 'Unknown Team'}
                        </Typography>

                        <Box mt={2} display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveTeam(incident.id)}
                          >
                            Remove Team
                          </Button>
                        </Box>

                        {jobCard.WorkerProgress && jobCard.WorkerProgress.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="caption" color="text.secondary">
                              Team Members Progress:
                            </Typography>
                            <List dense>
                              {jobCard.WorkerProgress.map((progress) => (
                                <ListItem key={progress.id} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={
                                      <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2">
                                          Worker #{progress.worker_id}
                                        </Typography>
                                        <Chip
                                          label={progress.status.replace('_', ' ')}
                                          size="small"
                                          color={progress.status === 'completed' ? 'success' : 'default'}
                                        />
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Paper>
                    ) : (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No team assigned
                        </Typography>
                        {availableTeams.length > 0 ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAssignTeamDialog(incident)}
                          >
                            Assign Team
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No available teams
                          </Typography>
                        )}
                      </Paper>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(incident.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {incidents.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No incidents found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All incidents will appear here
            </Typography>
          </Paper>
        )}

        {/* Assign Team Dialog */}
        <Dialog open={assignTeamDialog} onClose={() => setAssignTeamDialog(false)}>
          <DialogTitle>Assign Team to Incident</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedIncident?.title}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Team</InputLabel>
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                label="Select Team"
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    <Box>
                      <Typography variant="body1">{team.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {team.TeamMembers?.length || 0} members
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignTeamDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignTeam} variant="contained">
              Assign Team
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ManagerIncidents;