import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Alert,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import {
  RestoreFromTrash,
  DeleteForever,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { ideaAPI } from '../services/ideaService';
import MainLayout from '../components/Layout/MainLayout';

const RecycleBin = () => {
  const [deletedIdeas, setDeletedIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    fetchDeletedIdeas();
  }, []);

  const fetchDeletedIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaAPI.getDeletedIdeas();
      setDeletedIdeas(response.data.data.ideas);
    } catch (err) {
      setError('Failed to load deleted ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (ideaId) => {
    try {
      await ideaAPI.restoreIdea(ideaId);
      setSuccess('Idea restored successfully!');
      fetchDeletedIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to restore idea');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePermanentDelete = async (ideaId) => {
    if (window.confirm('Are you sure you want to permanently delete this idea? This action cannot be undone.')) {
      try {
        await ideaAPI.permanentDeleteIdea(ideaId);
        setSuccess('Idea permanently deleted');
        fetchDeletedIdeas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete idea permanently');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <MainLayout>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}


        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : deletedIdeas.length === 0 ? (
          <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', bgcolor: 'background.default' }}>
            <DeleteIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Recycle bin is empty
            </Typography>
          </Paper>
        ) : isMobileOrTablet ? (
          /* Mobile & Tablet Card View */
          <Grid container spacing={2}>
            {deletedIdeas.map((idea) => (
              <Grid size={{ xs: 12 }} key={idea._id}>
                <Card sx={{ border: '1px solid #E0E0E0', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ mb: 2, wordBreak: 'break-word' }}>
                      {idea.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Deleted: {new Date(idea.updatedAt).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={idea.status === 'ai_generated' ? 'AI Generated' : idea.status} 
                        size="small"
                        color={
                          idea.status === 'posted' ? 'success' : 
                          idea.status === 'scheduled' ? 'primary' : 
                          idea.status === 'ai_generated' ? 'warning' : 
                          'default'
                        }
                        sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<RestoreFromTrash />}
                        onClick={() => handleRestore(idea._id)}
                        fullWidth
                      >
                        Restore
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForever />}
                        onClick={() => handlePermanentDelete(idea._id)}
                        fullWidth
                      >
                        Delete Forever
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* Desktop Table View */
          <TableContainer 
            component={Paper} 
            sx={{ 
              border: '1px solid #E0E0E0',
              borderRadius: 2,
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default', width: '60%' }}>Idea</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default', width: '15%' }}>Deleted Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default', width: '10%', textAlign: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.default', width: '15%', textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deletedIdeas.map((idea) => (
                  <TableRow key={idea._id}>
                    <TableCell sx={{ wordWrap: 'break-word' }}>
                      <Typography variant="body2">
                        {idea.content}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(idea.updatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={idea.status === 'ai_generated' ? 'AI Generated' : idea.status} 
                        size="small"
                        color={
                          idea.status === 'posted' ? 'success' : 
                          idea.status === 'scheduled' ? 'primary' : 
                          idea.status === 'ai_generated' ? 'warning' : 
                          'default'
                        }
                        sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Restore">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleRestore(idea._id)}
                          >
                            <RestoreFromTrash fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Forever">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handlePermanentDelete(idea._id)}
                          >
                            <DeleteForever fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </MainLayout>
  );
};

export default RecycleBin;

