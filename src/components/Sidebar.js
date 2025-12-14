import React, { useMemo, useState, useEffect } from 'react';
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
  useMediaQuery,
  Badge
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
  Person,
  Message
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';

const Sidebar = ({ user, open, onClose, collapsed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navigationItems = useMemo(() => {
    const items = {
      admin: [
        { text: 'Dashboard', icon: Dashboard, path: '/admin' },
        { text: 'Users', icon: People, path: '/admin/users' },
        { text: 'Stats', icon: Assessment, path: '/admin/stats' },
        // { text: 'Reports', icon: Description, path: '/admin/reports' }, // Hidden for admin role
        { text: 'Messages', icon: Message, path: '/messages' },
      ],
      manager: [
        { text: 'Dashboard', icon: Dashboard, path: '/manager' },
        { text: 'Teams', icon: Group, path: '/manager/teams' },
        { text: 'Incidents', icon: Assignment, path: '/manager/incidents' },
        { text: 'Stats', icon: Assessment, path: '/manager/stats' },
        { text: 'Messages', icon: Message, path: '/messages' },
      ],
      team_leader: [
        { text: 'Dashboard', icon: Dashboard, path: '/teamleader' },
        { text: 'Jobs', icon: Work, path: '/teamleader/jobs' },
        { text: 'Progress', icon: Timeline, path: '/teamleader/progress' },
        { text: 'Reports', icon: Description, path: '/teamleader/reports' },
        { text: 'Messages', icon: Message, path: '/messages' },
      ],
      worker: [
        { text: 'Dashboard', icon: Dashboard, path: '/worker' },
        { text: 'My Jobs', icon: Work, path: '/worker/jobs' },
        { text: 'History', icon: History, path: '/worker/history' },
        { text: 'Messages', icon: Message, path: '/messages' },
      ],
    };
    return items[user?.role] || [];
  }, [user?.role]);

  const drawerContent = (
    <Box sx={{ width: collapsed ? 60 : 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="primary">
            Navigation
          </Typography>
        </Box>
      )}
      {!collapsed && <Divider />}

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
                <Badge badgeContent={item.text === 'Messages' ? unreadCount : 0} color="error">
                  <IconComponent />
                </Badge>
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}
                />
              )}
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
          {!collapsed && <ListItemText primary="Profile" />}
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
        width: isMobile ? 0 : (collapsed ? 60 : 250),
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 60 : 250,
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