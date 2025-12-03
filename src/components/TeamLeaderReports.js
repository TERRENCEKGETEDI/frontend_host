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
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  DateRange as DateRangeIcon,
  FileDownload as FileDownloadIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const TeamLeaderReports = ({ user, onLogout }) => {
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('assignment_history');

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 60 seconds for reports
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAssignmentHistory(),
        fetchWorkload()
      ]);
    } catch (error) {
      console.error('Error fetching report data:', error);
      showAlert('error', 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const res = await api.get('/teamleader/team/assignment-history');
      setAssignmentHistory(res.data.assignmentHistory || []);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
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

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'default',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDownloadReport = async () => {
    try {
      // For now, this is a placeholder - the backend endpoint exists but may not be fully implemented
      const res = await api.get('/teamleader/reports', {
        params: {
          type: reportType,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      showAlert('success', 'Report generated successfully');
      // In a real implementation, this would trigger a file download
    } catch (error) {
      console.error('Error downloading report:', error);
      showAlert('error', 'Failed to generate report');
    }
  };

  const getFilteredHistory = () => {
    return assignmentHistory.filter(item => {
      const itemDate = new Date(item.assignedAt);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return itemDate >= start && itemDate <= end;
    });
  };

  const getPerformanceMetrics = () => {
    const filtered = getFilteredHistory();
    const totalJobs = filtered.length;
    const completedJobs = filtered.filter(job => job.status === 'completed').length;
    const avgResponseTime = filtered.length > 0
      ? filtered.reduce((sum, job) => sum + (job.responseTime || 0), 0) / filtered.length
      : 0;

    return {
      totalJobs,
      completedJobs,
      completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
      avgResponseTime: Math.round(avgResponseTime / (1000 * 60 * 60) * 100) / 100 // Convert to hours
    };
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading reports...</Typography>
      </Layout>
    );
  }

  const filteredHistory = getFilteredHistory();
  const metrics = getPerformanceMetrics();

  return (
    <Layout user={user} onLogout={onLogout}>
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Report Generation Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generate Reports
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="assignment_history">Assignment History</MenuItem>
                  <MenuItem value="performance">Performance Report</MenuItem>
                  <MenuItem value="workload">Workload Analysis</MenuItem>
                  <MenuItem value="team_activity">Team Activity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleDownloadReport}
                sx={{ height: 56 }}
              >
                Download Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Performance Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Assignments
                  </Typography>
                  <Typography variant="h4">
                    {metrics.totalJobs}
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
                <TrendingUpIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h4">
                    {metrics.completionRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.completionRate}
                    color="success"
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
                <AccessTimeIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4">
                    {metrics.avgResponseTime}h
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
                <BarChartIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completed Jobs
                  </Typography>
                  <Typography variant="h4">
                    {metrics.completedJobs}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different report views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Assignment History" />
          <Tab label="Performance Analytics" />
          <Tab label="Team Workload" />
        </Tabs>
      </Box>

      {/* Assignment History Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Assignment History ({filteredHistory.length} records)
          </Typography>

          {filteredHistory.length === 0 ? (
            <Typography>No assignment history found for the selected date range.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Incident</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Date</TableCell>
                    <TableCell>Started Date</TableCell>
                    <TableCell>Completed Date</TableCell>
                    <TableCell>Response Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.incidentTitle}</TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status.replace('_', ' ')}
                          color={getStatusColor(assignment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {assignment.startedAt
                          ? new Date(assignment.startedAt).toLocaleDateString()
                          : 'Not started'
                        }
                      </TableCell>
                      <TableCell>
                        {assignment.completedAt
                          ? new Date(assignment.completedAt).toLocaleDateString()
                          : 'Not completed'
                        }
                      </TableCell>
                      <TableCell>
                        {assignment.responseTime
                          ? `${Math.round(assignment.responseTime / (1000 * 60 * 60))}h ${Math.round((assignment.responseTime % (1000 * 60 * 60)) / (1000 * 60))}m`
                          : 'N/A'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Performance Analytics Tab */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Performance Analytics
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Completion Trends
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography color="textSecondary" gutterBottom>
                      Period: {dateRange.startDate} to {dateRange.endDate}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Total Assignments: <strong>{metrics.totalJobs}</strong>
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Completed: <strong>{metrics.completedJobs}</strong>
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Completion Rate: <strong>{metrics.completionRate}%</strong>
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.completionRate}
                    color={metrics.completionRate >= 80 ? 'success' : metrics.completionRate >= 60 ? 'warning' : 'error'}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Response Time Analysis
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Average Response Time: <strong>{metrics.avgResponseTime} hours</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Based on {metrics.totalJobs} assignments
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Response time measures the duration from assignment to completion.
                    Lower values indicate better team efficiency.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Team Workload Tab */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Team Workload Analysis
          </Typography>

          {workload && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Workload Status
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Team: {workload.teamName}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Active Members: <strong>{workload.memberStats.activeMembers}</strong>
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Current Capacity: <strong>{workload.teamCapacity.currentCapacity}/{workload.teamCapacity.maxCapacity}</strong>
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Utilization: <strong>{workload.teamCapacity.utilizationRate}%</strong>
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={workload.teamCapacity.utilizationRate}
                      color={workload.teamCapacity.utilizationRate > 90 ? 'error' : workload.teamCapacity.utilizationRate > 70 ? 'warning' : 'success'}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workload Statistics
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        Total Jobs: <strong>{workload.workloadStats.totalJobs}</strong>
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Not Started: <strong>{workload.workloadStats.notStartedJobs}</strong>
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        In Progress: <strong>{workload.workloadStats.inProgressJobs}</strong>
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Completed: <strong>{workload.workloadStats.completedJobs}</strong>
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Completion Rate: <strong>{workload.workloadStats.completionRate}%</strong>
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated: {new Date(workload.lastUpdated).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default TeamLeaderReports;