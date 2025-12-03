import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Button
} from '@mui/material';
import {
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import api from '../utils/api';

const SLACompliance = ({ teamId, user }) => {
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSLAData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchSLAData, 60000);
    return () => clearInterval(interval);
  }, [teamId]);

  const fetchSLAData = async () => {
    try {
      if (refreshing) setRefreshing(false);
      else setLoading(true);
      
      const res = await api.get(`/manager/teams/sla-compliance`);
      setSlaData(res.data.data);
    } catch (error) {
      console.error('Error fetching SLA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSLAColor = (complianceRate) => {
    if (complianceRate >= 95) return 'success';
    if (complianceRate >= 85) return 'warning';
    return 'error';
  };

  const getSLAIcon = (complianceRate) => {
    if (complianceRate >= 95) return <CheckCircleIcon color="success" />;
    if (complianceRate >= 85) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading SLA compliance data...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!slaData || slaData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No SLA compliance data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          SLA Compliance & Incident Prioritization
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchSLAData}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* SLA Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {slaData.map((team) => (
          <Grid item xs={12} md={6} key={team.teamId}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h3">
                    {team.teamName}
                  </Typography>
                  {getSLAIcon(team.compliance.complianceRate)}
                </Box>
                
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="textSecondary">
                      SLA Compliance Rate
                    </Typography>
                    <Typography variant="h6" color={`${getSLAColor(team.compliance.complianceRate)}.main`}>
                      {team.compliance.complianceRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={team.compliance.complianceRate}
                    color={getSLAColor(team.compliance.complianceRate)}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">
                      Total Incidents
                    </Typography>
                    <Typography variant="h6">
                      {team.compliance.totalIncidents}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" variant="body2">
                      SLA Compliant
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {team.compliance.slaCompliantIncidents}
                    </Typography>
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Typography color="textSecondary" variant="body2">
                    Average Response Time
                  </Typography>
                  <Typography variant="h6">
                    {team.compliance.averageResponseTime} hours
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* SLA Performance Trends */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            SLA Performance Overview
          </Typography>
          
          {slaData.some(team => team.compliance.complianceRate < 85) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Some teams are below SLA compliance threshold (85%). Review and take corrective action.
            </Alert>
          )}

          {slaData.some(team => team.compliance.complianceRate >= 95) && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Excellent! Some teams are maintaining high SLA compliance rates (≥95%).
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <SpeedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  System Average SLA
                </Typography>
                <Typography variant="h4" color="primary">
                  {Math.round(slaData.reduce((sum, team) => sum + team.compliance.complianceRate, 0) / slaData.length)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <TimerIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Total Incidents (30 days)
                </Typography>
                <Typography variant="h4" color="info">
                  {slaData.reduce((sum, team) => sum + team.compliance.totalIncidents, 0)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  SLA Compliant Incidents
                </Typography>
                <Typography variant="h4" color="success">
                  {slaData.reduce((sum, team) => sum + team.compliance.slaCompliantIncidents, 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Priority Matrix */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Incident Priority Matrix & SLA Targets
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Priority Level</strong></TableCell>
                  <TableCell><strong>SLA Target</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Examples</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Chip label="Critical" color="error" size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error">
                      4 hours
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Emergency situations requiring immediate attention
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Flooding, sewage backup, public health hazards
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="High" color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="warning">
                      8 hours
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Urgent issues affecting operations
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Blocked drains, overflow incidents
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Medium" color="info" size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="info">
                      24 hours
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Standard service requests
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Routine maintenance, minor issues
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Chip label="Low" color="default" size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      48 hours
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Non-urgent requests
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Follow-up inquiries, documentation
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> SLA compliance is calculated based on the completion time of incidents 
              compared to their priority-based target times. Teams are automatically prioritized based on 
              capacity, workload, and historical performance.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SLACompliance;