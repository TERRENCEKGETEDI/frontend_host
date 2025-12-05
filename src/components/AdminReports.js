import React from 'react';
import { Typography, Button, Box, Card, CardContent, Grid, Chip, LinearProgress } from '@mui/material';
import { Download as DownloadIcon, Assessment as AssessmentIcon, People as PeopleIcon, Timeline as TimelineIcon, FileDownload as FileDownloadIcon, BarChart as BarChartIcon, Security as SecurityIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const AdminReports = ({ user, onLogout }) => {
  const downloadReport = async (type) => {
    try {
      const response = await api.get(`/admin/reports/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
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
        <AssessmentIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
          System Reports
        </Typography>
      </Box>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Generate and download comprehensive system reports for analysis and compliance
      </Typography>

      <Grid container spacing={4}>
        {/* System Performance Report Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                    System Performance
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Server metrics and performance analytics
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Chip
                  label="Real-time Metrics"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
                <Chip
                  label="Performance Data"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                  CPU Usage: 45%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => downloadReport('performance')}
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
                Download Performance Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Users Report Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                onClick={() => downloadReport('users')}
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
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                <TimelineIcon sx={{ mr: 2, fontSize: 48, color: 'white' }} />
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
                onClick={() => downloadReport('activitylogs')}
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

        {/* Security Audit Report Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
                <SecurityIcon sx={{ mr: 2, fontSize: 48, color: 'white' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Security Audit
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Access logs and security monitoring
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Chip
                  label="Security Logs"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
                <Chip
                  label="Compliance"
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
                onClick={() => downloadReport('security')}
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
                Download Security Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Report Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              color: 'primary.main',
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
                <TrendingUpIcon sx={{ mr: 2, fontSize: 48, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Analytics Report
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Usage patterns and trend analysis
                  </Typography>
                </Box>
              </Box>

              <Box mb={3}>
                <Chip
                  label="Trend Analysis"
                  sx={{
                    backgroundColor: 'rgba(25,118,210,0.1)',
                    color: 'primary.main',
                    border: '1px solid rgba(25,118,210,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
                <Chip
                  label="Insights"
                  sx={{
                    backgroundColor: 'rgba(25,118,210,0.1)',
                    color: 'primary.main',
                    border: '1px solid rgba(25,118,210,0.3)',
                    mr: 1,
                    mb: 1,
                  }}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => downloadReport('analytics')}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                  px: 3,
                  py: 1.5,
                }}
                fullWidth
              >
                Download Analytics Report
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
              icon={<DownloadIcon />}
              label="Auto-generated CSV files"
              variant="outlined"
              color="primary"
            />
            <Chip
              icon={<TimelineIcon />}
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
    </Layout>
  );
};

export default AdminReports;