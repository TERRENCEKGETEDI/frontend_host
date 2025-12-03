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
    ],
    manager: [
      { to: '/manager', label: 'Dashboard' },
      { to: '/manager/teams', label: 'Teams' },
      { to: '/manager/incidents', label: 'Incidents' },
      { to: '/manager/stats', label: 'Stats' },
    ],
    team_leader: [
      { to: '/teamleader', label: 'Dashboard' },
      { to: '/teamleader/jobs', label: 'Jobs' },
      { to: '/teamleader/progress', label: 'Progress' },
      { to: '/teamleader/reports', label: 'Reports' },
    ],
    worker: [
      { to: '/worker', label: 'Dashboard' },
      { to: '/worker/jobs', label: 'My Jobs' },
      { to: '/worker/history', label: 'History' },
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
          <ListItem key={link.to} component={Link} to={link.to}>
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
      </List>

      <Divider />
      <List>
        <ListItem component={Link} to="/profile">
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
    </Box>
  );
};

export default NavPanel;