import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ManagerStats = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef();

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

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('manager_statistics_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
    }
  };

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
      <Box sx={{ p: 3 }} ref={reportRef}>
        <Box
          display="flex"
          alignItems="center"
          mb={4}
          sx={{
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <AnalyticsIcon sx={{ mr: 2, fontSize: 40, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="secondary.main">
            Statistics & Analytics
          </Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end" mb={3} gap={2}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadPDF}
            sx={{
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          >
            Download PDF Report
          </Button>
          <Chip
            icon={<RefreshIcon />}
            label="Refresh"
            onClick={fetchStats}
            sx={{
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          />
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
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
              <CardContent sx={{ textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 50, mb: 1, color: 'white' }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats?.summary?.totalIncidents || 0}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Total Incidents
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
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
              <CardContent sx={{ textAlign: 'center' }}>
                <GroupsIcon sx={{ fontSize: 50, mb: 1, color: 'white' }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats?.summary?.totalTeams || 0}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Total Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
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
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 50, mb: 1, color: 'white' }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats?.summary?.totalMembers || 0}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Team Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
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
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 50, mb: 1, color: 'white' }} />
                <Typography variant="h3" fontWeight="bold">
                  {stats?.summary?.averageCompletionRate || 0}%
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Avg Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <SimpleBarChart
                  data={stats?.incidentsPerDay}
                  title="Incidents per Day (Last 7 Days)"
                  height={250}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <SimpleBarChart
                  data={stats?.incidentsPerWeek}
                  title="Incidents per Week (Last 4 Weeks)"
                  height={250}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <SimpleBarChart
                  data={stats?.incidentsPerMonth}
                  title="Incidents per Month (Last 6 Months)"
                  height={250}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Distribution */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Incident Status Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stats?.statusDistribution && Object.entries(stats.statusDistribution).map(([status, count]) => (
                    <Chip
                      key={status}
                      label={`${status.replace('_', ' ').toUpperCase()}: ${count}`}
                      color={getStatusColor(status)}
                      variant="outlined"
                      sx={{
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Recent Incidents
                </Typography>
                {stats?.recentIncidents && stats.recentIncidents.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: 'grey.50' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.recentIncidents.map((incident, index) => (
                          <TableRow
                            key={incident.id}
                            sx={{
                              '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                              '&:hover': { backgroundColor: 'action.selected' },
                            }}
                          >
                            <TableCell>{incident.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={incident.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(incident.status)}
                                variant="outlined"
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
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No recent incidents
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Performance */}
        <Card
          sx={{
            mt: 3,
            boxShadow: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Team Performance
            </Typography>
            {stats?.teamStats && stats.teamStats.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Team Name</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Members</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Total Jobs</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Completed</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Pending</TableCell>
                      <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Completion Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.teamStats.map((team, index) => (
                      <TableRow
                        key={team.id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                          '&:hover': { backgroundColor: 'action.selected' },
                        }}
                      >
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
                            variant="outlined"
                            sx={{
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No teams found
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default ManagerStats;