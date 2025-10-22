import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AutoAwesome,
  Schedule,
  Analytics,
  LinkedIn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#F9A826' }} />,
      title: 'AI-Powered Content',
      description: 'Generate engaging LinkedIn posts with advanced AI that understands your industry and tone.',
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Smart Scheduling',
      description: 'Schedule your posts for optimal engagement times with our intelligent scheduling system.',
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Performance Analytics',
      description: 'Track your content performance with detailed analytics and engagement metrics.',
    },
    {
      icon: <LinkedIn sx={{ fontSize: 40, color: '#0077B5' }} />,
      title: 'Direct Publishing',
      description: 'Publish directly to LinkedIn with seamless integration and real-time posting.',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '50K+', label: 'Posts Generated' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '24/7', label: 'Support Available' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'LinkedInAI has transformed our content strategy. We\'ve seen a 300% increase in engagement since using it.',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'The AI-generated content is incredibly professional and saves us hours every week.',
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Content Manager',
      company: 'GrowthCo',
      content: 'The scheduling feature is a game-changer. Our posts now get 5x more engagement.',
      avatar: 'ER',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 500px', minWidth: 300 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  Transform Your LinkedIn Content with AI
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 400,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                  }}
                >
                  Create, schedule, and optimize professional LinkedIn posts with the power of artificial intelligence. 
                  Boost your engagement and grow your network effortlessly.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'white',
                      color: 'primary.main',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
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
                      px: 4,
                      py: 1.5,
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
              </motion.div>
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    p: 4,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🚀 Try LinkedInAI Today
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    Join thousands of professionals who are already using AI to create better LinkedIn content.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label="Free 14-day trial" color="success" size="small" />
                    <Chip label="No credit card required" color="info" size="small" />
                    <Chip label="Cancel anytime" color="default" size="small" />
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {stats.map((stat, index) => (
              <Box key={index} sx={{ textAlign: 'center', minWidth: 200 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Typography variant="h3" fontWeight={700} color="primary">
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Powerful Features for Modern Professionals
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to create, schedule, and optimize your LinkedIn content strategy.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: 300 }}>
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
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Loved by Professionals Worldwide
            </Typography>
            <Typography variant="h6" color="text.secondary">
              See what our users are saying about LinkedInAI
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {testimonials.map((testimonial, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', p: 3 }}>
                    <CardContent>
                      <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                        "{testimonial.content}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role} at {testimonial.company}
                          </Typography>
                        </Box>
                      </Box>
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
              Ready to Transform Your LinkedIn Presence?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of professionals who are already using LinkedInAI to create better content.
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
              Get Started Free
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;