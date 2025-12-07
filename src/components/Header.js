import React, { useState, useMemo, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  ListItemSecondaryAction,
  IconButton as MuiIconButton,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  ExitToApp,
  Person,
  Dashboard,
  People,
  Assessment,
  Description,
  Group,
  Assignment,
  Timeline,
  Work,
  History,
  Clear
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Header = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    // Mark all notifications as read via API
    markAllNotificationsAsRead();
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await api.patch('/notifications/read-all');

      if (response.status === 200) {
        // Update local state
        const updated = notifications.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }));
        setNotifications(updated);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleClearNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);

      if (response.status === 200) {
        // Update local state
        const updated = notifications.filter(n => n.id !== notificationId);
        setNotifications(updated);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      // Delete all notifications via API
      const deletePromises = notifications.map(notification =>
        api.delete(`/notifications/${notification.id}`)
      );

      await Promise.all(deletePromises);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      manager: 'Manager',
      team_leader: 'Team Leader',
      worker: 'Worker'
    };
    return roleNames[role] || role;
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      'info': 'Information',
      'alert': 'Alert',
      'warning': 'Warning',
      'task': 'Task',
      'system': 'System'
    };
    return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

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

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
      <Typography variant="h6" sx={{ p: 2, color: 'primary.main' }}>
        Navigation
      </Typography>
      <Divider />
      <List>
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <ListItem button key={item.text} component={Link} to={item.path}>
              <ListItemIcon>
                <IconComponent />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AmanziGuard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationClick}
            >
              <Badge badgeContent={notifications.filter(n => !n.is_read).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Typography variant="body1" sx={{ mx: 2 }}>
              {user.name || 'User'} ({getRoleDisplayName(user.role)})
            </Typography>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>

            <Menu
              id="notification-menu"
              anchorEl={notificationAnchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
              PaperProps={{
                style: {
                  maxHeight: 400,
                  width: 350,
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6">Notifications</Typography>
                {notifications.length > 0 && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: 'pointer', mt: 1 }}
                    onClick={handleClearAllNotifications}
                  >
                    Clear All
                  </Typography>
                )}
              </Box>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {notifications.slice(0, 10).map((notification, index) => (
                    <ListItem key={notification.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={notification.title}
                              size="small"
                              color={
                                notification.type === 'alert' ? 'error' :
                                notification.type === 'warning' ? 'warning' :
                                notification.type === 'task' ? 'primary' :
                                notification.type === 'system' ? 'secondary' : 'info'
                              }
                            />
                            <Chip
                              label={getTypeLabel(notification.type)}
                              size="small"
                              variant="outlined"
                              color="default"
                            />
                            {!notification.is_read && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: 'primary.main'
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {notification.message}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <MuiIconButton
                          edge="end"
                          size="small"
                          onClick={() => handleClearNotification(notification.id)}
                        >
                          <Clear fontSize="small" />
                        </MuiIconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  {notifications.length > 10 && (
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        And {notifications.length - 10} more...
                      </Typography>
                    </ListItem>
                  )}
                </List>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;