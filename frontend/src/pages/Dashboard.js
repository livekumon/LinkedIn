import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Stack,
  Button,
  LinearProgress,
  Divider,
  Grid,
} from '@mui/material';
import { 
  LightbulbOutlined,
  StarOutline,
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
  const credits = analytics?.credits || {};
  const payments = analytics?.payments || {};
  const recentTransactions = analytics?.recentTransactions || [];
  const aiGenerated = analytics?.ai?.generatedArticles || 0;
  const scheduled = analytics?.linkedIn?.scheduled || 0;
  const isLinkedInConnected = analytics?.linkedIn?.isConnected || false;

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{ mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            Welcome back, {user?.name?.split(' ')[0]}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Your content overview
          </Typography>
        </Box>

        {/* Main Stats - Horizontal Scrollable Carousel */}
        <Box 
          sx={{ 
            mb: 4,
            overflow: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 2 },
            minWidth: 'min-content',
          }}>
            {/* Total Ideas */}
            <Card 
              onClick={() => navigate('/ideas')}
              sx={{
                borderRadius: 2,
                minWidth: { xs: 140, sm: 200 },
                cursor: 'pointer',
                border: '2px solid',
                borderColor: '#5B7C99',
                bgcolor: 'rgba(91, 124, 153, 0.05)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(91, 124, 153, 0.25)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 }, color: '#5B7C99', fontWeight: 600 }}>
                  Ideas
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#5B7C99' }}>
                  {totalIdeas}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 }, color: '#5B7C99' }}>
                  total
                </Typography>
              </CardContent>
            </Card>

            {/* LinkedIn Posts */}
            <Card 
              sx={{
                borderRadius: 2,
                minWidth: { xs: 140, sm: 200 },
                border: '2px solid',
                borderColor: '#0077B5',
                bgcolor: 'rgba(0, 119, 181, 0.05)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 }, color: '#0077B5', fontWeight: 600 }}>
                  Posts
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#0077B5' }}>
                  {linkedInPosts}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 }, color: '#0077B5' }}>
                  published
                </Typography>
              </CardContent>
            </Card>

            {/* AI Generated */}
            <Card 
              sx={{
                borderRadius: 2,
                minWidth: { xs: 140, sm: 200 },
                border: '2px solid',
                borderColor: '#6B4C9A',
                bgcolor: 'rgba(107, 76, 154, 0.05)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 }, color: '#6B4C9A', fontWeight: 600 }}>
                  AI Articles
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#6B4C9A' }}>
                  {aiGenerated}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 }, color: '#6B4C9A' }}>
                  generated
                </Typography>
              </CardContent>
            </Card>

            {/* Scheduled */}
            <Card 
              sx={{
                borderRadius: 2,
                minWidth: { xs: 140, sm: 200 },
                border: '2px solid',
                borderColor: '#2E7D32',
                bgcolor: 'rgba(46, 125, 50, 0.05)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 }, color: '#2E7D32', fontWeight: 600 }}>
                  Scheduled
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: '#2E7D32' }}>
                  {scheduled}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 }, color: '#2E7D32' }}>
                  posts
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* AI Credits & Payments Row */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          {/* AI Credits Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                height: '100%',
                border: '2px solid',
                borderColor: '#6366F1',
                bgcolor: 'rgba(99, 102, 241, 0.05)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: '#6366F1' }}>
                    AI Credits
                  </Typography>
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => navigate('/subscriptions')}
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      bgcolor: '#6366F1',
                      '&:hover': { bgcolor: '#4F46E5' }
                    }}
                  >
                    Buy
                  </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Available Credits
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: '#6366F1' }}>
                      {credits.remaining || 0} / {credits.total || 0}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100 - (credits.usagePercentage || 0)}
                    sx={{ 
                      height: 10, 
                      borderRadius: 10,
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 10,
                        background: credits.usagePercentage > 80 ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)' : 
                                   credits.usagePercentage > 50 ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)' : 
                                   'linear-gradient(90deg, #059669 0%, #10B981 100%)'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {credits.used || 0} credits used ({credits.usagePercentage || 0}%)
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Recent
                </Typography>
                {recentTransactions.length > 0 ? (
                  <Stack spacing={0}>
                    {recentTransactions.slice(0, 3).map((tx, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          py: 1,
                          borderBottom: idx < 2 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                            {tx.transactionType === 'add' ? '+' : '-'}{tx.creditsChanged}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {tx.reason}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                    No transactions yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payments Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                borderRadius: 2, 
                height: '100%',
                border: '2px solid',
                borderColor: '#0891B2',
                bgcolor: 'rgba(8, 145, 178, 0.05)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: '#0891B2' }}>
                  Payment History
                </Typography>

                <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Payments
                      </Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        {payments.totalPayments || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        Spent
                      </Typography>
                      <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        ${payments.totalSpent?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {payments.lastPayment ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Last Payment
                    </Typography>
                    <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                          {payments.lastPayment.plan}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                          ${payments.lastPayment.amount?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {new Date(payments.lastPayment.date).toLocaleDateString()} • +{payments.lastPayment.credits} credits
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                    No payments yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Ideas by Status */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                border: '2px solid',
                borderColor: '#64748B',
                bgcolor: 'rgba(100, 116, 139, 0.05)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: '#64748B' }}>
                  Ideas by Status
                </Typography>
                
                <Stack spacing={0}>
                  {Object.entries(stats).map(([status, count]) => {
                    const percentage = totalIdeas > 0 ? (count / totalIdeas) * 100 : 0;
                    
                    return (
                      <Box 
                        key={status}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>
                          {status.replace('_', ' ')}
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {count}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={{ xs: 2, sm: 3 }}>
              {/* Quick Actions */}
              <Card 
                sx={{ 
                  borderRadius: 2,
                  border: '2px solid',
                borderColor: '#6366F1',
                bgcolor: 'rgba(99, 102, 241, 0.05)',
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: '#6366F1' }}>
                    Quick Actions
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/ideas')}
                      sx={{ 
                        py: 1.5,
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        bgcolor: '#6366F1',
                        '&:hover': { bgcolor: '#4F46E5' }
                      }}
                    >
                      Create Idea
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/favorites')}
                      sx={{ 
                        py: 1.5,
                        fontSize: { xs: '0.875rem', sm: '0.95rem' },
                        borderColor: '#6366F1',
                        color: '#6366F1',
                        '&:hover': { 
                          borderColor: '#4F46E5',
                          bgcolor: 'rgba(99, 102, 241, 0.05)'
                        }
                      }}
                    >
                      Favorites
                    </Button>
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