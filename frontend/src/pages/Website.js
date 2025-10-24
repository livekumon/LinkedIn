import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  Zoom,
  Grow,
  Stack,
  Divider,
  Paper,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowForward,
  CheckCircle,
  Star,
  TrendingUp,
  People,
  AutoAwesome,
  Psychology,
  Speed,
  Security,
  Analytics,
  Support,
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  Twitter,
  Instagram,
  GitHub,
  PlayArrow,
  Download,
  Share,
  Favorite,
  Business,
  School,
  Work,
  Public,
  Lightbulb,
  Rocket,
  Target,
  Timeline,
  Group,
  Verified,
  EmojiEvents,
  Insights,
  Schedule,
  MonetizationOn,
  Dashboard,
  Article,
  PostAdd,
  TrendingFlat,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Website = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#0077B5' }} />,
      title: 'AI-Powered Content',
      description: 'Generate engaging LinkedIn posts using advanced AI technology that understands your voice and audience.',
      benefits: ['Smart content suggestions', 'Tone optimization', 'Engagement prediction']
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#00A3E0' }} />,
      title: 'Lightning Fast',
      description: 'Create professional content in seconds, not hours. Our AI works at the speed of thought.',
      benefits: ['Instant generation', 'Real-time editing', 'Quick iterations']
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#28A745' }} />,
      title: 'Performance Insights',
      description: 'Track your content performance with detailed analytics and optimization recommendations.',
      benefits: ['Engagement metrics', 'Performance tracking', 'Optimization tips']
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: '#6F42C1' }} />,
      title: 'Smart Scheduling',
      description: 'Schedule your posts at optimal times with timezone support and engagement predictions.',
      benefits: ['Optimal timing', 'Timezone support', 'Auto-scheduling']
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#E91E63' }} />,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption and compliance with industry standards.',
      benefits: ['Data encryption', 'GDPR compliant', 'Secure storage']
    },
    {
      icon: <Support sx={{ fontSize: 40, color: '#FF6B35' }} />,
      title: '24/7 Support',
      description: 'Get help when you need it with our dedicated support team and comprehensive resources.',
      benefits: ['Live chat support', 'Video tutorials', 'Community forum']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      company: 'TechCorp',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      content: 'Pammi transformed my LinkedIn presence. My engagement increased by 300% in just 2 months!',
      rating: 5,
      results: '+300% engagement'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CEO',
      company: 'StartupXYZ',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: 'The AI suggestions are incredibly accurate. It feels like having a personal content strategist.',
      rating: 5,
      results: '50+ leads generated'
    },
    {
      name: 'Emily Johnson',
      role: 'Sales Manager',
      company: 'GrowthCo',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      content: 'Finally, a tool that understands professional networking. My network has grown exponentially.',
      rating: 5,
      results: '2x network growth'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 0,
      period: 'month',
      description: 'Perfect for individuals getting started',
      features: [
        '5 AI-generated posts per month',
        'Basic analytics',
        'Standard templates',
        'Email support'
      ],
      popular: false,
      cta: 'Get Started Free'
    },
    {
      name: 'Professional',
      price: 29,
      period: 'month',
      description: 'For growing professionals and small teams',
      features: [
        'Unlimited AI-generated posts',
        'Advanced analytics',
        'Premium templates',
        'Smart scheduling',
        'Priority support',
        'Team collaboration'
      ],
      popular: true,
      cta: 'Start Free Trial',
      savings: 'Save 20% annually'
    },
    {
      name: 'Business',
      price: 79,
      period: 'month',
      description: 'For teams and growing businesses',
      features: [
        'Everything in Professional',
        'Custom branding',
        'Advanced integrations',
        'Dedicated account manager',
        'Custom analytics',
        'API access'
      ],
      popular: false,
      cta: 'Contact Sales'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact',
      description: 'For large organizations',
      features: [
        'Everything in Business',
        'Custom AI training',
        'White-label solution',
        'On-premise deployment',
        '24/7 phone support',
        'Custom integrations'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '1M+', label: 'Posts Generated' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '24/7', label: 'Support Available' }
  ];

  const MobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          width: 280,
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="img"
              src="/Logo.png"
              alt="Pammi Logo"
              sx={{ height: 32, width: 'auto', mr: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              Pammi
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          <ListItemButton onClick={() => handleScrollToSection('features')}>
            <ListItemText primary="Features" sx={{ color: 'white' }} />
          </ListItemButton>
          <ListItemButton onClick={() => handleScrollToSection('testimonials')}>
            <ListItemText primary="Testimonials" sx={{ color: 'white' }} />
          </ListItemButton>
          <ListItemButton onClick={() => handleScrollToSection('pricing')}>
            <ListItemText primary="Pricing" sx={{ color: 'white' }} />
          </ListItemButton>
          <ListItemButton onClick={() => { setMobileMenuOpen(false); navigate('/ai-generation'); }}>
            <ListItemText primary="AI Generator" sx={{ color: 'white' }} />
          </ListItemButton>
          <ListItemButton onClick={handleGetStarted}>
            <ListItemText primary="Get Started" sx={{ color: 'white' }} />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <Box sx={{ backgroundColor: '#000000', color: 'white', minHeight: '100vh' }}>
      {/* Navigation */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src="/Logo.png"
                alt="Pammi Logo"
                sx={{
                  height: 40,
                  width: 'auto',
                  mr: 2,
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                Pammi
              </Typography>
            </Box>
            
            {!isMobile ? (
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Button
                  onClick={() => handleScrollToSection('features')}
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 500 }}
                >
                  Features
                </Button>
                <Button
                  onClick={() => handleScrollToSection('testimonials')}
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 500 }}
                >
                  Testimonials
                </Button>
                <Button
                  onClick={() => handleScrollToSection('pricing')}
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 500 }}
                >
                  Pricing
                </Button>
                <Button
                  onClick={() => navigate('/ai-generation')}
                  sx={{ color: 'white', textTransform: 'none', fontWeight: 500 }}
                >
                  AI Generator
                </Button>
                <Button
                  variant="contained"
                  onClick={handleGetStarted}
                  sx={{
                    backgroundColor: '#0077B5',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#005885',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 119, 181, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started
                </Button>
              </Box>
            ) : (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        id="hero"
        data-animate
        sx={{
          pt: 12,
          pb: 8,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                      fontWeight: 900,
                      mb: 3,
                      background: 'linear-gradient(135deg, #ffffff 0%, #0077B5 50%, #00A3E0 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.1,
                    }}
                  >
                    Your Thoughts, Amplified
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      mb: 4,
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    Transform fleeting ideas into powerful LinkedIn content that builds your authority and drives meaningful connections.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGetStarted}
                      endIcon={<ArrowForward />}
                      sx={{
                        backgroundColor: '#0077B5',
                        color: 'white',
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#005885',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 30px rgba(0, 119, 181, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Start Creating Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#0077B5',
                          backgroundColor: 'rgba(0, 119, 181, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Watch Demo
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    {stats.map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0077B5', mb: 0.5 }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Fade in timeout={1500}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src="/Hero Image.png"
                    alt="Pammi Dashboard Preview"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: '0 20px 60px rgba(0, 119, 181, 0.3)',
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      backgroundColor: 'rgba(0, 119, 181, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      p: 2,
                      border: '1px solid rgba(0, 119, 181, 0.3)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      AI Generated Content
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Ready in seconds
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" data-animate sx={{ py: 12, backgroundColor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #0077B5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose Pammi?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Powerful features designed to amplify your professional voice and accelerate your career growth.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Grow in={visibleSections.has('features')} timeout={600 + index * 100}>
                  <Card
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      height: '100%',
                      p: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: '#0077B5',
                        boxShadow: '0 20px 40px rgba(0, 119, 181, 0.2)',
                        backgroundColor: 'rgba(0, 119, 181, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                    <Stack spacing={1}>
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <Box key={benefitIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: '#0077B5' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {benefit}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box id="testimonials" data-animate sx={{ py: 12, backgroundColor: '#000000' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #0077B5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Trusted by Professionals
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Join thousands of professionals who have transformed their LinkedIn presence with Pammi.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Slide direction="up" in={visibleSections.has('testimonials')} timeout={800 + index * 200}>
                  <Card
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      height: '100%',
                      p: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#0077B5',
                        boxShadow: '0 15px 35px rgba(0, 119, 181, 0.2)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={testimonial.avatar}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} sx={{ fontSize: 16, color: '#FFD700' }} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 3,
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                      }}
                    >
                      "{testimonial.content}"
                    </Typography>
                    <Chip
                      label={testimonial.results}
                      sx={{
                        backgroundColor: 'rgba(0, 119, 181, 0.2)',
                        color: '#0077B5',
                        fontWeight: 600,
                      }}
                    />
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" data-animate sx={{ py: 12, backgroundColor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #0077B5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in={visibleSections.has('pricing')} timeout={600 + index * 100}>
                  <Card
                    sx={{
                      backgroundColor: plan.popular ? 'rgba(0, 119, 181, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: plan.popular ? '2px solid #0077B5' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      height: '100%',
                      p: 4,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0, 119, 181, 0.2)',
                      },
                    }}
                  >
                    {plan.popular && (
                      <Chip
                        label="Most Popular"
                        sx={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#0077B5',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                    {plan.savings && (
                      <Chip
                        label={plan.savings}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          backgroundColor: 'rgba(40, 167, 69, 0.2)',
                          color: '#28A745',
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                        {plan.name}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: '#0077B5', mb: 1 }}>
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                        {plan.price !== 0 && plan.price !== 'Custom' && (
                          <Typography component="span" variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            /{plan.period}
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {plan.description}
                      </Typography>
                    </Box>
                    <Stack spacing={2} sx={{ mb: 4 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20, color: '#0077B5', flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      onClick={handleGetStarted}
                      sx={{
                        backgroundColor: plan.popular ? '#0077B5' : 'transparent',
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        py: 2,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: plan.popular ? '#005885' : 'rgba(0, 119, 181, 0.1)',
                          borderColor: '#0077B5',
                        },
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, backgroundColor: '#000000' }}>
        <Container maxWidth="lg">
          <Paper
            sx={{
              backgroundColor: 'rgba(0, 119, 181, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 119, 181, 0.3)',
              borderRadius: 6,
              p: 8,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #0077B5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ready to Transform Your LinkedIn?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Join thousands of professionals who are already building their authority and growing their network with Pammi.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: '#0077B5',
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#005885',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(0, 119, 181, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Support />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#0077B5',
                    backgroundColor: 'rgba(0, 119, 181, 0.1)',
                  },
                }}
              >
                Contact Sales
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#0a0a0a', py: 8, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  component="img"
                  src="/Logo.png"
                  alt="Pammi Logo"
                  sx={{
                    height: 48,
                    width: 'auto',
                    mr: 2,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                  Pammi
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3, lineHeight: 1.6 }}>
                Transform your fleeting thoughts into powerful LinkedIn content that builds authority and drives meaningful professional connections.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <LinkedIn />
                </IconButton>
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <GitHub />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Product
                  </Typography>
                  <Stack spacing={1}>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Features
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      AI Generator
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Analytics
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Scheduling
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Company
                  </Typography>
                  <Stack spacing={1}>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      About
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Careers
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Blog
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Press
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Support
                  </Typography>
                  <Stack spacing={1}>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Help Center
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Contact
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Status
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Community
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white', mb: 2 }}>
                    Legal
                  </Typography>
                  <Stack spacing={1}>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Privacy
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Terms
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Security
                    </Button>
                    <Button sx={{ color: 'rgba(255, 255, 255, 0.7)', justifyContent: 'flex-start', textTransform: 'none' }}>
                      Compliance
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              © 2024 Pammi. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Made with ❤️ for professionals
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <MobileMenu />
    </Box>
  );
};

export default Website;