import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Schedule,
  Delete,
  ExpandMore,
  ExpandLess,
  Save,
  Cancel,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MainLayout from '../components/Layout/MainLayout';
import { ideaAPI } from '../services/ideaService';
import { geminiAPI } from '../services/geminiService';
import { 
  convertUTCToUserTimezone, 
  convertUserTimezoneToUTC, 
  formatTimeLocale,
  getCurrentTimeInUserTimezone 
} from '../utils/timezoneUtils';

const ScheduledPosts = () => {
  const [scheduledIdeas, setScheduledIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedIdea, setExpandedIdea] = useState(null);
  const [articleVersions, setArticleVersions] = useState({});
  const [loadingVersions, setLoadingVersions] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState(null);
  const [lastScheduledTime, setLastScheduledTime] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [userTimezone, setUserTimezone] = useState(() => {
    return localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    fetchScheduledIdeas();
  }, []);

  useEffect(() => {
    // Listen for timezone changes
    const handleTimezoneChange = () => {
      const newTimezone = localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(newTimezone);
    };

    window.addEventListener('timezonechange', handleTimezoneChange);
    return () => window.removeEventListener('timezonechange', handleTimezoneChange);
  }, []);

  const fetchScheduledIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaAPI.getAllIdeas();
      const ideas = response.data.data.ideas;
      // Filter only scheduled ideas
      const scheduled = ideas.filter(idea => idea.status === 'scheduled');
      // Sort by scheduled time (latest first - descending order)
      scheduled.sort((a, b) => new Date(b.scheduledFor) - new Date(a.scheduledFor));
      setScheduledIdeas(scheduled);
    } catch (err) {
      setError('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleVersions = async (ideaId) => {
    if (articleVersions[ideaId]) {
      return; // Already loaded
    }

    try {
      setLoadingVersions(prev => ({ ...prev, [ideaId]: true }));
      const response = await geminiAPI.getArticleVersions(ideaId);
      setArticleVersions(prev => ({
        ...prev,
        [ideaId]: response.data.data.versions
      }));
    } catch (err) {
      console.error('Failed to fetch article versions:', err);
    } finally {
      setLoadingVersions(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const handleExpandClick = async (ideaId) => {
    if (expandedIdea === ideaId) {
      setExpandedIdea(null);
    } else {
      setExpandedIdea(ideaId);
      await fetchArticleVersions(ideaId);
    }
  };

  const getLastScheduledTime = () => {
    if (scheduledIdeas.length === 0) return null;
    
    // Find the latest scheduled time (last in the sorted array)
    const lastScheduled = scheduledIdeas[scheduledIdeas.length - 1];
    return lastScheduled.scheduledFor;
  };

  const getSuggestedScheduleTime = (excludeIdeaId = null) => {
    // Filter out the current idea being edited
    const otherScheduled = scheduledIdeas.filter(idea => idea._id !== excludeIdeaId);
    
    if (otherScheduled.length === 0) {
      // No other scheduled posts, suggest current time + 1 hour
      return getCurrentTimeInUserTimezone(userTimezone).add(1, 'hour');
    }
    
    // Get the last scheduled time and add 24 hours
    const lastScheduled = otherScheduled[otherScheduled.length - 1];
    const lastTime = convertUTCToUserTimezone(lastScheduled.scheduledFor, userTimezone);
    return lastTime.add(24, 'hour');
  };

  const handleEditSchedule = (idea) => {
    setSelectedIdea(idea);
    
    // Get current scheduled time for this idea
    const currentTime = convertUTCToUserTimezone(idea.scheduledFor, userTimezone);
    setScheduledDateTime(currentTime);
    
    // Get last scheduled time and suggestion
    const lastTime = getLastScheduledTime();
    if (lastTime) {
      setLastScheduledTime(convertUTCToUserTimezone(lastTime, userTimezone));
    }
    
    const suggested = getSuggestedScheduleTime(idea._id);
    setSuggestedTime(suggested);
    
    setEditDialogOpen(true);
  };

  const handleDeleteSchedule = (idea) => {
    setSelectedIdea(idea);
    setDeleteDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedIdea(null);
    setScheduledDateTime(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedIdea(null);
  };

  const handleScheduleSave = async () => {
    if (!selectedIdea || !scheduledDateTime) return;
    
    try {
      const utcTime = convertUserTimezoneToUTC(scheduledDateTime, userTimezone);
      
      await ideaAPI.updateIdea(selectedIdea._id, { 
        scheduledFor: utcTime,
        status: 'scheduled'
      });
      
      setSuccess('Schedule updated successfully');
      await fetchScheduledIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update schedule');
      setTimeout(() => setError(''), 3000);
    } finally {
      handleEditDialogClose();
    }
  };

  const handleScheduleDelete = async () => {
    if (!selectedIdea) return;
    
    try {
      await ideaAPI.updateIdea(selectedIdea._id, { 
        scheduledFor: null,
        status: 'ai_generated'
      });
      
      setSuccess('Schedule removed - moved to AI Generated');
      await fetchScheduledIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove schedule');
      setTimeout(() => setError(''), 3000);
    } finally {
      handleDeleteDialogClose();
    }
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            Scheduled Posts
          </Typography>
          <Chip 
            label={`${scheduledIdeas.length} Scheduled`} 
            color="primary" 
            icon={<Schedule />}
          />
        </Box>

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
        ) : scheduledIdeas.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Schedule sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Scheduled Posts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schedule your AI-generated articles to publish them automatically
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {scheduledIdeas.map((idea) => (
              <Grid size={{ xs: 12 }} key={idea._id}>
                <Card variant="outlined">
                  <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label="Scheduled" 
                            size="small" 
                            color="primary"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip
                            icon={<Schedule sx={{ fontSize: '0.9rem !important' }} />}
                            label={formatTimeLocale(idea.scheduledFor, userTimezone)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            onClick={() => handleEditSchedule(idea)}
                            sx={{ 
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body1" fontWeight={500}>
                          {idea.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {idea.content}
                        </Typography>
                      </Box>
                      
                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteSchedule(idea)}
                          title="Remove Schedule"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandClick(idea._id)}
                          title="View Article Versions"
                        >
                          {expandedIdea === idea._id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Article Versions */}
                    <Collapse in={expandedIdea === idea._id} timeout="auto">
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Article Versions
                      </Typography>
                      
                      {loadingVersions[idea._id] ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : articleVersions[idea._id]?.length > 0 ? (
                        <List dense>
                          {articleVersions[idea._id].map((version) => (
                            <ListItem 
                              key={version._id}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip 
                                      label={`Version ${version.version}`} 
                                      size="small" 
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                    <Chip 
                                      label={version.tone} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: 20, textTransform: 'capitalize' }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {version.characterCount} characters
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(version.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {version.content}
                                </Typography>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                          No article versions found
                        </Typography>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Edit Schedule Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule color="primary" />
              <Typography variant="h6">Update Schedule</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {/* Smart Scheduling Suggestion */}
            {lastScheduledTime && suggestedTime && (
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    size="small" 
                    onClick={() => setScheduledDateTime(suggestedTime)}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Use This
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Smart Suggestion
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Last scheduled post: <strong>{lastScheduledTime.format('MMM D, h:mm A')}</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Suggested time (24h later): <strong>{suggestedTime.format('MMM D, h:mm A')}</strong>
                </Typography>
              </Alert>
            )}
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Scheduled Date & Time"
                value={scheduledDateTime}
                onChange={(newValue) => setScheduledDateTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    helperText: `Time zone: ${userTimezone}`,
                  }
                }}
                minDateTime={getCurrentTimeInUserTimezone(userTimezone)}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleEditDialogClose}
              color="inherit"
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleScheduleSave}
              variant="contained"
              disabled={!scheduledDateTime}
              startIcon={<Save />}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Schedule Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={handleDeleteDialogClose}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Remove Schedule
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to remove the schedule for this post?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The post will be moved back to "AI Generated" status and will not be published automatically.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={handleDeleteDialogClose}
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleScheduleDelete}
              variant="contained"
              color="error"
              startIcon={<Delete />}
            >
              Remove Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default ScheduledPosts;

