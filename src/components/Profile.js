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
import { Person as PersonIcon, Timeline as TimelineIcon, Edit as EditIcon, Lock as LockIcon, Save as SaveIcon } from '@mui/icons-material';
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
          <PersonIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary.main">
            My Profile
          </Typography>
        </Box>

        {message && (
          <Alert
            severity={message.includes('Error') ? 'error' : 'success'}
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 2,
              '& .MuiAlert-icon': { fontSize: 24 }
            }}
          >
            {message}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Profile Information Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Profile Header */}
                <Box
                  display="flex"
                  alignItems="center"
                  mb={4}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mr: 3,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      border: '3px solid rgba(255,255,255,0.3)',
                      fontSize: 36,
                      fontWeight: 'bold',
                    }}
                  >
                    {profile?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {profile?.name}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                      {profile?.email}
                    </Typography>
                    <Chip
                      label={profile?.role?.replace('_', ' ')}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        fontWeight: 'bold',
                      }}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Edit Profile Section */}
                <Box mb={4}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      Edit Profile Information
                    </Typography>
                  </Box>

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
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Field
                              as={TextField}
                              name="name"
                              label="Full Name"
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { boxShadow: 2 },
                                  '&.Mui-focused': { boxShadow: 3 },
                                },
                              }}
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
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { boxShadow: 2 },
                                  '&.Mui-focused': { boxShadow: 3 },
                                },
                              }}
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
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { boxShadow: 2 },
                                  '&.Mui-focused': { boxShadow: 3 },
                                },
                              }}
                              error={touched.phone && !!errors.phone}
                              helperText={touched.phone && errors.phone}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Button
                              type="submit"
                              variant="contained"
                              startIcon={<SaveIcon />}
                              sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 4,
                                },
                              }}
                            >
                              Update Profile
                            </Button>
                          </Grid>
                        </Grid>
                      </Form>
                    )}
                  </Formik>
                </Box>

                <Divider sx={{ my: 4, borderColor: 'grey.300' }} />

                {/* Change Password Section */}
                <Box>
                  <Box display="flex" alignItems="center" mb={3}>
                    <LockIcon sx={{ mr: 2, color: 'secondary.main' }} />
                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                      Change Password
                    </Typography>
                  </Box>

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
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Field
                              as={TextField}
                              name="oldPassword"
                              label="Current Password"
                              type="password"
                              fullWidth
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { boxShadow: 2 },
                                  '&.Mui-focused': { boxShadow: 3 },
                                },
                              }}
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
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { boxShadow: 2 },
                                  '&.Mui-focused': { boxShadow: 3 },
                                },
                              }}
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
                              variant="outlined"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease',
                                  '&:hover': { boxShadow: 2 },
                                  '&.Mui-focused': { boxShadow: 3 },
                                },
                              }}
                              error={touched.confirmPassword && !!errors.confirmPassword}
                              helperText={touched.confirmPassword && errors.confirmPassword}
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Button
                              type="submit"
                              variant="outlined"
                              startIcon={<LockIcon />}
                              sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                borderColor: 'secondary.main',
                                color: 'secondary.main',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: 4,
                                  backgroundColor: 'secondary.main',
                                  color: 'white',
                                },
                              }}
                            >
                              Change Password
                            </Button>
                          </Grid>
                        </Grid>
                      </Form>
                    )}
                  </Formik>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Log Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: 'fit-content',
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <TimelineIcon sx={{ mr: 2, color: 'info.main' }} />
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    Recent Activity
                  </Typography>
                </Box>

                <List sx={{ p: 0 }}>
                  {auditLogs.slice(0, 10).map((log, index) => (
                    <ListItem
                      key={log.id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: index < auditLogs.slice(0, 10).length - 1 ? '1px solid' : 'none',
                        borderColor: 'grey.100',
                        '&:hover': { backgroundColor: 'action.hover' },
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium" color="text.primary">
                            {log.action}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.created_at).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {auditLogs.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent activity
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Profile;