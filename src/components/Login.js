import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });

      const storage = rememberMe ? localStorage : sessionStorage;

      // Save token + user
      storage.setItem('token', res.data.token);
      storage.setItem('user', JSON.stringify(res.data.user));

      // 🔥 ADD THESE LINES TO CONFIRM THE TOKEN IS SAVED
      console.log("Saved token:", storage.getItem('token'));
      console.log("Saved user:", storage.getItem('user'));

      console.log('Login: User data stored:', res.data.user);

      onLogin(res.data.user);

      const rolePath =
        res.data.user.role === 'team_leader' ? 'teamleader' : res.data.user.role;

      navigate('/' + rolePath);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#e0f7f6">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Incident Management Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'primary.main',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.dark',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: 'primary.main',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.dark',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
            label="Remember me"
            sx={{ mt: 1 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Forgot password? <Button size="small" variant="outlined" color="secondary" sx={{ borderRadius: 2, fontWeight: 'bold' }}>Reset</Button>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;