import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Schedule,
  Build,
  Done,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../utils/api';

const PublicProgress = () => {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validationSchema = Yup.object({
    trackingId: Yup.string()
      .required('Tracking ID is required')
      .matches(/^INC\d{13}[A-Z0-9]{5}$/, 'Invalid tracking ID format (should be INC followed by 13 digits and 5 characters)'),
  });

  const handleSearch = async (values) => {
    setLoading(true);
    setError('');
    setIncident(null);

    try {
      const response = await api.get(`/public/incidents/status/${values.trackingId}`);
      setIncident(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Incident not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'default',
      'In Progress': 'warning',
      'Completed': 'success',
      'Cancelled': 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Not Started': <Schedule />,
      'In Progress': <Build />,
      'Completed': <Done />,
      'Cancelled': <CheckCircle />,
    };
    return icons[status] || <Schedule />;
  };

  const getProgressValue = (status) => {
    const progress = {
      'Not Started': 0,
      'In Progress': 50,
      'Completed': 100,
      'Cancelled': 0,
    };
    return progress[status] || 0;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        Check Incident Progress
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Enter your tracking ID to check the status of your incident report.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Formik
          initialValues={{ trackingId: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSearch}
        >
          {({ errors, touched }) => (
            <Form>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Field
                    as={TextField}
                    name="trackingId"
                    label="Tracking ID"
                    fullWidth
                    error={touched.trackingId && !!errors.trackingId}
                    helperText={touched.trackingId && errors.trackingId}
                    placeholder="Enter your tracking ID (e.g., INC1765674277167ABCDE)"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    startIcon={<Search />}
                    disabled={loading}
                    sx={{ height: '56px' }}
                  >
                    {loading ? 'Searching...' : 'Check Status'}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {incident && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Incident Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tracking ID
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {incident.trackingId}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Incident Type
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {incident.title}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {incident.description}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {incident.location}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reported Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(incident.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getStatusIcon(incident.status)}
                  <Chip
                    label={incident.status}
                    color={getStatusColor(incident.status)}
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(incident.status)}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {getProgressValue(incident.status)}% Complete
                </Typography>
              </Grid>

              {incident.assignedTeam && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Assignment Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Team: {incident.assignedTeam.name}
                  </Typography>
                  {incident.assignedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Assigned Date: {new Date(incident.assignedAt).toLocaleDateString()}
                    </Typography>
                  )}
                </Grid>
              )}

              {incident.images && incident.images.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Attached Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {incident.images.length} image(s) attached
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default PublicProgress;