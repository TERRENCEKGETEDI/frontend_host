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
import { keyframes } from '@mui/material/styles';
import {
  ReportProblem as ReportIcon,
  Timeline as ProgressIcon,
  PriorityHigh as EscalateIcon,
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Background from '../Background.png';
import Logo from '../amanziguard.png';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Define wave animation keyframes
  const wave = keyframes`
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0px);
    }
  `;

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
    },
    {
      title: 'Chat on WhatsApp',
      icon: WhatsAppIcon,
      external: true,
      whatsappUrl: 'https://wa.me/27716669966?text=Hi',
      color: 'success',
      description: 'Get instant help via WhatsApp'
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
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundImage: `url(${Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header */}
      <AppBar position="fixed" color="primary" elevation={2}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <img src={Logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
            <Typography variant="h6" component="div">
              AmanziGuard
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4, pt: '80px' }}>
        {/* Hero Section */}
        <Box
          textAlign="center"
          mb={6}
          sx={{
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 4,
            p: 4,
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome to AmanziGuard
          </Typography>
          <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Easily report, track, and escalate incidents for quick resolution. Our system ensures efficient handling of sewage-related issues in your community.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Grid container spacing={3} justifyContent="center" mb={8}>
          {actionButtons.map((button, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                  borderRadius: 4,
                  backgroundColor: '#e3f2fd',
                  animation: `${wave} 3s ease-in-out infinite`,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (button.external) {
                    window.open(button.whatsappUrl, '_blank');
                  } else {
                    navigate(button.path);
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <button.icon
                    sx={{
                      fontSize: 48,
                      color: theme.palette[button.color].main
                    }}
                  />
                </Box>
                <Typography variant="h6" component="h3" gutterBottom color="text.primary" sx={{ animation: `${wave} 3s ease-in-out infinite` }}>
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
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Key Features
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', backgroundColor: '#e3f2fd', borderRadius: 4 }}>
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
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1, backgroundColor: '#e3f2fd', borderRadius: 4 }}>
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