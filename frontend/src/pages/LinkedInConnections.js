import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LinkedIn,
  Add,
  Delete,
  PersonOutline,
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import AddLinkedInConnectionModal from '../components/AddLinkedInConnectionModal';
import { linkedInAPI } from '../services/linkedInService';

const LinkedInConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addConnectionModalOpen, setAddConnectionModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);

  useEffect(() => {
    fetchConnections();
    
    // Check for OAuth callback status in URL
    const params = new URLSearchParams(window.location.search);
    const linkedinStatus = params.get('linkedin');
    const errorParam = params.get('error');
    
    if (linkedinStatus === 'connected') {
      setSuccess('LinkedIn account connected successfully!');
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam) {
      const errorMessages = {
        'no_code': 'LinkedIn authorization failed - no code received',
        'user_not_found': 'User not found. Please try logging in again.',
        'callback_failed': 'LinkedIn connection failed. Please try again.'
      };
      setError(errorMessages[errorParam] || 'An error occurred while connecting to LinkedIn');
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await linkedInAPI.getConnectionStatus();
      const { connected, connection } = response.data.data;
      
      if (connected && connection) {
        setConnections([connection]);
      } else {
        setConnections([]);
      }
      setError('');
    } catch (err) {
      console.error('Failed to fetch connections:', err);
      setError('Failed to load LinkedIn connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnectionClick = () => {
    setAddConnectionModalOpen(true);
  };

  const handleConnectToLinkedIn = async () => {
    try {
      const response = await linkedInAPI.getLinkedInAuthUrl();
      const { authUrl } = response.data.data;
      window.location.href = authUrl;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setError('Failed to initiate LinkedIn connection');
    }
  };

  const handleDeleteClick = (connection) => {
    setConnectionToDelete(connection);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await linkedInAPI.disconnectLinkedIn();
      setSuccess('LinkedIn connection removed successfully');
      setDeleteDialogOpen(false);
      setConnectionToDelete(null);
      fetchConnections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Failed to remove connection');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setConnectionToDelete(null);
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4 }}>
            <Tooltip title="Add Connection">
              <IconButton
                color="primary"
                onClick={handleAddConnectionClick}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : connections.length === 0 ? (
            /* Empty State */
            <Paper
              sx={{
                p: 8,
                textAlign: 'center',
                bgcolor: 'background.default',
                border: '2px dashed',
                borderColor: 'divider',
              }}
            >
              <LinkedIn sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No LinkedIn Connections
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Connect your LinkedIn account to start publishing content
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                size="large"
                onClick={handleAddConnectionClick}
              >
                Connect LinkedIn Account
              </Button>
            </Paper>
          ) : (
            /* Connections List */
            <Grid container spacing={3}>
              {connections.map((connection, index) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                  <Card
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent>
                      {/* Profile Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: '#0077B5',
                            mr: 2,
                          }}
                        >
                          {connection.firstName?.[0] || <PersonOutline />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {connection.firstName} {connection.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {connection.email || 'LinkedIn Account'}
                          </Typography>
                        </Box>
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      {/* Connection Details */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          LinkedIn Profile ID
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                          {connection.linkedInId || 'N/A'}
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteClick(connection)}
                          fullWidth
                        >
                          Disconnect
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Info Box */}
          <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              ℹ️ About LinkedIn Connections
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Connect multiple LinkedIn accounts to publish to different profiles</li>
                <li>Click "Add Connection" to connect a new LinkedIn account</li>
                <li>You can switch between connections when publishing posts</li>
                <li>Disconnect any account at any time</li>
                <li>Your connection data is securely stored and encrypted</li>
              </ul>
            </Typography>
          </Paper>
        </Box>

        {/* Add Connection Modal */}
        <AddLinkedInConnectionModal
          open={addConnectionModalOpen}
          onClose={() => setAddConnectionModalOpen(false)}
          onConnect={handleConnectToLinkedIn}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Disconnect LinkedIn Account?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to disconnect{' '}
              <strong>
                {connectionToDelete?.firstName} {connectionToDelete?.lastName}
              </strong>
              ? You won't be able to publish posts with this account until you reconnect.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Disconnect
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default LinkedInConnections;

