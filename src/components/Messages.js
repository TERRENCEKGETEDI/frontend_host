import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Badge,
  Fab,
  Tooltip,
  Grid,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Send,
  AttachFile,
  Close,
  Person,
  Group,
  Message as MessageIcon,
  Refresh,
  MarkChatRead
} from '@mui/icons-material';
import Layout from './Layout';
import api from '../utils/api';

// Get the API base URL for constructing attachment URLs
const getApiBaseUrl = () => {
  const baseURL = process.env.REACT_APP_API_URL || 'https://backend-host-w8to.onrender.com/api';
  // Remove '/api' suffix to get the base server URL
  return baseURL.replace('/api', '');
};

const Messages = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [messageType, setMessageType] = useState('direct'); // 'direct', 'broadcast', 'channel'
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const fileInputRef = useRef();
  const messagesEndRef = useRef();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    fetchRecipients();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages');
      console.log('DEBUG: Messages data received:', response.data);
      response.data.forEach(message => {
        if (message.attachment_url) {
          console.log(`DEBUG: Message ${message.id} has attachment: ${message.attachment_url}`);
          console.log(`DEBUG: Constructed URL would be: http://localhost:5000${message.attachment_url}`);
        }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchRecipients = async () => {
    try {
      const response = await api.get('/messages/recipients');
      setRecipients(response.data);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', messageContent);

      if (messageType === 'direct' && selectedRecipient) {
        formData.append('receiver_id', selectedRecipient);
      } else if (messageType === 'broadcast' && selectedRole) {
        formData.append('target_role', selectedRole);
      } else if (messageType === 'channel' && selectedChannel) {
        formData.append('channel', selectedChannel);
      }

      if (attachment) {
        formData.append('attachment', attachment);
      }

      await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessageContent('');
      setAttachment(null);
      setSendDialogOpen(false);
      setSelectedRecipient('');
      setSelectedRole('');
      setSelectedChannel('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getMessageTypeLabel = (message) => {
    if (message.receiver_id) return 'Direct Message';
    if (message.target_role) return `Broadcast to ${message.target_role}s`;
    if (message.channel) return `Channel: ${message.channel}`;
    return 'Unknown';
  };

  const getMessageTypeColor = (message) => {
    if (message.receiver_id) return 'primary';
    if (message.target_role) return 'secondary';
    if (message.channel) return 'success';
    return 'default';
  };

  const groupMessages = () => {
    const groups = {
      direct: [],
      broadcasts: [],
      channels: {}
    };

    messages.forEach(msg => {
      if (msg.receiver_id || msg.sender_id === user.id) {
        groups.direct.push(msg);
      } else if (msg.target_role) {
        groups.broadcasts.push(msg);
      } else if (msg.channel) {
        if (!groups.channels[msg.channel]) {
          groups.channels[msg.channel] = [];
        }
        groups.channels[msg.channel].push(msg);
      }
    });

    return groups;
  };

  const messageGroups = groupMessages();

  return (
    <Layout user={user} onLogout={onLogout}>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Messages
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchMessages}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<MessageIcon />}
            onClick={() => setSendDialogOpen(true)}
          >
            New Message
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Direct Messages */}
        <Grid item xs={12} md={6}>
          <Card sx={(theme) => ({
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}25)`,
            boxShadow: `0 8px 32px ${theme.palette.primary.main}20`,
            borderRadius: '16px',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 40px ${theme.palette.primary.main}30`
            }
          })}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                💬 Direct Messages
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {messageGroups.direct.map((message) => (
                  <ListItem key={message.id} divider sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      transform: 'scale(1.01)',
                      borderRadius: '8px'
                    },
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    mb: 1
                  }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={(theme) => ({ width: 32, height: 32, bgcolor: theme.palette.primary.main })}>
                            <Person fontSize="small" />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {message.sender.name}
                          </Typography>
                          {!message.is_read && message.receiver_id === user.id && (
                            <Badge color="error" variant="dot" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {message.content}
                          </Typography>
                          {message.attachment_url && (
                            <Button
                              size="small"
                              href={`${getApiBaseUrl()}${message.attachment_url}`}
                              target="_blank"
                              startIcon={<AttachFile />}
                            >
                              View Attachment
                            </Button>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    {message.receiver_id === user.id && !message.is_read && (
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(message.id)}
                        color="primary"
                      >
                        <MarkChatRead />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Broadcasts and Channels */}
        <Grid item xs={12} md={6}>
          <Card sx={(theme) => ({
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}25)`,
            boxShadow: `0 8px 32px ${theme.palette.secondary.main}20`,
            borderRadius: '16px',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 40px ${theme.palette.secondary.main}30`
            }
          })}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                📢 Broadcasts
              </Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {messageGroups.broadcasts.map((message) => (
                  <ListItem key={message.id} divider sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      transform: 'scale(1.01)',
                      borderRadius: '8px'
                    },
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    mb: 1
                  }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getMessageTypeLabel(message)}
                            color={getMessageTypeColor(message)}
                            size="small"
                          />
                          <Avatar sx={(theme) => ({ width: 32, height: 32, bgcolor: theme.palette.secondary.main })}>
                            <Group fontSize="small" />
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {message.sender.name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {message.content}
                          </Typography>
                          {message.attachment_url && (
                            <Button
                              size="small"
                              href={`${getApiBaseUrl()}${message.attachment_url}`}
                              target="_blank"
                              startIcon={<AttachFile />}
                            >
                              View Attachment
                            </Button>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Channels */}
          {Object.entries(messageGroups.channels).map(([channel, channelMessages]) => (
            <Card key={channel} sx={(theme) => ({
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}25)`,
              boxShadow: `0 8px 32px ${theme.palette.success.main}20`,
              borderRadius: '16px',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 40px ${theme.palette.success.main}30`
              }
            })}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  📻 Channel: {channel}
                </Typography>
                <List sx={{ maxHeight: 150, overflow: 'auto' }}>
                  {channelMessages.map((message) => (
                    <ListItem key={message.id} divider sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        transform: 'scale(1.01)',
                        borderRadius: '8px'
                      },
                      transition: 'all 0.2s ease',
                      borderRadius: '8px',
                      mb: 1
                    }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={(theme) => ({ width: 32, height: 32, bgcolor: theme.palette.success.main })}>
                              <MessageIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {message.sender.name}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {message.content}
                            </Typography>
                            {message.attachment_url && (
                              <Button
                                size="small"
                                href={`${getApiBaseUrl()}${message.attachment_url}`}
                                target="_blank"
                                startIcon={<AttachFile />}
                              >
                                View Attachment
                              </Button>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Send Message Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send New Message</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Message Type</InputLabel>
            <Select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              label="Message Type"
            >
              <MenuItem value="direct">Direct Message</MenuItem>
              <MenuItem value="broadcast">Role Broadcast</MenuItem>
              <MenuItem value="channel">Channel Message</MenuItem>
            </Select>
          </FormControl>

          {messageType === 'direct' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Recipient</InputLabel>
              <Select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                label="Recipient"
              >
                {recipients.map((recipient) => (
                  <MenuItem key={recipient.id} value={recipient.id}>
                    {recipient.name} ({recipient.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {messageType === 'broadcast' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Target Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Target Role"
              >
                <MenuItem value="worker">Workers</MenuItem>
                <MenuItem value="team_leader">Team Leaders</MenuItem>
                <MenuItem value="manager">Managers</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
              </Select>
            </FormControl>
          )}

          {messageType === 'channel' && (
            <TextField
              fullWidth
              label="Channel"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              placeholder="e.g., team_alpha, incident_123"
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AttachFile />}
              onClick={() => fileInputRef.current?.click()}
            >
              Attach File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {attachment && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{attachment.name}</Typography>
                <IconButton size="small" onClick={removeAttachment}>
                  <Close />
                </IconButton>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            disabled={loading || !messageContent.trim() ||
              (messageType === 'direct' && !selectedRecipient) ||
              (messageType === 'broadcast' && !selectedRole) ||
              (messageType === 'channel' && !selectedChannel)}
            startIcon={<Send />}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Layout>
  );
};

export default Messages;