import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Layout from './Layout';
import api from '../utils/api';

const Profile = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAuditLogs();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/auth/audit-logs');
      setAuditLogs(res.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      await api.put('/auth/profile', values);
      setMessage('Profile updated successfully!');
      setProfile({ ...profile, ...values });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handlePasswordChange = async (values, { resetForm }) => {
    try {
      await api.put('/auth/change-password', values);
      setMessage('Password changed successfully!');
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error changing password');
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^\+?[\d\s-()]+$/, 'Invalid phone number')
  });

  const passwordValidationSchema = Yup.object({
    oldPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <Typography>Loading profile...</Typography>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        {message && (
          <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3}>
           {/* Profile Information */}
           <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
                >
                  {profile?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5">{profile?.name}</Typography>
                  <Typography color="textSecondary">{profile?.email}</Typography>
                  <Chip
                    label={profile?.role?.replace('_', ' ')}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom>
                Edit Profile Information
              </Typography>

              <Formik
                initialValues={{
                  name: profile?.name || '',
                  email: profile?.email || '',
                  phone: profile?.phone || ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleProfileUpdate}
              >
                {({ errors, touched }) => (
                  <Form>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Field
                          as={TextField}
                          name="name"
                          label="Full Name"
                          fullWidth
                          error={touched.name && !!errors.name}
                          helperText={touched.name && errors.name}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Field
                          as={TextField}
                          name="email"
                          label="Email"
                          type="email"
                          fullWidth
                          error={touched.email && !!errors.email}
                          helperText={touched.email && errors.email}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Field
                          as={TextField}
                          name="phone"
                          label="Phone Number"
                          fullWidth
                          error={touched.phone && !!errors.phone}
                          helperText={touched.phone && errors.phone}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button type="submit" variant="contained" color="primary">
                          Update Profile
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>

              <Formik
                initialValues={{
                  oldPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordChange}
              >
                {({ errors, touched }) => (
                  <Form>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Field
                          as={TextField}
                          name="oldPassword"
                          label="Current Password"
                          type="password"
                          fullWidth
                          error={touched.oldPassword && !!errors.oldPassword}
                          helperText={touched.oldPassword && errors.oldPassword}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Field
                          as={TextField}
                          name="newPassword"
                          label="New Password"
                          type="password"
                          fullWidth
                          error={touched.newPassword && !!errors.newPassword}
                          helperText={touched.newPassword && errors.newPassword}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Field
                          as={TextField}
                          name="confirmPassword"
                          label="Confirm New Password"
                          type="password"
                          fullWidth
                          error={touched.confirmPassword && !!errors.confirmPassword}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Button type="submit" variant="outlined" color="primary">
                          Change Password
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>

          {/* Activity Log */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {auditLogs.slice(0, 10).map((log) => (
                    <ListItem key={log.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={log.action}
                        secondary={new Date(log.created_at).toLocaleString()}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Profile;