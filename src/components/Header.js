import React, { useState, useMemo } from 'react';
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
  useTheme
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
  History
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      manager: 'Manager',
      team_leader: 'Team Leader',
      worker: 'Worker'
    };
    return roleNames[role] || role;
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
            >
              <Badge badgeContent={0} color="error">
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