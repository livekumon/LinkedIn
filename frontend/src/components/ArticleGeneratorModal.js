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
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import { 
  AutoAwesome, 
  Close, 
  ContentCopy,
  CheckCircle,
  Refresh,
  History,
  Send,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { geminiAPI } from '../services/geminiService';
import { linkedInPostAPI } from '../services/linkedInPostService';

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
  const [includeSources, setIncludeSources] = useState(false);

  useEffect(() => {
    if (open && idea) {
      fetchVersions();
    }
  }, [open, idea]);

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

  const handleScheduleClick = () => {
    // Get current date/time for default value in local timezone
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Default to 30 minutes from now
    // Format to local timezone for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setScheduledDateTime(defaultDateTime);
    setScheduleDialogOpen(true);
  };

  const handleScheduleConfirm = async () => {
    if (article && selectedVersion && scheduledDateTime) {
      try {
        setScheduleDialogOpen(false);
        setLoading(true);
        await linkedInPostAPI.scheduleArticle(selectedVersion._id, scheduledDateTime);
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: '#F9A826', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              AI-Generated LinkedIn Article
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Original Idea */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
            Original Idea:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="body2" color="text.primary">
              {idea?.content}
            </Typography>
          </Paper>
        </Box>

        {/* Generate New Version Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>Select Tone</InputLabel>
              <Select
                value={tone}
                label="Select Tone"
                onChange={(e) => setTone(e.target.value)}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="inspiring">Inspiring</MenuItem>
                <MenuItem value="educational">Educational</MenuItem>
                <MenuItem value="storytelling">Storytelling</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl component="fieldset" size="small">
              <FormLabel component="legend" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                Article Type
              </FormLabel>
              <RadioGroup
                row
                value={includeSources ? 'with-sources' : 'free-form'}
                onChange={(e) => setIncludeSources(e.target.value === 'with-sources')}
              >
                <FormControlLabel 
                  value="free-form" 
                  control={<Radio size="small" />} 
                  label={<Typography variant="body2">Free Form</Typography>}
                />
                <FormControlLabel 
                  value="with-sources" 
                  control={<Radio size="small" />} 
                  label={<Typography variant="body2">Include Sources</Typography>}
                />
              </RadioGroup>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => handleGenerate(versions.length > 0)}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #F9A826 0%, #E09620 100%)',
                fontWeight: 600,
                px: 3,
                alignSelf: 'flex-end',
              }}
            >
              {versions.length > 0 ? 'Generate New Version' : 'Generate Article'}
            </Button>
          </Box>
          {includeSources && (
            <Alert severity="info" sx={{ mt: 2 }}>
              The article will include credible web sources and links to support the content.
            </Alert>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Version List */}
        {loadingVersions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : versions.length > 0 && !loading ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <History fontSize="small" />
              Article Versions ({versions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {versions.map((ver) => (
                <Paper
                  key={ver._id}
                  onClick={() => handleVersionSelect(ver)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: selectedVersion?._id === ver._id ? '2px solid #0077B5' : '1px solid #E0E0E0',
                    borderRadius: 2,
                    bgcolor: selectedVersion?._id === ver._id ? 'rgba(0, 119, 181, 0.02)' : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={`Version ${ver.version}`} 
                        size="small" 
                        color={selectedVersion?._id === ver._id ? 'primary' : 'default'}
                      />
                      <Chip 
                        label={ver.tone} 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {ver.characterCount} chars
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
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
                    }}
                  >
                    {ver.content}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : null}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Generating professional LinkedIn article with Gemini AI...
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              This may take a few moments
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Selected Article Display */}
        {!loading && selectedVersion && article && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Full Article Preview
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <IconButton onClick={handleCopy} size="small" color={copied ? "success" : "primary"}>
                  {copied ? <CheckCircle /> : <ContentCopy />}
                </IconButton>
              </Tooltip>
            </Box>
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: 'white',
                borderRadius: 2,
                border: '2px solid #0077B5',
                boxShadow: '0 4px 12px rgba(0, 119, 181, 0.1)',
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {article}
              </Typography>
            </Paper>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                💡 AI-optimized for LinkedIn engagement. Review and customize before posting.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      {/* Schedule Date/Time Picker Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Post</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose when you want to publish this article to LinkedIn
            </Typography>
            <TextField
              fullWidth
              label="Date & Time"
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: (() => {
                  // Get current time in local timezone
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, '0');
                  const day = String(now.getDate()).padStart(2, '0');
                  const hours = String(now.getHours()).padStart(2, '0');
                  const minutes = String(now.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })()
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleScheduleConfirm}
            disabled={!scheduledDateTime}
            sx={{
              background: 'linear-gradient(135deg, #0077B5 0%, #00A3E0 100%)',
            }}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      <DialogActions sx={{ p: 3, pt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedVersion && article && !loading && (
            <>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopy}
                sx={{ px: 2 }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ScheduleIcon />}
                onClick={handleScheduleClick}
                sx={{ px: 2 }}
              >
                Schedule
              </Button>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handlePost}
                sx={{
                  background: 'linear-gradient(135deg, #0077B5 0%, #00A3E0 100%)',
                  px: 3,
                  fontWeight: 600,
                }}
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

