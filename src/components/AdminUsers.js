import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
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
  Alert,
  Box,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const AdminUsers = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'worker',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered users based on search term and filters
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => (user.status || 'active') === statusFilter);
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const fetchUsers = async () => {
    console.log('AdminUsers: Fetching users...');
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/users');
      console.log('AdminUsers: Users received:', res.data.length);
      setUsers(res.data);
    } catch (err) {
      console.error('AdminUsers: Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'worker',
      status: 'active'
    });
  };

  const handleAddUser = async () => {
    try {
      setError('');
      if (!formData.name || !formData.email || !formData.password) {
        setError('Name, email, and password are required');
        return;
      }

      const res = await api.post('/admin/users', formData);
      console.log('AdminUsers: User created:', res.data);
      
      setSuccess('User created successfully');
      setAddDialogOpen(false);
      resetForm();
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('AdminUsers: Error creating user:', err);
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleEditUser = async () => {
    try {
      setError('');
      if (!selectedUser || !formData.name || !formData.email) {
        setError('Name and email are required');
        return;
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      };

      const res = await api.put(`/admin/users/${selectedUser.id}`, updateData);
      console.log('AdminUsers: User updated:', res.data);
      
      setSuccess('User updated successfully');
      setEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('AdminUsers: Error updating user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleBlockUnblock = async (userToToggle) => {
    try {
      setError('');
      const newBlockedStatus = userToToggle.status !== 'blocked';
      
      const res = await api.put(`/admin/users/${userToToggle.id}/block`, {
        blocked: newBlockedStatus
      });
      console.log('AdminUsers: User status changed:', res.data);
      
      setSuccess(`User ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('AdminUsers: Error changing user status:', err);
      setError(err.response?.data?.error || 'Failed to change user status');
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    try {
      setError('');
      if (!window.confirm(`Are you sure you want to delete user "${userToDelete.name}"?`)) {
        return;
      }

      const res = await api.delete(`/admin/users/${userToDelete.id}`);
      console.log('AdminUsers: User deleted:', res.data);
      
      setSuccess('User deleted successfully');
      fetchUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('AdminUsers: Error deleting user:', err);
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const openEditDialog = (userToEdit) => {
    setSelectedUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '', // Don't pre-fill password for security
      phone: userToEdit.phone || '',
      role: userToEdit.role,
      status: userToEdit.status || 'active'
    });
    setEditDialogOpen(true);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      team_leader: 'info',
      worker: 'success'
    };
    return colors[role] || 'default';
  };

  const getStatusColor = (status) => {
    return status === 'blocked' ? 'error' : 'success';
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading users...</Typography>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Users Management
        </Typography>
        
        {/* Search and Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add New User
          </Button>
          
          {/* Search Bar */}
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
            size="small"
          />
          
          {/* Role Filter */}
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="Role"
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="team_leader">Team Leader</MenuItem>
              <MenuItem value="worker">Worker</MenuItem>
            </Select>
          </FormControl>
          
          {/* Status Filter */}
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
          </FormControl>
          
          {/* Clear Filters Button */}
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Results Count */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Showing {filteredUsers.length} of {users.length} users
          {filteredUsers.length !== users.length && (
            <span> (filtered)</span>
          )}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {users.length === 0 
                      ? 'No users found' 
                      : 'No users match your search criteria'
                    }
                  </Typography>
                  {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                    <Button 
                      variant="text" 
                      onClick={clearFilters}
                      sx={{ mt: 1 }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role.replace('_', ' ')}
                      color={getRoleColor(u.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.status || 'active'}
                      color={getStatusColor(u.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(u)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}>
                        <IconButton
                          size="small"
                          onClick={() => handleBlockUnblock(u)}
                          color={u.status === 'blocked' ? 'success' : 'warning'}
                        >
                          {u.status === 'blocked' ? <UnblockIcon /> : <BlockIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(u)}
                          color="error"
                          disabled={u.id === user.id} // Prevent self-deletion
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="team_leader">Team Leader</MenuItem>
                <MenuItem value="worker">Worker</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            resetForm();
            setError('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleAddUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="team_leader">Team Leader</MenuItem>
                <MenuItem value="worker">Worker</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setSelectedUser(null);
            resetForm();
            setError('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleEditUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminUsers;