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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 5, annual: 4 },
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 50 AI-generated posts per month',
        'Basic scheduling (7 days ahead)',
        'LinkedIn direct publishing',
        'Basic analytics dashboard',
        'Email support',
        'Mobile app access',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: { monthly: 10, annual: 8 },
      description: 'Ideal for content creators and marketers',
      features: [
        'Unlimited AI-generated posts',
        'Advanced scheduling (30 days ahead)',
        'Multiple LinkedIn accounts (up to 3)',
        'Advanced analytics & insights',
        'Custom AI prompts & templates',
        'Priority support',
        'Team collaboration (up to 5 members)',
        'Content calendar view',
        'Hashtag suggestions',
        'Post performance tracking',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 0, annual: 0 },
      description: 'For teams and organizations',
      isCustom: true,
      features: [
        'Everything in Professional',
        'Unlimited LinkedIn accounts',
        'Advanced AI models & customization',
        'White-label solution available',
        'API access & integrations',
        'Dedicated account manager',
        'Custom onboarding & training',
        'Advanced team management',
        'Bulk content generation',
        'Custom reporting & analytics',
        'SSO integration',
        '24/7 phone support',
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial for all plans. No credit card required to start.',
    },
    {
      question: 'What happens if I exceed my limits?',
      answer: 'We\'ll notify you when you\'re approaching your limits. You can upgrade your plan or purchase additional credits as needed.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time. Your account will remain active until the end of your billing period.',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Choose the plan that fits your needs. All plans include our core features.
            </Typography>
            
            {/* Billing Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Typography variant="body1" color={!isAnnual ? 'primary.main' : 'text.secondary'}>
                Monthly
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAnnual}
                    onChange={(e) => setIsAnnual(e.target.checked)}
                    color="primary"
                  />
                }
                label=""
              />
              <Typography variant="body1" color={isAnnual ? 'primary.main' : 'text.secondary'}>
                Annual
              </Typography>
              <Chip 
                label="Save 20%" 
                color="success" 
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>

          {/* Pricing Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {plans.map((plan, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      border: plan.popular ? '2px solid' : '1px solid',
                      borderColor: plan.popular ? 'primary.main' : 'divider',
                      transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: plan.popular ? 'scale(1.08)' : 'scale(1.03)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 1,
                        }}
                      />
                    )}
                    
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                          {plan.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {plan.description}
                        </Typography>
                        {plan.isCustom ? (
                        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                          <Typography variant="h2" fontWeight={700} color="primary">
                            Contact Us
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                            <Typography variant="h2" fontWeight={700} color="primary">
                              ${isAnnual ? plan.price.annual : plan.price.monthly}
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                              /month
                            </Typography>
                          </Box>
                          {isAnnual && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                              Billed annually (${plan.price.annual * 12}/year)
                            </Typography>
                          )}
                        </>
                      )}
                      </Box>

                      <Button
                        variant={plan.popular ? 'contained' : 'outlined'}
                        fullWidth
                        size="large"
                        sx={{ mb: 3, py: 1.5 }}
                        href={plan.isCustom ? '/contact' : 'http://localhost:3001'}
                        target={plan.isCustom ? undefined : '_blank'}
                      >
                        {plan.isCustom ? 'Contact Sales' : plan.popular ? 'Start Free Trial' : 'Get Started'}
                      </Button>

                      <List sx={{ py: 0 }}>
                        {plan.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to know about our pricing
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {faqs.map((faq, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', p: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {faq.question}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0077B5 0%, #00A3E0 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Start your free trial today. No credit card required.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'white',
                color: 'primary.main',
                fontWeight: 600,
                px: 6,
                py: 2,
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                },
              }}
              href="http://localhost:3001"
              target="_blank"
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;