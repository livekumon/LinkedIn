import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
} from '@mui/material';
import {
  LinkedIn,
  Twitter,
  GitHub,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former LinkedIn product manager with 10+ years in social media and AI.',
      avatar: 'SJ',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'AI researcher and former Google engineer specializing in natural language processing.',
      avatar: 'MC',
      social: {
        linkedin: '#',
        github: '#',
      },
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Product strategist with expertise in B2B SaaS and user experience design.',
      avatar: 'ER',
      social: {
        linkedin: '#',
        twitter: '#',
      },
    },
    {
      name: 'David Kim',
      role: 'Lead AI Engineer',
      bio: 'Machine learning expert focused on content generation and optimization algorithms.',
      avatar: 'DK',
      social: {
        linkedin: '#',
        github: '#',
      },
    },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly push the boundaries of AI technology to deliver cutting-edge solutions for content creation.',
      icon: '🚀',
    },
    {
      title: 'Quality',
      description: 'We maintain the highest standards in everything we do, from our AI models to our user experience.',
      icon: '⭐',
    },
    {
      title: 'Transparency',
      description: 'We believe in open communication and honest relationships with our users and team members.',
      icon: '🔍',
    },
    {
      title: 'Empowerment',
      description: 'We empower professionals to create better content and grow their professional networks.',
      icon: '💪',
    },
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'LinkedInAI was founded with a vision to revolutionize professional content creation.',
    },
    {
      year: '2024 Q1',
      title: 'Beta Launch',
      description: 'Launched our beta platform with 1,000 early adopters and 95% satisfaction rate.',
    },
    {
      year: '2024 Q2',
      title: 'AI Model Integration',
      description: 'Integrated advanced AI models for better content generation and optimization.',
    },
    {
      year: '2024 Q3',
      title: 'Team Expansion',
      description: 'Grew our team to 15+ experts in AI, product, and engineering.',
    },
    {
      year: '2024 Q4',
      title: 'Public Launch',
      description: 'Public launch with 10,000+ users and enterprise partnerships.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              About LinkedInAI
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
              We're on a mission to empower professionals worldwide with AI-powered content creation tools. 
              Our platform helps you create, schedule, and optimize LinkedIn content that drives real engagement and growth.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h3" gutterBottom>
                  Our Mission
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  To democratize professional content creation by making AI-powered tools accessible to everyone.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  We believe that every professional deserves access to high-quality content creation tools. 
                  Our platform removes the barriers between great ideas and engaging content, helping you 
                  build your professional brand and grow your network.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  href="http://localhost:3001"
                  target="_blank"
                >
                  Join Our Mission
                </Button>
              </motion.div>
            </Box>
            <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 4,
                    p: 4,
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    10,000+
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Active Users
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Professionals worldwide trust LinkedInAI for their content creation needs
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom>
              Our Values
            </Typography>
            <Typography variant="h6" color="text.secondary">
              The principles that guide everything we do
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {values.map((value, index) => (
              <Box key={index} sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h2" sx={{ mb: 2 }}>
                        {value.icon}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {value.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom>
              Meet Our Team
            </Typography>
            <Typography variant="h6" color="text.secondary">
              The passionate people behind LinkedInAI
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {team.map((member, index) => (
              <Box key={index} sx={{ flex: '1 1 250px', minWidth: 250 }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 600,
                        }}
                      >
                        {member.avatar}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {member.bio}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {member.social.linkedin && (
                          <Button
                            size="small"
                            startIcon={<LinkedIn />}
                            href={member.social.linkedin}
                            target="_blank"
                          >
                            LinkedIn
                          </Button>
                        )}
                        {member.social.twitter && (
                          <Button
                            size="small"
                            startIcon={<Twitter />}
                            href={member.social.twitter}
                            target="_blank"
                          >
                            Twitter
                          </Button>
                        )}
                        {member.social.github && (
                          <Button
                            size="small"
                            startIcon={<GitHub />}
                            href={member.social.github}
                            target="_blank"
                          >
                            GitHub
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Timeline Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom>
              Our Journey
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Key milestones in our company's growth
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        minWidth: 100,
                        textAlign: 'center',
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        color: 'white',
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {milestone.year}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {milestone.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
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
              Join Our Community
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Be part of the future of professional content creation
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
                href="/contact"
              >
                Contact Us
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;