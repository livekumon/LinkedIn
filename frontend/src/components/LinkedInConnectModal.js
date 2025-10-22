import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { LinkedIn, ExitToApp } from '@mui/icons-material';

const LinkedInConnectModal = ({ open, onClose, onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    setLoading(true);
    
    try {
      await onConnect();
    } catch (err) {
      setError(err.message || 'Failed to connect LinkedIn');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkedIn color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight={600}>
            Connect to LinkedIn
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LinkedIn sx={{ fontSize: 80, color: '#0077B5', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Connect your LinkedIn account to sync your professional network and access LinkedIn features.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleConnect}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ExitToApp />}
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #0077B5 0%, #00A3E0 100%)',
              mb: 2,
            }}
          >
            {loading ? 'Connecting...' : 'Continue with LinkedIn'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary">
            By connecting, you'll be redirected to LinkedIn to authorize access. We'll only access your basic profile information.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInConnectModal;

