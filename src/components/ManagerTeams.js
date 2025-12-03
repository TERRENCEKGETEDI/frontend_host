import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Group as GroupIcon } from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const ManagerTeams = ({ user, onLogout }) => {
  const [teams, setTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [createTeamDialog, setCreateTeamDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  // Fetch teams and available users
  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsResponse, usersResponse] = await Promise.all([
        api.get('/manager/teams'),
        api.get('/manager/users') // Get available users to select from
      ]);
      
      setTeams(teamsResponse.data);
      // Set available users from the backend (already filtered for workers not in teams)
      setAvailableUsers(usersResponse.data);
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

  // Create new team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      await api.post('/manager/teams', { name: newTeamName });
      setSuccess('Team created successfully');
      setCreateTeamDialog(false);
      setNewTeamName('');
      fetchData();
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team');
    }
  };

  // Add member to team
  const handleAddMember = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    try {
      await api.post(`/manager/teams/${selectedTeam.id}/members`, { userId: selectedUser });
      setSuccess('Member added successfully');
      setAddMemberDialog(false);
      setSelectedUser('');
      fetchData();
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member');
    }
  };

  // Remove member from team
  const handleRemoveMember = async (teamId, memberId) => {
    try {
      await api.delete(`/manager/teams/${teamId}/members/${memberId}`);
      setSuccess('Member removed successfully');
      fetchData();
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
    }
  };

  const handleCreateTeamDialog = () => {
    setCreateTeamDialog(true);
    setError('');
  };

  const handleAddMemberDialog = (team) => {
    setSelectedTeam(team);
    setAddMemberDialog(true);
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
            Team Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTeamDialog}
          >
            Create New Team
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
          {teams.map((team) => (
            <Grid item xs={12} md={6} lg={4} key={team.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <GroupIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{team.name}</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Members: {team.TeamMembers?.length || 0}
                  </Typography>

                  {team.TeamMembers && team.TeamMembers.length > 0 ? (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Team Members:
                      </Typography>
                      <List dense>
                        {team.TeamMembers.map((member) => (
                          <ListItem key={member.id}>
                            <ListItemText
                              primary={member.User?.name}
                              secondary={member.User?.email}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveMember(team.id, member.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No members in this team
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleAddMemberDialog(team)}
                    disabled={availableUsers.length === 0}
                  >
                    Add Member
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {teams.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No teams found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first team to get started
            </Typography>
          </Paper>
        )}

        {/* Create Team Dialog */}
        <Dialog open={createTeamDialog} onClose={() => setCreateTeamDialog(false)}>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Team Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateTeamDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam} variant="contained">
              Create Team
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={addMemberDialog} onClose={() => setAddMemberDialog(false)}>
          <DialogTitle>Add Member to {selectedTeam?.name}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select User"
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box>
                      <Typography variant="body1">{user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddMemberDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMember} variant="contained">
              Add Member
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ManagerTeams;