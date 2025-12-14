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
  Refresh as RefreshIcon,
  Report as ReportIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

// Get the API base URL for constructing image URLs
const getApiBaseUrl = () => {
  const baseURL = process.env.REACT_APP_API_URL || 'https://backend-host-w8to.onrender.com/api';
  // Remove '/api' suffix to get the base server URL
  return baseURL.replace('/api', '');
};

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

      console.log('DEBUG: Incidents data received:', incidentsResponse.data);
      incidentsResponse.data.forEach(incident => {
        if (incident.images) {
          console.log(`DEBUG: Incident ${incident.id} has images: ${incident.images}`);
        }
      });

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
        <Box
          display="flex"
          alignItems="center"
          mb={3}
          sx={{
            mt: 5,
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <ReportIcon sx={{ mr: 2, fontSize: 32, color: 'error.main' }} />
          <Typography variant="h5" component="h1" fontWeight="bold" color="error.main">
            Incident Management
          </Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button
            variant="outlined"
            onClick={fetchData}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
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
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" component="h2" fontWeight="bold">
                        {incident.title}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(incident.status)}
                        label={incident.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(incident.status)}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          '& .MuiChip-icon': {
                            fontSize: 16,
                          },
                        }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {incident.description}
                    </Typography>

                    {incident.images && (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          backgroundColor: 'grey.50',
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Images:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {incident.images.split(',').map((imagePath, index) => {
                            const trimmedPath = imagePath.trim();
                            if (!trimmedPath) return null;

                            // Handle different types of image paths
                            let imageUrl;
                            if (trimmedPath.startsWith('http')) {
                              // External URL
                              imageUrl = trimmedPath;
                            } else if (trimmedPath.startsWith('uploads\\') || trimmedPath.startsWith('uploads/')) {
                              // Local upload path - convert backslashes to forward slashes
                              const filename = trimmedPath.replace('uploads\\', '').replace('uploads/', '');
                              imageUrl = `${getApiBaseUrl()}/uploads/${filename}`;
                            } else {
                              // Fallback
                              imageUrl = `${getApiBaseUrl()}/uploads/${trimmedPath}`;
                            }

                            return (
                              <Box key={index} sx={{ position: 'relative' }}>
                                <img
                                  src={imageUrl}
                                  alt={`Incident image ${index + 1}`}
                                  style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd'
                                  }}
                                  onError={(e) => {
                                    console.error(`Failed to load image: ${imageUrl}`);
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      </Paper>
                    )}

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Location & Details:
                      </Typography>
                      <Typography variant="body2">
                        📍 {incident.location}
                      </Typography>
                    </Paper>

                    {jobCard ? (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          backgroundColor: 'success.50',
                          borderColor: 'success.200',
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Assigned Team:
                          </Typography>
                          <Chip
                            label={getProgressLabel(progressStatus)}
                            color={getProgressColor(progressStatus)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>

                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {jobCard.Team?.name || 'Unknown Team'}
                        </Typography>

                        <Box mt={2} display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveTeam(incident.id)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2,
                              },
                            }}
                          >
                            Remove Team
                          </Button>
                        </Box>

                        {jobCard.WorkerProgress && jobCard.WorkerProgress.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">
                              Team Members Progress:
                            </Typography>
                            <List dense>
                              {jobCard.WorkerProgress.map((progress) => (
                                <ListItem key={progress.id} sx={{ py: 0.5, px: 0 }}>
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
                                          variant="outlined"
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
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mb: 2,
                          textAlign: 'center',
                          borderRadius: 2,
                          backgroundColor: 'warning.50',
                          borderColor: 'warning.200',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                          No team assigned
                        </Typography>
                        {availableTeams.length > 0 ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAssignTeamDialog(incident)}
                            color="warning"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: 2,
                              },
                            }}
                          >
                            Assign Team
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            No available teams
                          </Typography>
                        )}
                      </Paper>
                    )}

                    <Divider sx={{ my: 2, borderColor: 'grey.300' }} />

                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Created: {new Date(incident.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {incidents.length === 0 && (
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              boxShadow: 3,
              borderRadius: 3,
              backgroundColor: 'grey.50',
            }}
          >
            <ReportIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No incidents found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              All incidents will appear here once reported
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
              }}
            >
              Refresh to Check
            </Button>
          </Card>
        )}

        {/* Assign Team Dialog */}
        <Dialog
          open={assignTeamDialog}
          onClose={() => setAssignTeamDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 6,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AssignmentIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Assign Team to Incident
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
              {selectedIncident?.title}
            </Typography>
            <FormControl
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
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
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setAssignTeamDialog(false)}
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 'bold',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTeam}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 4,
                },
              }}
            >
              Assign Team
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ManagerIncidents;