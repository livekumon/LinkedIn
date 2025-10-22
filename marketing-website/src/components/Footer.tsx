import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  LinkedIn,
  Twitter,
  GitHub,
  Email,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1C1C1C',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              LinkedInAI
            </Typography>
            <Typography variant="body2" color="grey.300" sx={{ mb: 2 }}>
              Transform your LinkedIn content creation with AI-powered tools. 
              Generate, schedule, and optimize your professional posts effortlessly.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: 'grey.300' }}>
                <LinkedIn />
              </IconButton>
              <IconButton sx={{ color: 'grey.300' }}>
                <Twitter />
              </IconButton>
              <IconButton sx={{ color: 'grey.300' }}>
                <GitHub />
              </IconButton>
              <IconButton sx={{ color: 'grey.300' }}>
                <Email />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/features" color="grey.300" underline="none">
                Features
              </Link>
              <Link href="/pricing" color="grey.300" underline="none">
                Pricing
              </Link>
              <Link href="#" color="grey.300" underline="none">
                API
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Integrations
              </Link>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/about" color="grey.300" underline="none">
                About
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Blog
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Careers
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Press
              </Link>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.300" underline="none">
                Help Center
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Documentation
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Community
              </Link>
              <Link href="/contact" color="grey.300" underline="none">
                Contact
              </Link>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.300" underline="none">
                Privacy Policy
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Terms of Service
              </Link>
              <Link href="#" color="grey.300" underline="none">
                Cookie Policy
              </Link>
              <Link href="#" color="grey.300" underline="none">
                GDPR
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="grey.400">
            © 2024 LinkedInAI. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="grey.400" underline="none" variant="body2">
              Privacy
            </Link>
            <Link href="#" color="grey.400" underline="none" variant="body2">
              Terms
            </Link>
            <Link href="#" color="grey.400" underline="none" variant="body2">
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;