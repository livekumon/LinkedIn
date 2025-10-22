import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AutoAwesome,
  Schedule,
  Analytics,
  LinkedIn,
  SmartToy,
  Insights,
  Assessment,
  Speed,
  Group,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#F9A826' }} />,
      title: 'AI-Powered Content Generation',
      description: 'Create engaging LinkedIn posts with advanced AI that understands your industry, tone, and audience.',
      details: [
        'Multiple AI models for different content types',
        'Industry-specific content optimization',
        'Tone and style customization',
        'Content length optimization for LinkedIn',
        'Hashtag suggestions and optimization',
        'Emoji and formatting recommendations',
      ],
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Smart Scheduling',
      description: 'Schedule your posts for optimal engagement times with our intelligent scheduling system.',
      details: [
        'Optimal posting time recommendations',
        'Timezone-aware scheduling',
        'Bulk scheduling capabilities',
        'Recurring post scheduling',
        'Content calendar view',
        'Schedule conflict detection',
      ],
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Advanced Analytics',
      description: 'Track your content performance with detailed analytics and engagement metrics.',
      details: [
        'Real-time engagement tracking',
        'Performance comparison across posts',
        'Audience growth analytics',
        'Content performance insights',
        'Exportable reports',
        'ROI tracking for content strategy',
      ],
    },
    {
      icon: <LinkedIn sx={{ fontSize: 40, color: '#0077B5' }} />,
      title: 'Direct LinkedIn Publishing',
      description: 'Publish directly to LinkedIn with seamless integration and real-time posting.',
      details: [
        'One-click publishing to LinkedIn',
        'Multiple LinkedIn account support',
        'Real-time posting status',
        'LinkedIn API integration',
        'Post preview before publishing',
        'Error handling and retry logic',
      ],
    },
    {
      icon: <SmartToy sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: 'Custom AI Prompts',
      description: 'Create and save custom AI prompts for consistent brand voice and content style.',
      details: [
        'Custom prompt templates',
        'Brand voice training',
        'Industry-specific prompts',
        'Prompt sharing across team',
        'A/B testing for prompts',
        'Prompt performance analytics',
      ],
    },
    {
      icon: <Group sx={{ fontSize: 40, color: '#FF5722' }} />,
      title: 'Team Collaboration',
      description: 'Work together with your team on content creation and approval workflows.',
      details: [
        'Multi-user workspace',
        'Content approval workflows',
        'Role-based permissions',
        'Team content calendar',
        'Collaborative editing',
        'Comment and feedback system',
      ],
    },
  ];

  const benefits = [
    {
      title: 'Save Time',
      description: 'Reduce content creation time by up to 80% with AI-powered generation and scheduling.',
      icon: <Speed sx={{ fontSize: 32, color: '#4CAF50' }} />,
    },
    {
      title: 'Increase Engagement',
      description: 'Boost your LinkedIn engagement by up to 300% with optimized content and timing.',
      icon: <TrendingUp sx={{ fontSize: 32, color: '#2196F3' }} />,
    },
    {
      title: 'Professional Quality',
      description: 'Generate high-quality, professional content that matches your brand voice and style.',
      icon: <Assessment sx={{ fontSize: 32, color: '#F9A826' }} />,
    },
    {
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with detailed analytics and performance tracking.',
      icon: <Insights sx={{ fontSize: 32, color: '#9C27B0' }} />,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Powerful Features for Modern Professionals
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to create, schedule, and optimize your LinkedIn content strategy.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Features */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ flex: '1 1 400px', minWidth: 300 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', p: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {feature.icon}
                        <Typography variant="h5" fontWeight={600} sx={{ ml: 2 }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {feature.description}
                      </Typography>
                      <List sx={{ py: 0 }}>
                        {feature.details.map((detail, detailIndex) => (
                          <ListItem key={detailIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: 'primary.main',
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={detail}
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

      {/* Benefits Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom>
              Why Choose LinkedInAI?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Transform your LinkedIn presence with our comprehensive suite of tools
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {benefits.map((benefit, index) => (
              <Box key={index} sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {benefit.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {benefit.description}
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
              Ready to Experience These Features?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Start your free trial today and see the difference AI can make.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  px: 6,
                  py: 2,
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
                href="/pricing"
              >
                View Pricing
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default FeaturesPage;