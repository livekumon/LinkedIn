import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Star,
  StarBorder,
  Tag,
  AlternateEmail,
  Close,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { tagSetAPI } from '../services/tagSetService';

const TagSets = () => {
  const navigate = useNavigate();
  const [tagSets, setTagSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasPro, setHasPro] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTagSet, setEditingTagSet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hashtags: [],
    mentions: [],
    isDefault: false,
  });
  
  const [hashtagInput, setHashtagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');

  useEffect(() => {
    fetchTagSets();
  }, []);

  const fetchTagSets = async () => {
    try {
      setLoading(true);
      const [tagSetsRes, defaultRes] = await Promise.all([
        tagSetAPI.getAllTagSets(),
        tagSetAPI.getDefaultTagSet()
      ]);
      
      setTagSets(tagSetsRes.data.data.tagSets || []);
      setHasPro(tagSetsRes.data.data.hasPro || false);
      setError('');
    } catch (err) {
      console.error('Failed to fetch tagsets:', err);
      setError('Failed to load hashtag sets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tagSet = null) => {
    if (tagSet) {
      setEditingTagSet(tagSet);
      setFormData({
        name: tagSet.name,
        description: tagSet.description || '',
        hashtags: tagSet.hashtags || [],
        mentions: tagSet.mentions || [],
        isDefault: tagSet.isDefault,
      });
    } else {
      setEditingTagSet(null);
      setFormData({
        name: '',
        description: '',
        hashtags: [],
        mentions: [],
        isDefault: false,
      });
    }
    setHashtagInput('');
    setMentionInput('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTagSet(null);
  };

  const handleAddHashtag = () => {
    if (!hashtagInput.trim()) return;
    
    let tag = hashtagInput.trim();
    if (!tag.startsWith('#')) {
      tag = '#' + tag;
    }
    
    // Remove spaces and special chars except underscore
    tag = tag.replace(/[^#a-zA-Z0-9_]/g, '');
    
    if (tag.length > 1 && !formData.hashtags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag]
      }));
    }
    setHashtagInput('');
  };

  const handleAddMention = () => {
    if (!mentionInput.trim()) return;
    
    let mention = mentionInput.trim();
    if (!mention.startsWith('@')) {
      mention = '@' + mention;
    }
    
    // Remove spaces and special chars except underscore and dash
    mention = mention.replace(/[^@a-zA-Z0-9_-]/g, '');
    
    if (mention.length > 1 && !formData.mentions.includes(mention)) {
      setFormData(prev => ({
        ...prev,
        mentions: [...prev.mentions, mention]
      }));
    }
    setMentionInput('');
  };

  const handleRemoveHashtag = (tag) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== tag)
    }));
  };

  const handleRemoveMention = (mention) => {
    setFormData(prev => ({
      ...prev,
      mentions: prev.mentions.filter(m => m !== mention)
    }));
  };

  const handleSave = async () => {
    if (!hasPro) {
      setError('TagSets are a Pro feature. Please upgrade to Pro plan.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      if (editingTagSet) {
        await tagSetAPI.updateTagSet(editingTagSet._id, formData);
        setSuccess('TagSet updated successfully');
      } else {
        await tagSetAPI.createTagSet(formData);
        setSuccess('TagSet created successfully');
      }
      
      handleCloseDialog();
      fetchTagSets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tagset');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSetDefault = async (id) => {
    if (!hasPro) {
      setError('Default tagsets are a Pro feature. Please upgrade to Pro plan.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    try {
      await tagSetAPI.setDefaultTagSet(id);
      setSuccess('Default tagset updated');
      fetchTagSets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default tagset');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tag set?')) return;
    
    try {
      await tagSetAPI.deleteTagSet(id);
      setSuccess('TagSet deleted successfully');
      fetchTagSets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete tagset');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          <Tooltip title="Create Tag Set">
            <span>
              <IconButton
                color="primary"
                onClick={() => handleOpenDialog()}
                disabled={!hasPro}
                sx={{
                  bgcolor: hasPro ? 'primary.main' : 'action.disabledBackground',
                  color: 'white',
                  '&:hover': {
                    bgcolor: hasPro ? 'primary.dark' : 'action.disabledBackground',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  }
                }}
              >
                <Add />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {!hasPro && (
          <Alert 
            severity="info" 
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/subscriptions')}>
                Upgrade
              </Button>
            }
            sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}
          >
            Pro feature. Upgrade to create tag sets.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : tagSets.length > 0 ? (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {tagSets.map((tagSet) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tagSet._id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1, 
                    borderColor: tagSet.isDefault ? 'primary.main' : 'divider',
                    height: '100%',
                    bgcolor: tagSet.isDefault ? 'action.selected' : 'background.paper'
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                          {tagSet.name}
                          {tagSet.isDefault && ' ★'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleSetDefault(tagSet._id)}
                          disabled={tagSet.isDefault}
                          sx={{ 
                            p: { xs: 0.75, sm: 0.5 },
                            minWidth: { xs: 36, sm: 'auto' },
                            minHeight: { xs: 36, sm: 'auto' },
                          }}
                        >
                          {tagSet.isDefault ? <Star fontSize="small" color="primary" /> : <StarBorder fontSize="small" />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(tagSet)}
                          sx={{ 
                            p: { xs: 0.75, sm: 0.5 },
                            minWidth: { xs: 36, sm: 'auto' },
                            minHeight: { xs: 36, sm: 'auto' },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(tagSet._id)} 
                          color="error"
                          sx={{ 
                            p: { xs: 0.75, sm: 0.5 },
                            minWidth: { xs: 36, sm: 'auto' },
                            minHeight: { xs: 36, sm: 'auto' },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Tags Display */}
                    {tagSet.hashtags && tagSet.hashtags.length > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {tagSet.hashtags.length} hashtags
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {tagSet.hashtags.slice(0, 5).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              sx={{ height: 20, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          ))}
                          {tagSet.hashtags.length > 5 && (
                            <Chip
                              label={`+${tagSet.hashtags.length - 5}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Mentions Display */}
                    {tagSet.mentions && tagSet.mentions.length > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {tagSet.mentions.length} mentions
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {tagSet.mentions.slice(0, 3).map((mention, idx) => (
                            <Chip
                              key={idx}
                              label={mention}
                              size="small"
                              sx={{ height: 20, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          ))}
                          {tagSet.mentions.length > 3 && (
                            <Chip
                              label={`+${tagSet.mentions.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Footer */}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {tagSet.usageCount || 0} uses • {new Date(tagSet.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
            <Tag sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              {hasPro 
                ? 'No tag sets yet. Create one to get started.'
                : 'Upgrade to Pro to create tag sets.'
              }
            </Typography>
          </Box>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTagSet ? 'Edit Tag Set' : 'Create New Tag Set'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Tag Set Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Tech & Innovation, Marketing, Personal Brand"
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder="Optional description"
              />

              {/* Hashtags Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Tag sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Hashtags
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter hashtag (e.g., AI, Technology)"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                  />
                  <Button variant="outlined" onClick={handleAddHashtag}>
                    Add
                  </Button>
                </Box>
                {formData.hashtags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    {formData.hashtags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        onDelete={() => handleRemoveHashtag(tag)}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Mentions Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AlternateEmail sx={{ color: 'secondary.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    User Mentions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter username (e.g., billgates, elonmusk)"
                    value={mentionInput}
                    onChange={(e) => setMentionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMention()}
                  />
                  <Button variant="outlined" onClick={handleAddMention}>
                    Add
                  </Button>
                </Box>
                {formData.mentions.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    {formData.mentions.map((mention, idx) => (
                      <Chip
                        key={idx}
                        label={mention}
                        onDelete={() => handleRemoveMention(mention)}
                        color="secondary"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>Set as default tag set</span>
                    <Typography variant="caption" color="text.secondary">
                      (Auto-applies when posting)
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              disabled={!formData.name}
            >
              {editingTagSet ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default TagSets;

