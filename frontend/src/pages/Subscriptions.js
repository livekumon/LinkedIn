import React, { useState } from 'react';
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
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';

const Subscriptions = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: 'Free',
      price: 0,
      priceLabel: '$0',
      aiDrafts: 'Up to 1',
      publishedArticles: 'Up to 1 unique article',
      tag: null,
      features: [
        '1 AI-generated draft per week',
        '1 published article per week',
        'Basic LinkedIn integration',
        'Standard templates',
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outlined',
    },
    {
      name: 'Micro',
      price: 5,
      priceLabel: '$5',
      aiDrafts: 'Up to 5',
      publishedArticles: 'Up to 3 unique articles',
      tag: null,
      features: [
        '5 AI-generated drafts per week',
        '3 published articles per week',
        'Priority LinkedIn integration',
        'Advanced templates',
        'Tone customization',
      ],
      buttonText: 'Upgrade',
      buttonVariant: 'outlined',
    },
    {
      name: 'Standard',
      price: 10,
      priceLabel: '$10',
      aiDrafts: 'Up to 15',
      publishedArticles: 'Up to 7 unique articles',
      tag: 'Most Popular',
      features: [
        '15 AI-generated drafts per week',
        '7 published articles per week',
        'Priority LinkedIn integration',
        'Premium templates',
        'Multiple tone options',
        'Source citation support',
        'Analytics dashboard',
      ],
      buttonText: 'Upgrade',
      buttonVariant: 'contained',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: 25,
      priceLabel: '$25',
      aiDrafts: 'Up to 40',
      publishedArticles: 'Up to 20 unique articles',
      tag: null,
      features: [
        '40 AI-generated drafts per week',
        '20 published articles per week',
        'Priority LinkedIn integration',
        'All premium templates',
        'Unlimited tone customization',
        'Source citation support',
        'Advanced analytics',
        'Content scheduling',
        'Priority support',
      ],
      buttonText: 'Upgrade',
      buttonVariant: 'contained',
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.name);
    // TODO: Implement subscription logic
    console.log('Selected plan:', plan.name);
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(135deg, #0077B5 0%, #00A3E0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Choose Your Plan
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Select the perfect plan to supercharge your LinkedIn content creation
            </Typography>
          </Box>

          {/* Pricing Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {plans.map((plan) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={plan.name}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.highlighted ? 2 : 1,
                    borderColor: plan.highlighted ? 'primary.main' : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Tag */}
                  {plan.tag && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <Chip
                        label={plan.tag}
                        color="warning"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                  )}

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                    }}
                  >
                    {/* Plan Name */}
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        textAlign: 'center',
                        color: 'text.primary',
                      }}
                    >
                      {plan.name}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          display: 'inline',
                        }}
                      >
                        {plan.priceLabel}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'inline', ml: 0.5 }}
                      >
                        /week
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Key Stats */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>AI Drafts:</strong> {plan.aiDrafts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Published:</strong> {plan.publishedArticles}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Features */}
                    <List dense sx={{ flexGrow: 1, mb: 2 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle
                              sx={{
                                fontSize: 18,
                                color: 'success.main',
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.secondary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {/* Button */}
                    <Button
                      variant={plan.buttonVariant}
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={plan.name === 'Free'}
                      sx={{
                        mt: 'auto',
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Additional Info */}
          <Box
            sx={{
              mt: 6,
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Can I change my plan anytime?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </Typography>
              </Grid>
              <Grid xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  What happens if I exceed my limits?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You'll be notified when approaching your limits. You can upgrade to continue creating content without interruption.
                </Typography>
              </Grid>
              <Grid xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Do you offer refunds?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We offer a 7-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
                </Typography>
              </Grid>
              <Grid xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Is my payment information secure?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Absolutely! We use industry-standard encryption and secure payment processing to protect your data.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default Subscriptions;

