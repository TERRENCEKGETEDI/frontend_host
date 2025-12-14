import React, { useState } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Notifications from './Notifications';

const Layout = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header user={user} onLogout={onLogout} onMenuClick={handleSidebarToggle} />

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar
          user={user}
          open={sidebarOpen}
          onClose={handleSidebarToggle}
          collapsed={sidebarCollapsed}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${sidebarCollapsed ? 60 : 250}px)` },
            ml: { md: `${sidebarCollapsed ? 60 : 250}px` },
            mt: '64px', // Account for fixed AppBar height
          }}
        >
          <Container maxWidth="lg">
            {children}
          </Container>
        </Box>
      </Box>

      <Footer />
      <Notifications user={user} />
    </Box>
  );
};

export default Layout;