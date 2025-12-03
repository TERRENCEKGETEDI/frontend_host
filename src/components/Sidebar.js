import React, { useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard,
  People,
  Assessment,
  Description,
  Group,
  Assignment,
  Timeline,
  Work,
  History,
  Person
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user, open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const navigationItems = useMemo(() => {
    const items = {
      admin: [
        { text: 'Dashboard', icon: Dashboard, path: '/admin' },
        { text: 'Users', icon: People, path: '/admin/users' },
        { text: 'Stats', icon: Assessment, path: '/admin/stats' },
        { text: 'Reports', icon: Description, path: '/admin/reports' },
      ],
      manager: [
        { text: 'Dashboard', icon: Dashboard, path: '/manager' },
        { text: 'Teams', icon: Group, path: '/manager/teams' },
        { text: 'Incidents', icon: Assignment, path: '/manager/incidents' },
        { text: 'Stats', icon: Assessment, path: '/manager/stats' },
      ],
      team_leader: [
        { text: 'Dashboard', icon: Dashboard, path: '/teamleader' },
        { text: 'Jobs', icon: Work, path: '/teamleader/jobs' },
        { text: 'Progress', icon: Timeline, path: '/teamleader/progress' },
        { text: 'Reports', icon: Description, path: '/teamleader/reports' },
      ],
      worker: [
        { text: 'Dashboard', icon: Dashboard, path: '/worker' },
        { text: 'My Jobs', icon: Work, path: '/worker/jobs' },
        { text: 'History', icon: History, path: '/worker/history' },
      ],
    };
    return items[user?.role] || [];
  }, [user?.role]);

  const drawerContent = (
    <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary">
          Navigation
        </Typography>
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? onClose : undefined}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <List>
        <ListItem
          component={Link}
          to="/profile"
          selected={location.pathname === '/profile'}
          onClick={isMobile ? onClose : undefined}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: isMobile ? 0 : 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          top: 64, // Below AppBar
          height: 'calc(100% - 64px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;