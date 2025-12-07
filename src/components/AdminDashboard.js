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
  Avatar,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  TableChart as TableChartIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api, { getCurrentUser, isAuthenticated } from '../utils/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('AdminDashboard: Fetching dashboard data...');
    try {
      setLoading(true);
      
      // Check authentication status
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      console.log('AdminDashboard: User authenticated:', authenticated);
      console.log('AdminDashboard: Current user:', currentUser);
      
      if (!authenticated) {
        console.error('AdminDashboard: User not authenticated');
        alert('Please log in to access the admin dashboard.');
        return;
      }
      
      if (currentUser?.role !== 'admin') {
        console.error('AdminDashboard: Insufficient permissions - user is not admin');
        alert('Access denied. Admin privileges required.');
        return;
      }
      
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      console.log('AdminDashboard: Users received:', usersRes.data.length);
      console.log('AdminDashboard: Stats received:', statsRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('AdminDashboard: Error fetching dashboard data:', error);
      console.error('AdminDashboard: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        console.error('AdminDashboard: Authentication failed - token may be invalid or expired');
        alert('Authentication failed. Please log in again.');
        // Optionally trigger logout
        // onLogout();
      } else if (error.response?.status === 403) {
        console.error('AdminDashboard: Access forbidden - insufficient permissions');
        alert('You do not have permission to access this data.');
      } else {
        console.error('AdminDashboard: Server error:', error.response?.data || error.message);
        alert('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading dashboard...</Typography>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
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
        <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h3" component="h2" fontWeight="bold" color="primary.main">
          Admin Dashboard
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <PeopleIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Card
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <HistoryIcon sx={{ mr: 2, fontSize: 40, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Activity Logs
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalActivityLogs || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
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
        <TableChartIcon sx={{ mr: 2, fontSize: 32, color: 'info.main' }} />
        <Typography variant="h5" component="h2" fontWeight="bold" color="text.primary">
          Recent Users
        </Typography>
      </Box>
      <Card
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead
              sx={{
                background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                '& th': {
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  borderBottom: 'none',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }
              }}
            >
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.slice(0, 10).map((u, index) => (
                <TableRow
                  key={u.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'grey.25',
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: 'background.paper',
                    },
                    '&:hover': {
                      backgroundColor: 'info.50',
                      transform: 'scale(1.002)',
                      transition: 'all 0.2s ease',
                      boxShadow: 'inset 0 0 0 1px rgba(33, 150, 243, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <TableCell>
                    <Avatar
                      sx={{
                        bgcolor: 'info.main',
                        width: 36,
                        height: 36,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(33, 150, 243, 0.2)',
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {u.name}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.role.replace('_', ' ')}
                      color={getRoleColor(u.role)}
                      size="small"
                      variant="filled"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.status || 'Active'}
                      color={u.status === 'Active' ? 'success' : 'default'}
                      size="small"
                      variant="filled"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Reports Section */}
      <Box
        display="flex"
        alignItems="center"
        mb={4}
        sx={{
          mt: 5,
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <AssessmentIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h3" component="h2" fontWeight="bold" color="primary.main">
          System Reports
        </Typography>
      </Box>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Generate and download comprehensive system reports for analysis and compliance
      </Typography>

      <Grid container spacing={4}>
        {/* Users Report Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
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
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <PeopleIcon sx={{ mr: 2, fontSize: 48, color: 'white' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Users Report
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Complete user database with roles and status
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Chip
                  label="CSV Format"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
                <Chip
                  label="Real-time Data"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => alert('Download functionality would be implemented here')}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                  px: 3,
                  py: 1.5,
                }}
                fullWidth
              >
                Download Users Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Logs Report Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
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
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <BarChartIcon sx={{ mr: 2, fontSize: 48, color: 'white' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Activity Logs Report
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    System activity tracking and audit trail
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Chip
                  label="CSV Format"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
                <Chip
                  label="Audit Trail"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => alert('Download functionality would be implemented here')}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                  px: 3,
                  py: 1.5,
                }}
                fullWidth
              >
                Download Activity Logs Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Information */}
      <Card
        sx={{
          mt: 4,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
            Report Information
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            These reports contain sensitive system data. Ensure proper handling and storage according to your organization's data protection policies.
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<FileDownloadIcon />}
              label="Auto-generated CSV files"
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<BarChartIcon />}
              label="Timestamped downloads"
              variant="outlined"
              color="secondary"
            />
            <Chip
              icon={<AssessmentIcon />}
              label="Compliance ready"
              variant="outlined"
              color="success"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Profiles Section */}
      <Box
        display="flex"
        alignItems="center"
        mb={4}
        sx={{
          mt: 5,
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <PeopleIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h3" component="h2" fontWeight="bold" color="primary.main">
          User Profiles Management
        </Typography>
      </Box>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Manage and view user profiles with comprehensive editing capabilities
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Management Cards */}
        {users.slice(0, 6).map((user, index) => (
          <Grid item xs={12} md={6} lg={4} key={user.id}>
            <Card
              sx={{
                height: '100%',
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mr: 3,
                      bgcolor: 'primary.main',
                      fontSize: 32,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {user.email}
                    </Typography>
                    <Chip
                      label={user.role.replace('_', ' ')}
                      color={getRoleColor(user.role)}
                      size="small"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </Box>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={() => alert(`Viewing profile for ${user.name}`)}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => alert(`Editing profile for ${user.name}`)}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '&:hover': {
                        borderColor: 'secondary.dark',
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Information */}
      <Card
        sx={{
          mt: 4,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary.main" fontWeight="bold">
            Profile Management Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            User profiles contain sensitive information. Ensure proper authorization before making changes and maintain audit trails for all profile modifications.
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<PeopleIcon />}
              label="User management"
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<EditIcon />}
              label="Profile editing"
              variant="outlined"
              color="secondary"
            />
            <Chip
              icon={<VisibilityIcon />}
              label="View permissions"
              variant="outlined"
              color="success"
            />
          </Box>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default AdminDashboard;