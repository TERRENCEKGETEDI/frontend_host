import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const ManagerStats = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/manager/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const SimpleBarChart = ({ data, title, height = 200 }) => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    const maxValue = Math.max(...data.map(d => d.count));
    const barWidth = 100 / data.length;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height, gap: 1 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  height: `${(item.count / maxValue) * 150}px`,
                  backgroundColor: 'primary.main',
                  borderRadius: 1,
                  minHeight: '5px'
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                {item.date ? new Date(item.date).getDate() : item.week || item.month}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {item.count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
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

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Statistics & Analytics
          </Typography>
          <Box>
            <Chip
              icon={<RefreshIcon />}
              label="Refresh"
              onClick={fetchStats}
              sx={{ mr: 1 }}
            />
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats?.summary?.totalIncidents || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Incidents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <GroupsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats?.summary?.totalTeams || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats?.summary?.totalMembers || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Team Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {stats?.summary?.averageCompletionRate || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper>
              <SimpleBarChart 
                data={stats?.incidentsPerDay} 
                title="Incidents per Day (Last 7 Days)"
                height={250}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper>
              <SimpleBarChart 
                data={stats?.incidentsPerWeek} 
                title="Incidents per Week (Last 4 Weeks)"
                height={250}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper>
              <SimpleBarChart 
                data={stats?.incidentsPerMonth} 
                title="Incidents per Month (Last 6 Months)"
                height={250}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Status Distribution */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Incident Status Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stats?.statusDistribution && Object.entries(stats.statusDistribution).map(([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status.replace('_', ' ').toUpperCase()}: ${count}`}
                      color={getStatusColor(status)}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Incidents
                </Typography>
                {stats?.recentIncidents && stats.recentIncidents.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.recentIncidents.map((incident) => (
                          <TableRow key={incident.id}>
                            <TableCell>{incident.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={incident.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(incident.status)}
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(incident.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent incidents
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Performance */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Performance
            </Typography>
            {stats?.teamStats && stats.teamStats.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team Name</TableCell>
                      <TableCell align="center">Members</TableCell>
                      <TableCell align="center">Total Jobs</TableCell>
                      <TableCell align="center">Completed</TableCell>
                      <TableCell align="center">Pending</TableCell>
                      <TableCell align="center">Completion Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.teamStats.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            {team.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{team.memberCount}</TableCell>
                        <TableCell align="center">{team.totalJobs}</TableCell>
                        <TableCell align="center">{team.completedJobs}</TableCell>
                        <TableCell align="center">{team.pendingJobs}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${team.completionRate}%`}
                            color={team.completionRate >= 80 ? 'success' : team.completionRate >= 50 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No teams found
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default ManagerStats;