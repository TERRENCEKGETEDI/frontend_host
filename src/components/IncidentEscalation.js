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
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import api from '../utils/api';

const IncidentEscalation = () => {
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        Escalate an Incident
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Request urgent attention for critical incidents that need immediate manager intervention.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EscalateIcon sx={{ fontSize: 32, color: 'error.main', mr: 2 }} />
              <Typography variant="h5" component="h2">
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
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<SendIcon />}
                        disabled={loading}
                        sx={{ py: 1.5, fontSize: '1.1rem' }}
                      >
                        {loading ? 'Submitting...' : 'Escalate Incident'}
                      </Button>
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
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                What happens when you escalate?
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                  • Incident status is updated to "escalated"
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                  • Managers are immediately notified
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                  • Priority handling is assigned
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                  • You will receive updates on progress
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
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