import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Typography,
  Box,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Badge,
  ListItemIcon,
  ListItemText,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LightbulbOutlined,
  DeleteOutline,
  StarOutline,
  Star,
  AutoAwesome,
  Send,
  Schedule,
  Edit,
  Check,
  Close,
  Save,
  FilterList,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ideaAPI } from '../services/ideaService';
import { geminiAPI } from '../services/geminiService';
import MainLayout from '../components/Layout/MainLayout';
import ArticleGeneratorModal from '../components/ArticleGeneratorModal';
import { 
  convertUTCToUserTimezone, 
  convertUserTimezoneToUTC, 
  formatTimeLocale,
  getCurrentTimeInUserTimezone 
} from '../utils/timezoneUtils';

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ideaText, setIdeaText] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allIdeas, setAllIdeas] = useState([]);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null);
  const [selectedIdeaForStatus, setSelectedIdeaForStatus] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedIdeaForSchedule, setSelectedIdeaForSchedule] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState(null);
  const [lastScheduledTime, setLastScheduledTime] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [userTimezone, setUserTimezone] = useState(() => {
    return localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    fetchIdeas();
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

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await ideaAPI.getAllIdeas();
      const fetchedIdeas = response.data.data.ideas;
      setAllIdeas(fetchedIdeas);
      filterIdeas(fetchedIdeas, statusFilter);
    } catch (err) {
      setError('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const filterIdeas = (ideasToFilter, filter) => {
    if (filter === 'all') {
      setIdeas(ideasToFilter);
    } else {
      setIdeas(ideasToFilter.filter(idea => idea.status === filter));
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    filterIdeas(allIdeas, filter);
    setFilterMenuAnchorEl(null);
  };

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };

  const filterOptions = [
    { value: 'all', label: 'All', color: 'primary' },
    { value: 'draft', label: 'Draft', color: 'default' },
    { value: 'ai_generated', label: 'AI Generated', color: 'warning' },
    { value: 'scheduled', label: 'Scheduled', color: 'primary' },
    { value: 'posted', label: 'Posted', color: 'success' },
    { value: 'archived', label: 'Archived', color: 'error' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'default' },
    { value: 'ai_generated', label: 'AI Generated', color: 'warning' },
    { value: 'scheduled', label: 'Scheduled', color: 'primary' },
    { value: 'posted', label: 'Posted', color: 'success' },
    { value: 'archived', label: 'Archived', color: 'error' },
  ];

  const handleStatusMenuOpen = (event, idea) => {
    event.stopPropagation();
    setStatusMenuAnchorEl(event.currentTarget);
    setSelectedIdeaForStatus(idea);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
    setSelectedIdeaForStatus(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIdeaForStatus) return;
    
    try {
      await ideaAPI.updateIdea(selectedIdeaForStatus._id, { status: newStatus });
      setSuccess(`Status updated to ${newStatus.replace('_', ' ')}`);
      await fetchIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      handleStatusMenuClose();
    }
  };

  const getLastScheduledTime = () => {
    // Get all scheduled ideas and find the latest one
    const scheduledIdeas = allIdeas.filter(idea => idea.status === 'scheduled' && idea.scheduledFor);
    if (scheduledIdeas.length === 0) return null;
    
    // Sort by scheduledFor and get the last one
    scheduledIdeas.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    return scheduledIdeas[scheduledIdeas.length - 1].scheduledFor;
  };

  const getSuggestedScheduleTime = () => {
    const lastTime = getLastScheduledTime();
    
    if (!lastTime) {
      // No scheduled posts, suggest current time + 1 hour
      return getCurrentTimeInUserTimezone(userTimezone).add(1, 'hour');
    }
    
    // Get the last scheduled time and add 24 hours
    const lastTimeInUserTz = convertUTCToUserTimezone(lastTime, userTimezone);
    return lastTimeInUserTz.add(24, 'hour');
  };

  const handleScheduleClick = (event, idea) => {
    event.stopPropagation();
    setSelectedIdeaForSchedule(idea);
    
    // Get last scheduled time and suggestion
    const lastTime = getLastScheduledTime();
    if (lastTime) {
      setLastScheduledTime(convertUTCToUserTimezone(lastTime, userTimezone));
    } else {
      setLastScheduledTime(null);
    }
    
    const suggested = getSuggestedScheduleTime();
    setSuggestedTime(suggested);
    
    // Convert UTC time from database to user's timezone for display
    // Use suggestion as default if this is a new schedule
    const timeInUserTz = idea.scheduledFor 
      ? convertUTCToUserTimezone(idea.scheduledFor, userTimezone)
      : suggested;
    
    console.log('Opening schedule dialog:');
    console.log('- Idea scheduledFor (UTC):', idea.scheduledFor);
    console.log('- User timezone:', userTimezone);
    console.log('- Suggested time:', suggested.format());
    console.log('- Setting time to:', timeInUserTz.format());
    
    setScheduledDateTime(timeInUserTz);
    setScheduleDialogOpen(true);
  };

  const handleScheduleDialogClose = () => {
    setScheduleDialogOpen(false);
    setSelectedIdeaForSchedule(null);
    setScheduledDateTime(null);
  };

  const handleScheduleSave = async () => {
    if (!selectedIdeaForSchedule || !scheduledDateTime) return;
    
    try {
      // Convert user's timezone to UTC before saving to database
      const utcTime = convertUserTimezoneToUTC(scheduledDateTime, userTimezone);
      
      console.log('Scheduled DateTime (user TZ):', scheduledDateTime.format());
      console.log('User Timezone:', userTimezone);
      console.log('Converted to UTC:', utcTime);
      
      await ideaAPI.updateIdea(selectedIdeaForSchedule._id, { 
        scheduledFor: utcTime,
        status: 'scheduled'
      });
      setSuccess('Schedule updated successfully');
      await fetchIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Schedule save error:', err);
      setError('Failed to update schedule');
    } finally {
      handleScheduleDialogClose();
    }
  };

  const handleSubmit = async () => {
    if (!ideaText.trim()) {
      setError('Please enter your idea');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await ideaAPI.createIdea({
        title: ideaText.substring(0, 50) + (ideaText.length > 50 ? '...' : ''),
        content: ideaText,
        category: 'general'
      });
      setSuccess('Idea saved successfully!');
      setIdeaText('');
      fetchIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save idea');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idea) => {
    // Check if idea can be deleted
    if (idea.status === 'posted' || idea.status === 'ai_generated') {
      setError(`Cannot delete ${idea.status === 'posted' ? 'posted' : 'AI generated'} ideas. Change status to draft first.`);
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (window.confirm('Are you sure you want to move this idea to recycle bin?')) {
      try {
        await ideaAPI.deleteIdea(idea._id);
        setSuccess('Idea moved to recycle bin');
        fetchIdeas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Delete idea error:', err);
        setError(err.response?.data?.message || 'Failed to delete idea');
        setTimeout(() => setError(''), 4000);
      }
    }
  };

  const handleToggleFavorite = async (idea) => {
    try {
      await ideaAPI.updateIdea(idea._id, { isFavorite: !idea.isFavorite });
      fetchIdeas();
    } catch (err) {
      setError('Failed to update favorite');
    }
  };

  const handleStartEdit = (idea) => {
    // Only allow editing if status is draft
    if (idea.status !== 'draft') {
      setError('You can only edit ideas in draft status');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setEditingId(idea._id);
    setEditText(idea.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (ideaId) => {
    try {
      await ideaAPI.updateIdea(ideaId, { 
        content: editText,
        title: editText.substring(0, 50) + (editText.length > 50 ? '...' : '')
      });
      setEditingId(null);
      setEditText('');
      setSuccess('Idea updated successfully!');
      fetchIdeas();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update idea');
    }
  };

  const handleGenerateArticle = async (idea) => {
    setSelectedIdea(idea);
    setArticleModalOpen(true);
  };

  const handleGenerateArticleAPI = async (ideaId, tone = 'default', regenerate = false, includeSources = false) => {
    try {
      const response = await geminiAPI.generateArticle(ideaId, tone, regenerate, includeSources);
      
      // Update local state with new credit info if provided
      if (response.data.data.creditsRemaining !== undefined) {
        // You can store this in context or state to update UI
        console.log('Credits remaining:', response.data.data.creditsRemaining);
      }
      
      return response.data.data.article;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to generate article';
      
      // Show specific error for insufficient credits
      if (errorMessage.includes('Insufficient AI credits')) {
        setError('You have run out of AI credits. Please purchase more credits to continue generating articles.');
        setTimeout(() => setError(''), 5000);
      }
      
      throw new Error(errorMessage);
    }
  };

  const handlePostNow = async (idea) => {
    try {
      setSuccess('Posting to LinkedIn...');
      // TODO: Implement LinkedIn posting
      console.log('Post now:', idea);
      setTimeout(() => setSuccess('Posted to LinkedIn successfully!'), 2000);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to post to LinkedIn');
    }
  };

  const handleScheduleLater = async (idea) => {
    try {
      setSuccess('Scheduling post...');
      // TODO: Implement scheduling
      console.log('Schedule later:', idea);
      setTimeout(() => setSuccess('Post scheduled successfully!'), 2000);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to schedule post');
    }
  };

  const handlePostArticle = async (article, version) => {
    // Status is already updated by the API, just show success and refresh
    setSuccess('Article posted to LinkedIn successfully!');
    await fetchIdeas();
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleScheduleArticle = async (article, version) => {
    // Status is already updated by the API, just show success and refresh
    setSuccess('Article scheduled successfully!');
    await fetchIdeas();
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
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

        {/* Input Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={8}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="What's on your mind?"
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                },
              }}
            />

            <IconButton
              color="primary"
              onClick={handleSubmit}
              disabled={saving || !ideaText.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
              }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            </IconButton>

            <IconButton
              onClick={handleFilterMenuOpen}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Badge 
                variant="dot" 
                color="primary" 
                invisible={statusFilter === 'all'}
              >
                <FilterList fontSize="small" />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={filterMenuAnchorEl}
              open={Boolean(filterMenuAnchorEl)}
              onClose={handleFilterMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  minWidth: 140,
                  mt: 0.5,
                }
              }}
            >
              {filterOptions.map((option) => (
                <MenuItem 
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  selected={statusFilter === option.value}
                  sx={{
                    fontSize: '0.95rem',
                    py: 1.5,
                    minHeight: 48, // Better touch target
                  }}
                >
                  <ListItemText 
                    primary={option.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: statusFilter === option.value ? 600 : 400,
                    }}
                  />
                  {statusFilter === option.value && (
                    <Check fontSize="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* Ideas Grid */}
        <Box sx={{ flexGrow: 1 }}>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : ideas.length === 0 ? (
            <Box sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
              <LightbulbOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                No ideas yet. Start creating!
              </Typography>
            </Box>
          ) : (
            /* Card View for All Devices */
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {ideas.map((idea) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idea._id}>
                  <Card 
                    onClick={() => editingId !== idea._id && handleGenerateArticle(idea)}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1,
                      cursor: editingId !== idea._id ? 'pointer' : 'default',
                      transition: 'border-color 0.2s',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        borderColor: editingId !== idea._id ? 'primary.main' : 'divider',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {editingId === idea._id ? (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            size="small"
                            sx={{ mb: 1.5 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSaveEdit(idea._id)}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' }
                              }}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          {/* Header Row */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip 
                                label={idea.status === 'ai_generated' ? 'AI' : idea.status} 
                                size="small"
                                onClick={(e) => handleStatusMenuOpen(e, idea)}
                                color={
                                  idea.status === 'posted' ? 'success' : 
                                  idea.status === 'scheduled' ? 'primary' : 
                                  idea.status === 'ai_generated' ? 'warning' : 
                                  'default'
                                }
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 22,
                                  cursor: 'pointer',
                                }}
                              />
                              {idea.status === 'scheduled' && idea.scheduledFor && (
                                <Chip
                                  icon={<Schedule sx={{ fontSize: '0.8rem !important' }} />}
                                  label={formatTimeLocale(idea.scheduledFor, userTimezone)}
                                  size="small"
                                  onClick={(e) => handleScheduleClick(e, idea)}
                                  color="primary"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    height: 22,
                                    cursor: 'pointer',
                                    '& .MuiChip-icon': {
                                      fontSize: '0.8rem',
                                    }
                                  }}
                                />
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(idea);
                                }}
                                sx={{ 
                                  color: idea.isFavorite ? 'warning.main' : 'text.secondary', 
                                  p: { xs: 1, sm: 0.5 },
                                  minWidth: { xs: 40, sm: 'auto' },
                                  minHeight: { xs: 40, sm: 'auto' },
                                }}
                              >
                                {idea.isFavorite ? <Star fontSize="small" /> : <StarOutline fontSize="small" />}
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(idea);
                                }}
                                sx={{ 
                                  color: 'text.secondary', 
                                  p: { xs: 1, sm: 0.5 },
                                  minWidth: { xs: 40, sm: 'auto' },
                                  minHeight: { xs: 40, sm: 'auto' },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(idea);
                                }}
                                sx={{ 
                                  color: 'error.main', 
                                  p: { xs: 1, sm: 0.5 },
                                  minWidth: { xs: 40, sm: 'auto' },
                                  minHeight: { xs: 40, sm: 'auto' },
                                }}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Content */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1, 
                              wordBreak: 'break-word',
                              mb: 1.5,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              fontSize: { xs: '0.875rem', sm: '0.875rem' },
                              lineHeight: 1.5,
                            }}
                          >
                            {idea.content}
                          </Typography>

                          {/* Footer */}
                          <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {new Date(idea.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      <ArticleGeneratorModal
        open={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        idea={selectedIdea}
        onGenerate={handleGenerateArticleAPI}
        onPost={handlePostArticle}
        onSchedule={handleScheduleArticle}
      />

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 140,
            mt: 0.5,
          }
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem 
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            selected={selectedIdeaForStatus?.status === option.value}
            sx={{
              fontSize: '0.95rem',
              py: 1.5,
              minHeight: 48, // Better touch target
            }}
          >
            <ListItemText 
              primary={option.label}
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: selectedIdeaForStatus?.status === option.value ? 600 : 400,
              }}
            />
            {selectedIdeaForStatus?.status === option.value && (
              <Check fontSize="small" color="primary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* Schedule Date/Time Edit Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={handleScheduleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule color="primary" />
            <Typography variant="h6">Edit Schedule</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Smart Scheduling Suggestion */}
          {suggestedTime && (
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                lastScheduledTime && (
                  <Button 
                    size="small" 
                    onClick={() => setScheduledDateTime(suggestedTime)}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Use This
                  </Button>
                )
              }
            >
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Smart Suggestion
              </Typography>
              {lastScheduledTime ? (
                <>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    Last scheduled post: <strong>{lastScheduledTime.format('MMM D, h:mm A')}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    Suggested time (24h later): <strong>{suggestedTime.format('MMM D, h:mm A')}</strong>
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  No scheduled posts yet. Suggested time: <strong>{suggestedTime.format('MMM D, h:mm A')}</strong>
                </Typography>
              )}
            </Alert>
          )}
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Scheduled Date & Time"
              value={scheduledDateTime}
              onChange={(newValue) => {
                console.log('DateTimePicker onChange:', newValue?.format());
                setScheduledDateTime(newValue);
              }}
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
            onClick={handleScheduleDialogClose}
            color="inherit"
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
    </MainLayout>
  );
};

export default Ideas;

