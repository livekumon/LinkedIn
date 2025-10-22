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
import { ideaAPI } from '../services/ideaService';
import { geminiAPI } from '../services/geminiService';
import MainLayout from '../components/Layout/MainLayout';
import ArticleGeneratorModal from '../components/ArticleGeneratorModal';

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

  useEffect(() => {
    fetchIdeas();
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
    
    // Update idea status to ai_generated
    try {
      await ideaAPI.updateIdea(idea._id, { status: 'ai_generated' });
      fetchIdeas();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleGenerateArticleAPI = async (ideaId, tone = 'default', regenerate = false) => {
    try {
      const response = await geminiAPI.generateArticle(ideaId, tone, regenerate);
      return response.data.data.article;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to generate article');
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

        {/* Input Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            mb: 2,
            borderRadius: 2,
            border: '1px solid #E0E0E0',
          }}
        >
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontFamily: 'Inter, sans-serif',
                  py: { xs: 0.5, sm: 1 },
                },
              }}
            />

            <Tooltip title="Save Idea" arrow>
              <span>
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
              </span>
            </Tooltip>

            <Tooltip title="Filter Ideas" arrow>
              <IconButton
                onClick={handleFilterMenuOpen}
                sx={{
                  bgcolor: statusFilter !== 'all' ? 'primary.main' : 'background.default',
                  color: statusFilter !== 'all' ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor: statusFilter !== 'all' ? 'primary.main' : 'divider',
                  '&:hover': {
                    bgcolor: statusFilter !== 'all' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <Badge 
                  variant="dot" 
                  color="error" 
                  invisible={statusFilter === 'all'}
                >
                  <FilterList />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={filterMenuAnchorEl}
              open={Boolean(filterMenuAnchorEl)}
              onClose={handleFilterMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  minWidth: 200,
                  mt: 1,
                }
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Filter by Status
                </Typography>
              </Box>
              {filterOptions.map((option) => (
                <MenuItem 
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  selected={statusFilter === option.value}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'rgba(0, 119, 181, 0.08)',
                    },
                  }}
                >
                  <ListItemText 
                    primary={option.label}
                    primaryTypographyProps={{
                      fontWeight: statusFilter === option.value ? 600 : 400,
                    }}
                  />
                  {statusFilter === option.value && (
                    <ListItemIcon sx={{ justifyContent: 'flex-end', minWidth: 'auto' }}>
                      <Check fontSize="small" color="primary" />
                    </ListItemIcon>
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Paper>

        {/* Ideas Table/Cards */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : ideas.length === 0 ? (
            <Paper sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', bgcolor: 'background.default' }}>
              <LightbulbOutlined sx={{ fontSize: { xs: 40, sm: 60 }, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                No ideas yet. Create your first idea!
              </Typography>
            </Paper>
          ) : (
            /* Card View for All Devices */
            <Grid container spacing={2}>
              {ideas.map((idea) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idea._id}>
                  <Card 
                    onClick={() => editingId !== idea._id && handleGenerateArticle(idea)}
                    sx={{ 
                      border: '1px solid #E0E0E0', 
                      borderRadius: 2,
                      cursor: editingId !== idea._id ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: editingId !== idea._id ? '0 4px 12px rgba(0, 0, 0, 0.12)' : 'none',
                        transform: editingId !== idea._id ? 'translateY(-2px)' : 'none',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {editingId === idea._id ? (
                        <Box>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Check />}
                              onClick={() => handleSaveEdit(idea._id)}
                              sx={{ flex: 1 }}
                            >
                              Save
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Close />}
                              onClick={handleCancelEdit}
                              sx={{ flex: 1 }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <>
                          {/* Action Icons Row */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title={idea.isFavorite ? "Remove from favorites" : "Add to favorites"}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(idea);
                                  }}
                                  sx={{ color: idea.isFavorite ? 'warning.main' : 'text.secondary' }}
                                >
                                  {idea.isFavorite ? <Star fontSize="small" /> : <StarOutline fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(idea);
                                  }}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Chip 
                              label={idea.status === 'ai_generated' ? 'AI Generated' : idea.status} 
                              size="small"
                              onClick={(e) => handleStatusMenuOpen(e, idea)}
                              color={
                                idea.status === 'posted' ? 'success' : 
                                idea.status === 'scheduled' ? 'primary' : 
                                idea.status === 'ai_generated' ? 'warning' : 
                                idea.status === 'archived' ? 'error' :
                                'default'
                              }
                              sx={{ 
                                textTransform: 'capitalize', 
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.8,
                                }
                              }}
                            />
                          </Box>

                          {/* Content */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flex: 1, 
                              wordBreak: 'break-word',
                              mb: 2,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {idea.content}
                          </Typography>

                          {/* Dates and Info */}
                          <Box sx={{ mt: 'auto' }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Created: {new Date(idea.createdAt).toLocaleDateString()}
                            </Typography>
                            {idea.postedAt && (
                              <Typography variant="caption" color="success.main" display="block" sx={{ mb: 0.5 }}>
                                ✓ Posted: {new Date(idea.postedAt).toLocaleString()}
                              </Typography>
                            )}
                            {idea.scheduledFor && idea.status === 'scheduled' && (
                              <Typography variant="caption" color="primary.main" display="block" sx={{ mb: 0.5 }}>
                                ⏰ Scheduled: {new Date(idea.scheduledFor).toLocaleString()}
                              </Typography>
                            )}
                            
                            {/* Delete Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(idea);
                                  }}
                                >
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
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
            minWidth: 180,
            mt: 1,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Change Status
          </Typography>
        </Box>
        {statusOptions.map((option) => (
          <MenuItem 
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            selected={selectedIdeaForStatus?.status === option.value}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'rgba(0, 119, 181, 0.08)',
              },
            }}
          >
            <Chip
              label={option.label}
              size="small"
              color={option.color}
              variant={selectedIdeaForStatus?.status === option.value ? 'filled' : 'outlined'}
              sx={{ 
                mr: 1,
                fontSize: '0.75rem',
              }}
            />
            <ListItemText 
              primary={option.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: selectedIdeaForStatus?.status === option.value ? 600 : 400,
              }}
            />
            {selectedIdeaForStatus?.status === option.value && (
              <ListItemIcon sx={{ justifyContent: 'flex-end', minWidth: 'auto' }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </MainLayout>
  );
};

export default Ideas;

