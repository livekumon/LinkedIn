import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Stack,
} from '@mui/material';
import {
  Article,
  LightbulbOutlined,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { creditAPI } from '../services/creditService';

const CreditHistory = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [byIdea, setByIdea] = useState({ ideas: [], summary: {} });
  const [byArticle, setByArticle] = useState({ articles: [], summary: {} });

  useEffect(() => {
    fetchCreditHistory();
  }, []);

  const fetchCreditHistory = async () => {
    try {
      setLoading(true);
      const [ideaRes, articleRes] = await Promise.all([
        creditAPI.getCreditUsageByIdea(),
        creditAPI.getCreditUsageByArticle()
      ]);

      setByIdea(ideaRes.data.data);
      setByArticle(articleRes.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch credit history:', err);
      setError('Failed to load credit history');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getTransactionTypeColor = (type) => {
    return type === 'add' ? 'success' : type === 'deduct' ? 'error' : 'default';
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Credit History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Track your AI credit consumption
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}>{error}</Alert>}

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
          <Grid size={{ xs: 4, sm: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 } }}>
                  Credits
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem' } }}>
                  {byIdea.summary?.totalCreditsUsed || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 } }}>
                  used
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 4, sm: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 } }}>
                  Articles
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem' } }}>
                  {byArticle.summary?.totalArticlesGenerated || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 } }}>
                  generated
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 4, sm: 4 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: { xs: 0.5, sm: 1 } }}>
                  Ideas
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem' } }}>
                  {byIdea.summary?.ideasWithAI || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, display: 'block', mt: { xs: 0.5, sm: 1 } }}>
                  with AI
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              minHeight: { xs: 48, sm: 56 },
              '& .MuiTab-root': {
                fontSize: { xs: '0.85rem', sm: '0.95rem' },
                minHeight: { xs: 48, sm: 56 },
                py: { xs: 1.5, sm: 2 }
              }
            }}
          >
            <Tab label="Ideas" />
            <Tab label="Articles" />
            <Tab label="Transactions" />
          </Tabs>

          {/* By Idea Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {byIdea.ideas?.length > 0 ? (
                <Stack spacing={0}>
                  {byIdea.ideas.map((idea) => (
                    <Box 
                      key={idea._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          sx={{ 
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: { xs: '0.875rem', sm: '0.95rem' }
                          }}
                        >
                          {idea.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {idea.aiGenerationCount} generations
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {idea.creditsUsed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          credits
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <LightbulbOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No ideas with AI credit usage yet
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* By Article Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {byArticle.articles?.length > 0 ? (
                <Stack spacing={0}>
                  {byArticle.articles.map((article) => (
                    <Box 
                      key={article._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          sx={{ 
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: { xs: '0.875rem', sm: '0.95rem' }
                          }}
                        >
                          {article.ideaTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(article.generatedAt).toLocaleDateString()}
                          {article.article?.tone && ` • ${article.article.tone}`}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {article.creditsUsed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          credits
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Article sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No articles generated yet
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* All Transactions Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <AllTransactionsView />
            </Box>
          )}
        </Paper>
      </Container>
    </MainLayout>
  );
};

// Sub-component for all transactions view
const AllTransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const fetchAllTransactions = async () => {
    try {
      const res = await creditAPI.getCreditTransactions();
      setTransactions(res.data.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <TimelineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No transactions yet
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      {transactions.map((tx, idx) => (
        <Box 
          key={tx._id}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' }
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{ 
                mb: 0.5,
                fontSize: { xs: '0.875rem', sm: '0.95rem' }
              }}
            >
              {tx.transactionType === 'add' ? '+' : '-'}{tx.creditsChanged}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              {new Date(tx.createdAt).toLocaleDateString()} • {tx.reason}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography variant="h6" fontWeight={700}>
              {tx.creditsAfterTransaction}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              balance
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default CreditHistory;

