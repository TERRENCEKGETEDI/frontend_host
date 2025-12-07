import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme
} from '@mui/material';
import { Person } from '@mui/icons-material';

const NavPanel = ({ role }) => {
  const theme = useTheme();
  const links = {
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/stats', label: 'Stats' },
      { to: '/admin/reports', label: 'Reports' },
      { to: '/messages', label: 'Messages' },
    ],
    manager: [
      { to: '/manager', label: 'Dashboard' },
      { to: '/manager/teams', label: 'Teams' },
      { to: '/manager/incidents', label: 'Incidents' },
      { to: '/manager/stats', label: 'Stats' },
      { to: '/messages', label: 'Messages' },
    ],
    team_leader: [
      { to: '/teamleader', label: 'Dashboard' },
      { to: '/teamleader/jobs', label: 'Jobs' },
      { to: '/teamleader/progress', label: 'Progress' },
      { to: '/teamleader/reports', label: 'Reports' },
      { to: '/messages', label: 'Messages' },
    ],
    worker: [
      { to: '/worker', label: 'Dashboard' },
      { to: '/worker/jobs', label: 'My Jobs' },
      { to: '/worker/history', label: 'History' },
      { to: '/messages', label: 'Messages' },
    ],
  };

  return (
    <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary">
          Navigation
        </Typography>
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {links[role]?.map(link => (
          <ListItem
            key={link.to}
            component={Link}
            to={link.to}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.05) translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
              },
              transition: 'all 0.2s ease',
              textAlign: 'center',
              justifyContent: 'center',
            }}
          >
            <ListItemText primary={link.label} sx={{ color: 'inherit' }} />
          </ListItem>
        ))}
      </List>

      <Divider />
      <List>
        <ListItem
          component={Link}
          to="/profile"
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            backgroundColor: 'secondary.main',
            color: 'secondary.contrastText',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            '&:hover': {
              backgroundColor: 'secondary.dark',
              transform: 'scale(1.05) translateY(-2px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
            },
            transition: 'all 0.2s ease',
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" sx={{ color: 'inherit' }} />
        </ListItem>
      </List>
    </Box>
  );
};

export default NavPanel;