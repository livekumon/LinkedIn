import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import MainLayout from '../components/Layout/MainLayout';
import { planAPI } from '../services/planService';
import { paymentAPI } from '../services/paymentService';

const Subscriptions = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [userPlanInfo, setUserPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    fetchPlansAndUserInfo();
  }, []);

  const fetchPlansAndUserInfo = async () => {
    try {
      setLoading(true);
      const [plansResponse, userInfoResponse] = await Promise.all([
        planAPI.getAllPlans(),
        planAPI.getUserPlanInfo()
      ]);
      
      const fetchedPlans = plansResponse.data.data.plans;
      setPlans(fetchedPlans);
      setUserPlanInfo(userInfoResponse.data.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      // Fallback to default plans if API fails - don't show error
      setPlans(getDefaultPlans());
      setUserPlanInfo({ aiCreditsRemaining: 15, aiCreditsTotal: 15, currentPlan: null });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPlans = () => [
    {
      _id: 'free',
      name: 'Free',
      displayName: 'Free',
      price: 0,
      aiArticleCredits: 15,
      tag: null,
      isHighlighted: false,
      features: [
        { name: 'Up to 15 AI-generated articles' },
        { name: 'Basic LinkedIn integration' },
        { name: 'Standard templates' },
        { name: 'Multiple tone options' },
        { name: 'Manual publishing' },
      ],
      metadata: {
        buttonText: 'Current Plan',
        buttonVariant: 'outlined'
      }
    },
    {
      _id: 'starter',
      name: 'Starter',
      displayName: 'Starter',
      price: 5,
      aiArticleCredits: 30,
      tag: 'Best Value',
      isHighlighted: true,
      features: [
        { name: 'Up to 30 AI-generated articles' },
        { name: 'All Free features' },
        { name: 'Priority LinkedIn integration' },
        { name: 'Advanced templates' },
        { name: 'Source citation support' },
        { name: 'Content scheduling' },
      ],
      metadata: {
        buttonText: 'Get Started',
        buttonVariant: 'contained'
      }
    },
    {
      _id: 'pro',
      name: 'Pro',
      displayName: 'Pro',
      price: 10,
      aiArticleCredits: 100,
      tag: null,
      isHighlighted: false,
      features: [
        { name: 'Up to 100 AI-generated articles' },
        { name: 'All Starter features' },
        { name: 'Premium templates' },
        { name: 'Advanced analytics' },
        { name: 'Multiple LinkedIn accounts' },
        { name: 'Bulk content generation' },
        { name: 'Priority support' },
      ],
      metadata: {
        buttonText: 'Get Started',
        buttonVariant: 'contained'
      }
    },
    {
      _id: 'enterprise',
      name: 'Enterprise',
      displayName: 'Enterprise',
      price: null,
      aiArticleCredits: -1,
      isUnlimited: true,
      tag: null,
      isHighlighted: false,
      features: [
        { name: 'Unlimited AI-generated articles' },
        { name: 'All Pro features' },
        { name: 'Dedicated account manager' },
        { name: 'Custom integrations' },
        { name: 'API access' },
        { name: 'Team collaboration' },
        { name: 'White-label options' },
        { name: '24/7 Premium support' },
      ],
      metadata: {
        buttonText: 'Contact Us',
        buttonVariant: 'outlined'
      }
    },
  ];

  const handleSelectPlan = (plan) => {
    const planName = plan.name?.toLowerCase();
    
    // Handle Enterprise plan
    if (planName === 'enterprise') {
      window.location.href = 'mailto:support@linkedinai.com?subject=Enterprise Plan Inquiry';
      return;
    }
    
    // Handle Free plan (no payment needed)
    if (planName === 'free' || plan.price === 0) {
      return; // Free plan is already the default
    }
    
    // Open PayPal payment dialog for paid plans
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
    setPaymentError('');
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedPlan(null);
    setPaymentError('');
  };

  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true);
    setPaymentDialogOpen(false);
    
    // Refresh user plan info
    try {
      const userInfoResponse = await planAPI.getUserPlanInfo();
      setUserPlanInfo(userInfoResponse.data.data);
    } catch (err) {
      console.error('Error refreshing user info:', err);
    }

    // Show success message
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 5000);
  };

  const paypalOptions = {
    'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture'
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <MainLayout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
          {/* User Plan Info */}
          {userPlanInfo && (
            <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.light' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Plan
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {userPlanInfo.currentPlan?.displayName || 'Free'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    AI Credits Remaining
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {userPlanInfo.aiCreditsRemaining} / {userPlanInfo.aiCreditsTotal}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {paymentSuccess && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setPaymentSuccess(false)}>
              Payment successful! Your AI credits have been added to your account.
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: 'text.primary',
              }}
            >
              Choose Your Plan
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              One-time payment • Instant credits • No subscriptions
            </Typography>
          </Box>

              {/* Pricing Cards */}
              <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
                {plans.map((plan, planIndex) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={plan._id}>
                <Card
                  sx={{
                    height: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.highlighted ? 2 : 1,
                    borderColor: plan.highlighted ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    bgcolor: plan.highlighted ? 'rgba(0, 119, 181, 0.02)' : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: plan.highlighted ? 8 : 4,
                      borderColor: 'primary.main',
                    },
                  }}
                  >
                    {/* Tag */}
                    {plan.tag && plan.tag !== '' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                      }}
                    >
                      <Chip
                        label={plan.tag}
                        color="warning"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    </Box>
                  )}

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 2.5,
                    }}
                  >
                    {/* Plan Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        textAlign: 'center',
                        color: 'text.primary',
                      }}
                    >
                      {plan.displayName || plan.name}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: 'primary.main',
                          mb: 0.5,
                        }}
                      >
                        {(() => {
                          const planName = plan.name?.toLowerCase();
                          if (planName === 'free') return 'Free';
                          if (planName === 'enterprise') return 'Custom';
                          if (plan.price === null || plan.price === undefined) return 'Custom';
                          return `$${plan.price}`;
                        })()}
                      </Typography>
                      <Chip 
                        label={plan.isUnlimited ? 'Unlimited Articles' : `${plan.aiArticleCredits} AI Articles`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Features */}
                    <Box sx={{ flexGrow: 1, mb: 2 }}>
                      {(() => {
                        const planName = plan.name?.toLowerCase();
                        const currentIndex = planIndex;
                        
                        // Get features from previous plans to exclude
                        const previousPlanFeatures = new Set();
                        if (currentIndex > 0) {
                          for (let i = 0; i < currentIndex; i++) {
                            const prevPlan = plans[i];
                            if (Array.isArray(prevPlan.features)) {
                              prevPlan.features.forEach(f => {
                                const featureId = typeof f === 'string' ? f : (f._id || f.name);
                                previousPlanFeatures.add(featureId);
                              });
                            }
                          }
                        }
                        
                        // Filter to only NEW features for this tier
                        const newFeatures = (Array.isArray(plan.features) ? plan.features : []).filter(f => {
                          const featureId = typeof f === 'string' ? f : (f._id || f.name);
                          return !previousPlanFeatures.has(featureId);
                        });
                        
                        // Show inheritance message
                        const inheritanceMap = {
                          'starter': 'Free',
                          'pro': 'Starter',
                          'enterprise': 'Pro'
                        };
                        
                        return (
                          <List dense>
                            {inheritanceMap[planName] && (
                              <ListItem sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircle sx={{ fontSize: 18, color: 'primary.main' }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`All ${inheritanceMap[planName]} features`}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    fontWeight: 600,
                                    color: 'primary.main',
                                    sx: { fontSize: '0.85rem' }
                                  }}
                                />
                              </ListItem>
                            )}
                            
                            {/* Show only new features (limit to 5) */}
                            {newFeatures.slice(0, 5).map((feature, idx) => (
                              <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={typeof feature === 'string' ? feature : feature.name}
                                  primaryTypographyProps={{
                                    variant: 'body2',
                                    color: 'text.secondary',
                                    sx: { fontSize: '0.85rem', lineHeight: 1.4 }
                                  }}
                                />
                              </ListItem>
                            ))}
                            {newFeatures.length > 5 && (
                              <ListItem sx={{ px: 0, py: 0.25 }}>
                                <ListItemText
                                  primary={`+ ${newFeatures.length - 5} more features`}
                                  primaryTypographyProps={{
                                    variant: 'caption',
                                    color: 'text.secondary',
                                    sx: { fontStyle: 'italic' }
                                  }}
                                />
                              </ListItem>
                            )}
                          </List>
                        );
                      })()}
                    </Box>

                    {/* Button */}
                    <Button
                      variant={(() => {
                        const isCurrentPlan = userPlanInfo?.currentPlan?._id === plan._id || 
                                            userPlanInfo?.currentPlan?.name?.toLowerCase() === plan.name?.toLowerCase();
                        if (isCurrentPlan) return 'contained';
                        return plan.highlighted ? 'contained' : 'outlined';
                      })()}
                      color={(() => {
                        const isCurrentPlan = userPlanInfo?.currentPlan?._id === plan._id || 
                                            userPlanInfo?.currentPlan?.name?.toLowerCase() === plan.name?.toLowerCase();
                        if (isCurrentPlan) return 'success';
                        return 'primary';
                      })()}
                      fullWidth
                      size="large"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={(() => {
                        const isCurrentPlan = userPlanInfo?.currentPlan?._id === plan._id || 
                                            userPlanInfo?.currentPlan?.name?.toLowerCase() === plan.name?.toLowerCase();
                        return isCurrentPlan;
                      })()}
                      sx={{
                        mt: 'auto',
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                        ...((plan.highlighted && !(userPlanInfo?.currentPlan?._id === plan._id || 
                          userPlanInfo?.currentPlan?.name?.toLowerCase() === plan.name?.toLowerCase())) && {
                          background: 'linear-gradient(135deg, #0077B5 0%, #00A3E0 100%)',
                          boxShadow: '0 4px 12px rgba(0, 119, 181, 0.3)',
                        }),
                      }}
                    >
                      {(() => {
                        const isCurrentPlan = userPlanInfo?.currentPlan?._id === plan._id || 
                                            userPlanInfo?.currentPlan?.name?.toLowerCase() === plan.name?.toLowerCase();
                        const planName = plan.name?.toLowerCase();
                        
                        if (isCurrentPlan) return 'Current Plan';
                        if (planName === 'enterprise') return 'Contact Us';
                        return 'Get Started';
                      })()}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
                ))}
              </Grid>

              {/* FAQ Section */}
          <Box sx={{ mt: 8, maxWidth: 900, mx: 'auto' }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}
            >
              Frequently Asked Questions
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2.5, borderLeft: 3, borderColor: 'primary.main', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    How does the pricing work?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pay once and get a specific number of AI-generated articles. No subscriptions or recurring charges.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2.5, borderLeft: 3, borderColor: 'primary.main', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    What happens when I run out of articles?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Simply purchase another plan to get more AI-generated articles. Your previous articles remain accessible.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2.5, borderLeft: 3, borderColor: 'primary.main', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Can I publish more than the AI limit?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yes! You can manually create and publish unlimited posts. The limit is only for AI-generated content.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2.5, borderLeft: 3, borderColor: 'primary.main', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    What's included in Enterprise?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enterprise plans are customized to your needs. Contact us to discuss unlimited articles, team features, and more.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          </>
          )}
        </Box>

        {/* PayPal Payment Dialog */}
        <Dialog 
          open={paymentDialogOpen} 
          onClose={handleClosePaymentDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Complete Payment
          </DialogTitle>
          <DialogContent>
            {selectedPlan && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedPlan.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedPlan.description}
                </Typography>
                <Box sx={{ my: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ${selectedPlan.price}
                  </Typography>
                  <Typography variant="body2">
                    {selectedPlan.aiArticleCredits} AI Article Credits
                  </Typography>
                </Box>
              </Box>
            )}

            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {paymentError}
              </Alert>
            )}

            {selectedPlan && (
              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={async () => {
                  try {
                    const response = await paymentAPI.createOrder(selectedPlan._id);
                    return response.data.data.orderId;
                  } catch (err) {
                    console.error('Create order error:', err);
                    setPaymentError(err.response?.data?.message || 'Failed to create order');
                    throw err;
                  }
                }}
                onApprove={async (data) => {
                  try {
                    await paymentAPI.captureOrder(data.orderID);
                    handlePaymentSuccess();
                  } catch (err) {
                    console.error('Capture order error:', err);
                    setPaymentError(err.response?.data?.message || 'Failed to complete payment');
                  }
                }}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  setPaymentError('Payment failed. Please try again.');
                }}
                onCancel={() => {
                  setPaymentError('Payment cancelled.');
                }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
    </PayPalScriptProvider>
  );
};

export default Subscriptions;

