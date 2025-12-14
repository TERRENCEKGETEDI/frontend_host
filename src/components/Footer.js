import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import Logo from '../amanziguard.png';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#e3f2fd',
        borderTop: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <img src={Logo} alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
              <Typography variant="h6" color="text.primary">
                AmanziGuard
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Efficiently managing sewage incidents and maintenance for our community.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link href="/incident-report" color="inherit" display="block" sx={{ mb: 1 }}>
              Report Incident
            </Link>
            <Link href="/incident-progress" color="inherit" display="block" sx={{ mb: 1 }}>
              Check Progress
            </Link>
            <Link href="/public" color="inherit" display="block">
              Public Dashboard
            </Link>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Support
            </Typography>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
              Terms of Service
            </Link>
            <Link href="#" color="inherit" display="block">
              Contact Us
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} AmanziGuard®. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;