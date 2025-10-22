import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  Twitter,
  GitHub,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 32, color: '#0077B5' }} />,
      title: 'Email',
      details: 'hello@linkedinai.com',
      description: 'Send us an email and we\'ll respond within 24 hours',
    },
    {
      icon: <Phone sx={{ fontSize: 32, color: '#4CAF50' }} />,
      title: 'Phone',
      details: '+1 (555) 123-4567',
      description: 'Call us during business hours (9 AM - 6 PM PST)',
    },
    {
      icon: <LocationOn sx={{ fontSize: 32, color: '#F9A826' }} />,
      title: 'Office',
      details: 'San Francisco, CA',
      description: 'Visit our headquarters in the heart of Silicon Valley',
    },
  ];

  const socialLinks = [
    {
      icon: <LinkedIn sx={{ fontSize: 24 }} />,
      name: 'LinkedIn',
      url: '#',
      color: '#0077B5',
    },
    {
      icon: <Twitter sx={{ fontSize: 24 }} />,
      name: 'Twitter',
      url: '#',
      color: '#1DA1F2',
    },
    {
      icon: <GitHub sx={{ fontSize: 24 }} />,
      name: 'GitHub',
      url: '#',
      color: '#333',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Get in Touch
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Have questions about LinkedInAI? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contact Form & Info */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {/* Contact Form */}
            <Box sx={{ flex: '1 1 500px', minWidth: 300 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card sx={{ p: 4 }}>
                  <CardContent>
                    <Typography variant="h4" fontWeight={600} gutterBottom>
                      Send us a Message
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Fill out the form below and we'll get back to you within 24 hours.
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <TextField
                          fullWidth
                          label="Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                      />

                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                      />

                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        sx={{ px: 6, py: 1.5 }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>

            {/* Contact Information */}
            <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {contactInfo.map((info, index) => (
                    <Card key={index} sx={{ p: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {info.icon}
                          <Typography variant="h6" fontWeight={600} sx={{ ml: 2 }}>
                            {info.title}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {info.details}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Social Links */}
                  <Card sx={{ p: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Follow Us
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Stay updated with our latest news and updates
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {socialLinks.map((social, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            startIcon={social.icon}
                            href={social.url}
                            target="_blank"
                            sx={{
                              borderColor: social.color,
                              color: social.color,
                              '&:hover': {
                                borderColor: social.color,
                                backgroundColor: `${social.color}10`,
                              },
                            }}
                          >
                            {social.name}
                          </Button>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            </Box>
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
              Quick answers to common questions
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[
              {
                question: 'How quickly can I get started?',
                answer: 'You can start using LinkedInAI immediately after signing up. Our onboarding process takes less than 5 minutes.',
              },
              {
                question: 'Do you offer customer support?',
                answer: 'Yes! We offer 24/7 email support for all users, and priority support for Professional and Enterprise plans.',
              },
              {
                question: 'Can I integrate with other tools?',
                answer: 'Yes, we offer integrations with popular tools like Zapier, Slack, and various CRM systems.',
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use enterprise-grade security measures and are SOC 2 compliant. Your data is encrypted and secure.',
              },
            ].map((faq, index) => (
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

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Message sent successfully! We'll get back to you within 24 hours.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;