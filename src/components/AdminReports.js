import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

const AdminReports = ({ user, onLogout }) => {
  const downloadReport = async (type) => {
    try {
      const response = await api.get(`/admin/reports/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>
      <Typography>Download system reports here.</Typography>
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => downloadReport('users')}
        >
          Download Users Report
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => downloadReport('activitylogs')}
        >
          Download Activity Logs Report
        </Button>
      </Box>
    </Layout>
  );
};

export default AdminReports;