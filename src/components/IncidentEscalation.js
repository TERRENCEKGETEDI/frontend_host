import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  PriorityHigh as EscalateIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const IncidentEscalation = () => {
  const navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    navigate('/');
  };

  const validationSchema = Yup.object({
    incidentNumber: Yup.string()
      .required('Incident number is required')
      .matches(/^INC\d{13}[A-Z0-9]{5}$/, 'Invalid incident number format (should be INC followed by 13 digits and 5 characters)'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    fullName: Yup.string()
      .required('Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be less than 100 characters'),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await api.post('/public/escalate', {
        incidentNumber: values.incidentNumber,
        description: values.description,
        fullName: values.fullName,
      });

      setSubmitStatus({
        type: 'success',
        message: response.data.message,
      });
      resetForm();
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: err.response?.data?.error || 'Failed to escalate incident. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ color: '#333', fontWeight: 'bold' }}>
        Escalate an Incident
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4, color: '#666' }}>
        Request urgent attention for critical incidents that need immediate manager intervention.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EscalateIcon sx={{ fontSize: 32, color: '#666', mr: 2 }} />
              <Typography variant="h5" component="h2" sx={{ color: '#333', fontWeight: 'bold' }}>
                Escalation Request
              </Typography>
            </Box>

            <Formik
              initialValues={{
                incidentNumber: '',
                description: '',
                fullName: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="incidentNumber"
                        label="Incident Number"
                        fullWidth
                        error={touched.incidentNumber && !!errors.incidentNumber}
                        helperText={touched.incidentNumber && errors.incidentNumber}
                        placeholder="Enter your incident number (e.g., INC1765674277167ABCDE)"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '& fieldset': {
                              border: 'none',
                            },
                            '&:hover': {
                              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 3px 8px rgba(25,118,210,0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="fullName"
                        label="Your Full Name"
                        fullWidth
                        error={touched.fullName && !!errors.fullName}
                        helperText={touched.fullName && errors.fullName}
                        placeholder="Enter your full name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '& fieldset': {
                              border: 'none',
                            },
                            '&:hover': {
                              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 3px 8px rgba(25,118,210,0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Field
                        as={TextField}
                        name="description"
                        label="Escalation Reason"
                        fullWidth
                        multiline
                        rows={4}
                        error={touched.description && !!errors.description}
                        helperText={touched.description && errors.description}
                        placeholder="Please describe why this incident needs urgent attention and any additional details..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '& fieldset': {
                              border: 'none',
                            },
                            '&:hover': {
                              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 3px 8px rgba(25,118,210,0.2)',
                            },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          startIcon={<SendIcon />}
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            backgroundColor: '#1976d2',
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: '#1565c0',
                            }
                          }}
                        >
                          {loading ? 'Submitting...' : 'Escalate Incident'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="inherit"
                          fullWidth
                          startIcon={<HomeIcon />}
                          onClick={handleCancel}
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            borderColor: '#666',
                            color: '#666',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#999',
                              backgroundColor: '#f5f5f5',
                            }
                          }}
                        >
                          Cancel & Go Home
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>

            {submitStatus && (
              <Alert
                severity={submitStatus.type}
                sx={{ mt: 3 }}
              >
                {submitStatus.message}
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                What happens when you escalate?
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" component="div" sx={{ mb: 1, color: '#555' }}>
                  • Incident status is updated to "escalated"
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 1, color: '#555' }}>
                  • Managers are immediately notified
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 1, color: '#555' }}>
                  • Priority handling is assigned
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 1, color: '#555' }}>
                  • You will receive updates on progress
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                <strong>Note:</strong> Only use escalation for critical situations that require immediate manager attention.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default IncidentEscalation;