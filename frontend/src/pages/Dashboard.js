import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Button,
  LinearProgress,
  Divider,
  Grid,
} from '@mui/material';
import { 
  LightbulbOutlined,
  AutoAwesome,
  CheckCircle,
  Schedule,
  LinkedIn,
  Analytics,
  EditNote,
  Archive,
  StarOutline,
  Timeline
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import MainLayout from '../components/Layout/MainLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboardAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#9E9E9E',
      ai_generated: '#2196F3',
      scheduled: '#FF9800',
      posted: '#4CAF50',
      archived: '#607D8B'
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: EditNote,
      ai_generated: AutoAwesome,
      scheduled: Schedule,
      posted: CheckCircle,
      archived: Archive
    };
    return icons[status] || EditNote;
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            Loading dashboard...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  const stats = analytics?.ideas?.byStatus || {};
  const totalIdeas = analytics?.ideas?.total || 0;
  const linkedInPosts = analytics?.linkedIn?.published || 0;
  const aiGenerated = analytics?.ai?.generatedArticles || 0;
  const scheduled = analytics?.linkedIn?.scheduled || 0;
  const isLinkedInConnected = analytics?.linkedIn?.isConnected || false;

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight={600} 
            gutterBottom
            sx={{ color: 'text.primary' }}
          >
            Welcome back, {user?.name?.split(' ')[0]}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: '1.1rem' }}
          >
            Here's your content creation overview
          </Typography>
        </Box>

        {/* Main Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Ideas */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 2,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }} onClick={() => navigate('/ideas')}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} color="primary">
                      {totalIdeas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Total Ideas
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                    <LightbulbOutlined sx={{ fontSize: 24 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* LinkedIn Posts */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 2,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} color="secondary">
                      {linkedInPosts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      LinkedIn Posts
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.light', width: 48, height: 48 }}>
                    <LinkedIn sx={{ fontSize: 24 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Generated */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 2,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ color: '#FF9800' }}>
                      {aiGenerated}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      AI Generated
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#FFF3E0', width: 48, height: 48 }}>
                    <AutoAwesome sx={{ fontSize: 24, color: '#FF9800' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Scheduled */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{
              borderRadius: 2,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ color: '#4CAF50' }}>
                      {scheduled}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Scheduled
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#E8F5E8', width: 48, height: 48 }}>
                    <Schedule sx={{ fontSize: 24, color: '#4CAF50' }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Ideas by Status */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ 
              borderRadius: 2,
              height: '100%',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'grey.100', width: 40, height: 40 }}>
                    <Analytics sx={{ color: 'text.primary' }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Ideas by Status
                  </Typography>
                </Box>
                
                <Stack spacing={2}>
                  {Object.entries(stats).map(([status, count]) => {
                    const Icon = getStatusIcon(status);
                    const color = getStatusColor(status);
                    const percentage = totalIdeas > 0 ? (count / totalIdeas) * 100 : 0;
                    
                    return (
                      <Box key={status}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: `${color}20`, width: 32, height: 32 }}>
                              <Icon sx={{ fontSize: 18, color: color }} />
                            </Avatar>
                            <Typography variant="body1" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                              {status.replace('_', ' ')}
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            {count}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: color,
                              borderRadius: 3
                            }
                          }} 
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* LinkedIn Connection Status */}
              <Card sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LinkedIn sx={{ fontSize: 24, color: 'text.primary' }} />
                    <Typography variant="h6" fontWeight={600}>
                      LinkedIn Status
                    </Typography>
                  </Box>
                  <Chip 
                    icon={isLinkedInConnected ? <CheckCircle /> : <Schedule />}
                    label={isLinkedInConnected ? 'Connected' : 'Not Connected'}
                    color={isLinkedInConnected ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<LightbulbOutlined />}
                      onClick={() => navigate('/ideas')}
                      sx={{ 
                        py: 1.5, 
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      Create New Idea
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<StarOutline />}
                      onClick={() => navigate('/favorites')}
                      sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
                    >
                      View Favorites
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Archive />}
                      onClick={() => navigate('/recycle-bin')}
                      sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
                    >
                      Recycle Bin
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'grey.100', width: 40, height: 40 }}>
                      <Timeline sx={{ color: 'text.primary' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      This Week
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        New Ideas
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {analytics?.activity?.recentIdeas || 0}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Posts Published
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {analytics?.activity?.recentPosts || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
};

export default Dashboard;