import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DateRange,
  GetApp,
  Refresh,
  ExpandMore,
  People,
  Timeline,
  Search
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminStats = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [drilldownData, setDrilldownData] = useState(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownType, setDrilldownType] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const chartRefs = useRef({});

  useEffect(() => {
    fetchEnhancedStats();
  }, [timePeriod, dateRange]);

  const fetchEnhancedStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('period', timePeriod);
      
      if (dateRange.startDate && dateRange.endDate) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const response = await api.get(`/admin/stats/enhanced?${params}`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching enhanced stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchEnhancedStats();
    }
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleDrillDown = async (type, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('type', type);
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      // Add search term for activity type
      if (type === 'activity' && activitySearchTerm) {
        params.append('search', activitySearchTerm);
      }

      const response = await api.get(`/admin/stats/drilldown?${params}`);
      setDrilldownData(response.data);
      setDrilldownType(type);
      setDrilldownOpen(true);
    } catch (err) {
      console.error('Error fetching drilldown data:', err);
      setError('Failed to load detailed data.');
    }
  };

  const handleActivitySearch = () => {
    if (drilldownType === 'activity' && activitySearchTerm.trim()) {
      handleDrillDown('activity');
    }
  };

  const clearActivitySearch = () => {
    setActivitySearchTerm('');
    if (drilldownType === 'activity') {
      handleDrillDown('activity');
    }
  };

  const exportChart = (chartId, filename) => {
    const chart = chartRefs.current[chartId];
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
    }
  };

  const exportAllCharts = () => {
    const charts = ['userTrendChart', 'activityChart'];
    charts.forEach((chartId, index) => {
      setTimeout(() => exportChart(chartId, `chart_${index + 1}`), index * 500);
    });
  };

  // Chart data preparation functions
  const prepareComparativeData = (data, label) => {
    if (!data || !data.current || !data.previous) {
      return { labels: [], datasets: [] };
    }
    
    // Process current data
    const currentData = data.current.map(item => ({
      date: item.date,
      count: parseInt(item.count) || 0
    }));
    
    // Process previous data  
    const previousData = data.previous.map(item => ({
      date: item.date,
      count: parseInt(item.count) || 0
    }));
    
    // Combine all dates and sort them
    const allDates = [
      ...currentData.map(item => item.date),
      ...previousData.map(item => item.date)
    ].filter((date, index, arr) => arr.indexOf(date) === index);
    
    allDates.sort();
    
    const labels = allDates.map(date => format(new Date(date), 'MMM dd'));
    
    // Create datasets for current and previous periods
    const currentDataset = allDates.map(date => {
      const item = currentData.find(d => d.date === date);
      return item ? item.count : 0;
    });
    
    const previousDataset = allDates.map(date => {
      const item = previousData.find(d => d.date === date);
      return item ? item.count : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: `Current ${label}`,
          data: currentDataset,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: false
        },
        {
          label: `Previous ${label}`,
          data: previousDataset,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: false,
          borderDash: [5, 5]
        }
      ]
    };
  };

  const prepareTimeSeriesData = (data, label) => {
    if (!data || !data.current || !data.previous) {
      return { labels: [], datasets: [] };
    }
    return prepareComparativeData(data, label);
  };



  const comparativeChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          padding: 15,
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 10
          },
          maxTicksLimit: 8
        }
      },
      y: {
        beginAtZero: true,
        stacked: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 10
          },
          stepSize: 1
        }
      }
    },
    elements: {
      line: {
        borderJoinStyle: 'round'
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  const chartOptions = comparativeChartOptions;



  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading statistics...</Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<Refresh />} 
          onClick={fetchEnhancedStats}
        >
          Retry
        </Button>
      </Layout>
    );
  }

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
        <Timeline sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
          System Statistics Dashboard
        </Typography>
      </Box>

      {/* Controls */}
      <Card
        sx={{
          mb: 3,
          boxShadow: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          backgroundColor: 'background.paper',
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timePeriod}
                  label="Time Period"
                  onChange={(e) => handleTimePeriodChange(e.target.value)}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<DateRange />}
                  onClick={applyDateFilter}
                  disabled={!dateRange.startDate || !dateRange.endDate}
                >
                  Apply Filter
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearDateFilter}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Box mt={2} display="flex" gap={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchEnhancedStats}
            >
              Refresh Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={exportAllCharts}
            >
              Export All Charts
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
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
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Total Users
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.totalUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card
            sx={{
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
            <CardContent>
              <Box display="flex" alignItems="center">
                <Timeline sx={{ mr: 2, fontSize: 50, color: 'white' }} />
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Activity Logs
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.totalActivityLogs || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={6}>
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">User Growth: This {timePeriod} vs Previous {timePeriod}</Typography>
                <IconButton onClick={() => exportChart('userTrendChart', 'user_growth')}>
                  <GetApp />
                </IconButton>
              </Box>
              <div style={{ height: '300px', position: 'relative' }}>
                <Line
                  ref={(ref) => (chartRefs.current.userTrendChart = ref)}
                  data={prepareTimeSeriesData(stats?.userTimeSeries, 'Users')}
                  options={chartOptions}
                />
              </div>
              
              {/* User Growth Summary */}
              {stats?.userTimeSeries?.summary && (
                <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                  <Chip
                    label={`Current: ${stats.userTimeSeries.summary.current}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Previous: ${stats.userTimeSeries.summary.previous}`}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Change: ${stats.userTimeSeries.summary.change > 0 ? '+' : ''}${stats.userTimeSeries.summary.change} (${stats.userTimeSeries.summary.changePercent}%)`}
                    color={stats.userTimeSeries.summary.change >= 0 ? 'success' : 'error'}
                    variant="filled"
                  />
                </Box>
              )}
              <Box mt={2}>
                <Button
                  size="small"
                  startIcon={<ExpandMore />}
                  onClick={() => handleDrillDown('users')}
                >
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Logs Chart */}
        <Grid item xs={12} lg={6}>
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">System Activity</Typography>
                <IconButton onClick={() => exportChart('activityChart', 'system_activity')}>
                  <GetApp />
                </IconButton>
              </Box>
              <div style={{ height: '300px', position: 'relative' }}>
                <Line
                  ref={(ref) => (chartRefs.current.activityChart = ref)}
                  data={prepareTimeSeriesData(stats?.activityTimeSeries, 'Activity Logs')}
                  options={chartOptions}
                />
              </div>
              <Box mt={2}>
                <Button
                  size="small"
                  startIcon={<ExpandMore />}
                  onClick={() => handleDrillDown('activity')}
                >
                  View Details
                </Button>
              </Box>
              
              {/* Activity Search Bar */}
              <Box mt={2} display="flex" gap={1} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search activities..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleActivitySearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleActivitySearch}
                  disabled={!activitySearchTerm.trim()}
                >
                  Search
                </Button>
                {activitySearchTerm && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={clearActivitySearch}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Drill-down Dialog */}
      <Dialog
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Detailed {drilldownType.charAt(0).toUpperCase() + drilldownType.slice(1)} Data
        </DialogTitle>
        <DialogContent>
          {drilldownData && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {drilldownData.type === 'users' && (
                      <>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                      </>
                    )}
                    {drilldownData.type === 'incidents' && (
                      <>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Created At</TableCell>
                      </>
                    )}
                    {drilldownData.type === 'activity' && (
                      <>
                        <TableCell>User</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Table</TableCell>
                        <TableCell>Created At</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drilldownData.data.map((item, index) => (
                    <TableRow key={index}>
                      {drilldownData.type === 'users' && (
                        <>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.role}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              size="small"
                              color={item.status === 'active' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                        </>
                      )}
                      {drilldownData.type === 'incidents' && (
                        <>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              size="small"
                              color={
                                item.status === 'Completed' ? 'success' :
                                item.status === 'In Progress' ? 'warning' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                        </>
                      )}
                      {drilldownData.type === 'activity' && (
                        <>
                          <TableCell>{item.User?.name || 'Unknown'}</TableCell>
                          <TableCell>{item.action}</TableCell>
                          <TableCell>{item.table_name}</TableCell>
                          <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminStats;