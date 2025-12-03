import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from '@mui/material';
import {
  ReportProblem as ReportIcon,
  Timeline as ProgressIcon,
  PriorityHigh as EscalateIcon,
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const actionButtons = [
    {
      title: 'Report an Incident',
      icon: ReportIcon,
      path: '/incident-report',
      color: 'primary',
      description: 'Submit a new incident report'
    },
    {
      title: 'Check Progress Status',
      icon: ProgressIcon,
      path: '/incident-progress',
      color: 'secondary',
      description: 'Track the status of your reports'
    },
    {
      title: 'Escalate an Incident',
      icon: EscalateIcon,
      path: '/incident-report',
      color: 'error',
      description: 'Request urgent attention for critical issues'
    }
  ];

  const features = [
    {
      icon: SpeedIcon,
      title: 'Quick Response',
      description: 'Fast incident reporting and immediate acknowledgment'
    },
    {
      icon: CheckIcon,
      title: 'Real-time Tracking',
      description: 'Monitor progress and updates on your incidents'
    },
    {
      icon: SecurityIcon,
      title: 'Secure & Private',
      description: 'Your reports are handled confidentially and securely'
    }
  ];

  const faqs = [
    {
      question: 'How do I report an incident?',
      answer: 'Click the "Report an Incident" button and fill out the form with details about the issue.'
    },
    {
      question: 'How can I check the status of my report?',
      answer: 'Use the "Check Progress Status" button and enter your incident ID to view updates.'
    },
    {
      question: 'How long does it take to resolve an incident?',
      answer: 'Resolution times vary depending on the severity and type of incident. You can track progress in real-time.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sewage Incident Management
          </Typography>
          <Button
            color="inherit"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Welcome to Sewage Incident Management
          </Typography>
          <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Easily report, track, and escalate incidents for quick resolution. Our system ensures efficient handling of sewage-related issues in your community.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Grid container spacing={3} justifyContent="center" mb={8}>
          {actionButtons.map((button, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  cursor: 'pointer'
                }}
                onClick={() => navigate(button.path)}
              >
                <Box sx={{ mb: 2 }}>
                  <button.icon
                    sx={{
                      fontSize: 48,
                      color: theme.palette[button.color].main
                    }}
                  />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom color="text.primary">
                  {button.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {button.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Box mb={8}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom color="primary">
            Key Features
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <feature.icon
                        sx={{
                          fontSize: 40,
                          color: theme.palette.primary.main
                        }}
                      />
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box mb={4}>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom color="primary">
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;