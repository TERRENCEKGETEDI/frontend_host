import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const IncidentHeatmap = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapCenter, setMapCenter] = useState([-26.2041, 28.0473]); // Johannesburg coordinates as default

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/manager/incidents');
      const incidentsWithCoords = response.data.filter(incident =>
        incident.latitude && incident.longitude
      );
      setIncidents(incidentsWithCoords);
      setFilteredIncidents(incidentsWithCoords);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const getStatusCategory = (status) => {
    const normalizedStatus = status.toLowerCase().replace(' ', '_');
    if (['not_started', 'verified', 'pending'].includes(normalizedStatus)) {
      return 'pending';
    } else if (['in_progress', 'assigned'].includes(normalizedStatus)) {
      return 'incomplete';
    } else if (['completed'].includes(normalizedStatus)) {
      return 'complete';
    }
    return 'pending'; // default
  };

  const getMarkerColor = (status) => {
    const category = getStatusCategory(status);
    switch (category) {
      case 'pending':
        return 'red';
      case 'incomplete':
        return 'orange';
      case 'complete':
        return 'green';
      default:
        return 'blue';
    }
  };

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const applyFilters = () => {
    let filtered = incidents;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => getStatusCategory(incident.status) === statusFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(incident => new Date(incident.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(incident => new Date(incident.created_at) <= end);
    }

    setFilteredIncidents(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setFilteredIncidents(incidents);
  };

  // Auto-apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [statusFilter, startDate, endDate, incidents]);

  const getStatusCounts = () => {
    const counts = { pending: 0, incomplete: 0, complete: 0 };
    filteredIncidents.forEach(incident => {
      const category = getStatusCategory(incident.status);
      counts[category]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Incident Heatmap
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
                <MenuItem value="complete">Complete</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '40px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Status Summary */}
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip
            label={`Pending: ${statusCounts.pending}`}
            sx={{ backgroundColor: 'red', color: 'white' }}
            size="small"
          />
          <Chip
            label={`Incomplete: ${statusCounts.incomplete}`}
            sx={{ backgroundColor: 'orange', color: 'white' }}
            size="small"
          />
          <Chip
            label={`Complete: ${statusCounts.complete}`}
            sx={{ backgroundColor: 'green', color: 'white' }}
            size="small"
          />
        </Box>

        {/* Map */}
        <Box sx={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredIncidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={createCustomIcon(getMarkerColor(incident.status))}
              >
                <Tooltip>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {incident.title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID:</strong> {incident.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {incident.status.replace('_', ' ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(incident.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {incident.location || 'N/A'}
                    </Typography>
                  </Box>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IncidentHeatmap;