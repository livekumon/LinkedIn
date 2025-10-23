import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  TextField,
} from '@mui/material';
import { 
  AutoAwesome, 
  Close, 
  ContentCopy,
  CheckCircle,
  Send,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { geminiAPI } from '../services/geminiService';
import { linkedInPostAPI } from '../services/linkedInPostService';
import { tagSetAPI } from '../services/tagSetService';
import { ideaAPI } from '../services/ideaService';
import { 
  convertUserTimezoneToUTC, 
  convertUTCToUserTimezone,
  getUserTimezone,
  getCurrentTimeInUserTimezone 
} from '../utils/timezoneUtils';
import dayjs from 'dayjs';

const ArticleGeneratorModal = ({ open, onClose, idea, onGenerate, onPost, onSchedule }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [article, setArticle] = useState('');
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState('default');
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [lastScheduledTime, setLastScheduledTime] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState(null);
  const [includeSources, setIncludeSources] = useState(false);
  const [tagSets, setTagSets] = useState([]);
  const [selectedTagSet, setSelectedTagSet] = useState('');
  const [hasPro, setHasPro] = useState(false);

  useEffect(() => {
    if (open && idea) {
      fetchVersions();
      fetchTagSets();
    }
  }, [open, idea]);

  const fetchTagSets = async () => {
    try {
      const [tagSetsRes, defaultRes] = await Promise.all([
        tagSetAPI.getAllTagSets(),
        tagSetAPI.getDefaultTagSet()
      ]);
      
      setTagSets(tagSetsRes.data.data.tagSets || []);
      setHasPro(tagSetsRes.data.data.hasPro || false);
      
      // Pre-select default tagset if available
      if (defaultRes.data.data.hasPro && defaultRes.data.data.tagSet) {
        setSelectedTagSet(defaultRes.data.data.tagSet._id);
      }
    } catch (err) {
      console.error('Failed to fetch tagsets:', err);
    }
  };

  const fetchVersions = async () => {
    if (!idea) return;
    
    try {
      setLoadingVersions(true);
      const response = await geminiAPI.getArticleVersions(idea._id);
      const fetchedVersions = response.data.data.versions;
      setVersions(fetchedVersions);
      
      // Auto-select the latest version (first in the sorted array)
      if (fetchedVersions.length > 0) {
        const latest = fetchedVersions[0];
        setSelectedVersion(latest);
        setArticle(latest.content);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleGenerate = async (regenerate = false) => {
    setError('');
    setLoading(true);
    
    try {
      const response = await geminiAPI.generateArticle(idea._id, tone, regenerate, includeSources);
      const generated = response.data.data;
      setArticle(generated.article);
      
      // Refresh versions
      await fetchVersions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate article');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate(true);
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    setArticle(version.content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppendTagSet = async () => {
    if (!selectedTagSet || !article) return;

    const tagSet = tagSets.find(ts => ts._id === selectedTagSet);
    if (!tagSet) return;

    // Build the tags string
    const hashtagsText = tagSet.hashtags && tagSet.hashtags.length > 0 
      ? '\n\n' + tagSet.hashtags.join(' ') 
      : '';
    const mentionsText = tagSet.mentions && tagSet.mentions.length > 0 
      ? '\n' + tagSet.mentions.join(' ') 
      : '';

    const updatedArticle = article + hashtagsText + mentionsText;
    setArticle(updatedArticle);

    // Update the selected version content as well
    if (selectedVersion) {
      setSelectedVersion(prev => ({
        ...prev,
        content: updatedArticle
      }));
    }

    // Record usage
    try {
      await tagSetAPI.recordUsage(selectedTagSet);
    } catch (err) {
      console.error('Failed to record tagset usage:', err);
    }
  };

  const handleClose = () => {
    setArticle('');
    setError('');
    setCopied(false);
    setTone('default');
    setIncludeSources(false);
    setVersions([]);
    setSelectedVersion(null);
    onClose();
  };

  const handlePost = async () => {
    if (article && selectedVersion) {
      try {
        setLoading(true);
        await linkedInPostAPI.postArticle(selectedVersion._id);
        await onPost(article, selectedVersion);
        // Small delay to allow status update to be visible
        setTimeout(() => {
          handleClose();
        }, 500);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to post to LinkedIn');
        setLoading(false);
      }
    }
  };

  const getLastScheduledTime = async () => {
    try {
      const response = await ideaAPI.getAllIdeas();
      const ideas = response.data.data.ideas;
      
      // Get all scheduled ideas
      const scheduledIdeas = ideas.filter(idea => idea.status === 'scheduled' && idea.scheduledFor);
      if (scheduledIdeas.length === 0) return null;
      
      // Sort by scheduledFor and get the last one
      scheduledIdeas.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
      return scheduledIdeas[scheduledIdeas.length - 1].scheduledFor;
    } catch (err) {
      console.error('Failed to get last scheduled time:', err);
      return null;
    }
  };

  const getSuggestedScheduleTime = (lastTime) => {
    const userTimezone = getUserTimezone();
    
    if (!lastTime) {
      // No scheduled posts, suggest current time + 1 hour
      return getCurrentTimeInUserTimezone(userTimezone).add(1, 'hour');
    }
    
    // Get the last scheduled time and add 24 hours
    const lastTimeInUserTz = convertUTCToUserTimezone(lastTime, userTimezone);
    return lastTimeInUserTz.add(24, 'hour');
  };

  const handleScheduleClick = async () => {
    // Get last scheduled time
    const lastTime = await getLastScheduledTime();
    const userTimezone = getUserTimezone();
    
    if (lastTime) {
      setLastScheduledTime(convertUTCToUserTimezone(lastTime, userTimezone));
    } else {
      setLastScheduledTime(null);
    }
    
    // Get suggested time
    const suggested = getSuggestedScheduleTime(lastTime);
    setSuggestedTime(suggested);
    
    // Format suggested time for datetime-local input
    const year = suggested.year();
    const month = String(suggested.month() + 1).padStart(2, '0');
    const day = String(suggested.date()).padStart(2, '0');
    const hours = String(suggested.hour()).padStart(2, '0');
    const minutes = String(suggested.minute()).padStart(2, '0');
    const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    setScheduledDateTime(defaultDateTime);
    setScheduleDialogOpen(true);
  };

  const handleScheduleConfirm = async () => {
    if (article && selectedVersion && scheduledDateTime) {
      try {
        setScheduleDialogOpen(false);
        setLoading(true);
        
        // Convert user's timezone to UTC before sending to backend
        const utcTime = convertUserTimezoneToUTC(scheduledDateTime, getUserTimezone());
        
        await linkedInPostAPI.scheduleArticle(selectedVersion._id, utcTime);
        await onSchedule(article, selectedVersion);
        // Small delay to allow status update to be visible
        setTimeout(() => {
          handleClose();
        }, 500);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to schedule post');
        setLoading(false);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: '95vh', sm: '90vh' }
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            AI Article
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Original Idea */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
            Original
          </Typography>
          <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
              {idea?.content}
            </Typography>
          </Box>
        </Box>

        {/* Generate Controls */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 150 }, flex: { sm: 1 } }}>
              <InputLabel>Tone</InputLabel>
              <Select
                value={tone}
                label="Tone"
                onChange={(e) => setTone(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.95rem',
                        py: 1.5,
                        minHeight: 48, // Better touch target
                      }
                    }
                  }
                }}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="inspiring">Inspiring</MenuItem>
                <MenuItem value="educational">Educational</MenuItem>
                <MenuItem value="storytelling">Storytelling</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: { xs: '48%', sm: 150 }, flex: { sm: 1 } }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={includeSources ? 'with-sources' : 'free-form'}
                label="Type"
                onChange={(e) => setIncludeSources(e.target.value === 'with-sources')}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        fontSize: '0.95rem',
                        py: 1.5,
                        minHeight: 48, // Better touch target
                      }
                    }
                  }
                }}
              >
                <MenuItem value="free-form">Free Form</MenuItem>
                <MenuItem value="with-sources">With Sources</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => handleGenerate(versions.length > 0)}
              disabled={loading}
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                flex: { xs: '1 1 100%', sm: 'none' },
              }}
            >
              {versions.length > 0 ? 'New Version' : 'Generate'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Version List */}
        {loadingVersions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : versions.length > 0 && !loading ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
              Versions ({versions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {versions.map((ver) => (
                <Box
                  key={ver._id}
                  onClick={() => handleVersionSelect(ver)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedVersion?._id === ver._id ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    bgcolor: selectedVersion?._id === ver._id ? 'action.selected' : 'transparent',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        label={`V${ver.version}`} 
                        size="small" 
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Chip 
                        label={ver.tone} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {ver.characterCount}ch
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {new Date(ver.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    }}
                  >
                    {ver.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : null}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
              Generating article...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
            {error}
          </Alert>
        )}

        {/* Selected Article Display */}
        {!loading && selectedVersion && article && (
          <Box>
            {/* TagSet Selection (Pro Feature) */}
            {hasPro && tagSets.length > 0 && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'block' }}>
                  Add Tags (Pro)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Tag Set</InputLabel>
                    <Select
                      value={selectedTagSet}
                      onChange={(e) => setSelectedTagSet(e.target.value)}
                      label="Tag Set"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              fontSize: '0.95rem',
                              py: 1.5,
                              minHeight: 48, // Better touch target
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {tagSets.map((ts) => (
                        <MenuItem key={ts._id} value={ts._id}>
                          {ts.name} {ts.isDefault && '★'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAppendTagSet}
                    disabled={!selectedTagSet || !article}
                    sx={{ minWidth: { xs: 'auto', sm: 100 } }}
                  >
                    Append
                  </Button>
                </Box>
                {selectedTagSet && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(() => {
                      const ts = tagSets.find(t => t._id === selectedTagSet);
                      return ts && (
                        <>
                          {ts.hashtags?.slice(0, 3).map((tag, idx) => (
                            <Chip key={`h-${idx}`} label={tag} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ))}
                          {ts.hashtags?.length > 3 && (
                            <Chip label={`+${ts.hashtags.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </>
                      );
                    })()}
                  </Box>
                )}
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                Article Preview
              </Typography>
              <IconButton onClick={handleCopy} size="small">
                {copied ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
              </IconButton>
            </Box>
            <Box 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: { xs: '300px', sm: '400px' },
                overflow: 'auto',
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                }}
              >
                {article}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      {/* Schedule Date/Time Picker Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={() => setScheduleDialogOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: { m: { xs: 1, sm: 2 } }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>Schedule Post</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Smart Scheduling Suggestion */}
          {suggestedTime && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                lastScheduledTime && (
                  <Button 
                    size="small" 
                    onClick={() => {
                      const year = suggestedTime.year();
                      const month = String(suggestedTime.month() + 1).padStart(2, '0');
                      const day = String(suggestedTime.date()).padStart(2, '0');
                      const hours = String(suggestedTime.hour()).padStart(2, '0');
                      const minutes = String(suggestedTime.minute()).padStart(2, '0');
                      setScheduledDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
                    }}
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
          
          <TextField
            fullWidth
            label="Date & Time"
            type="datetime-local"
            size="small"
            value={scheduledDateTime}
            onChange={(e) => setScheduledDateTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: (() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
              })()
            }}
            helperText={`Time zone: ${getUserTimezone()}`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
          <Button onClick={() => setScheduleDialogOpen(false)} size="small">Cancel</Button>
          <Button 
            variant="contained" 
            size="small"
            onClick={handleScheduleConfirm}
            disabled={!scheduledDateTime}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 1, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          {selectedVersion && article && !loading && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ScheduleIcon />}
                onClick={handleScheduleClick}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Schedule
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<Send />}
                onClick={handlePost}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Post Now
              </Button>
            </>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleGeneratorModal;

