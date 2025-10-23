import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { PersonAddOutlined, CardGiftcard } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { referralAPI } from '../services/referralService';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralInfo, setReferralInfo] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    // Fetch active referral plan
    fetchActivePlan();
    
    // Check if referral code is in URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode.toUpperCase() }));
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  const fetchActivePlan = async () => {
    try {
      const response = await referralAPI.getActiveReferralPlan();
      const plan = response.data.data.plan;
      setActivePlan(plan);
    } catch (err) {
      console.error('Failed to fetch active plan:', err);
      // Use default values if API fails
      setActivePlan({
        creditsForReferrer: 10,
        creditsForReferee: 10
      });
    }
  };

  const validateReferralCode = async (code) => {
    if (!code || code.trim().length === 0) {
      setReferralInfo(null);
      return;
    }

    try {
      setValidatingReferral(true);
      const response = await referralAPI.validateReferralCode(code);
      setReferralInfo({
        valid: true,
        referrerName: response.data.data.referrerName,
        creditsForReferee: response.data.data.creditsForReferee,
        creditsForReferrer: response.data.data.creditsForReferrer
      });
    } catch (err) {
      setReferralInfo({
        valid: false,
        error: 'Invalid referral code'
      });
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate referral code when it changes
    if (name === 'referralCode') {
      const upperCode = value.toUpperCase();
      setFormData(prev => ({ ...prev, referralCode: upperCode }));
      if (upperCode.length >= 6) {
        validateReferralCode(upperCode);
      } else {
        setReferralInfo(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.referralCode || null);
      navigate('/ideas');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      
      // If user already exists, redirect to login after 3 seconds
      if (errorMessage.includes('already exists') || errorMessage.includes('sign in')) {
        setTimeout(() => {
          navigate('/login', { state: { email: formData.email } });
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential, formData.referralCode || null);
      navigate('/ideas');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed');
  };

  return (
    <Box className="page-background">
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 },
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <PersonAddOutlined sx={{ fontSize: { xs: 40, sm: 48, md: 56 }, color: 'primary.main', mb: 2 }} />
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold" 
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              Create Account
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Join us and get started
            </Typography>
          </Box>

          {referralInfo?.valid && (
            <Alert 
              severity="success"
              icon={<CardGiftcard />}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                bgcolor: 'success.lighter',
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Referral Code Applied! 🎉
              </Typography>
              <Typography variant="body2">
                You'll receive {referralInfo?.creditsForReferee || 10} bonus AI credits when you complete registration!
              </Typography>
            </Alert>
          )}

          {error && (
            <Alert 
              severity={error.includes('already exists') || error.includes('sign in') ? 'warning' : 'error'}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
              }}
            >
              {error}
              {(error.includes('already exists') || error.includes('sign in')) && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Redirecting to sign in page...{' '}
                  <Link 
                    to="/login" 
                    state={{ email: formData.email }}
                    style={{ 
                      color: '#0077B5', 
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    Click here if not redirected
                  </Link>
                </Typography>
              )}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              helperText="Minimum 6 characters"
            />

            <TextField
              fullWidth
              label="Referral Code (Optional)"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              placeholder="Enter referral code"
              helperText={
                validatingReferral ? 'Validating...' :
                referralInfo?.valid ? `Valid! Referred by ${referralInfo.referrerName}. You'll get ${referralInfo.creditsForReferee || 10} bonus credits!` :
                referralInfo?.error ? referralInfo.error :
                `Get ${activePlan?.creditsForReferee || 10} bonus credits by entering a friend's referral code`
              }
              InputProps={{
                startAdornment: <CardGiftcard sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: referralInfo?.valid && (
                  <Chip label="Valid" color="success" size="small" />
                )
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  color: referralInfo?.valid ? 'success.main' : referralInfo?.error ? 'error.main' : 'text.secondary'
                }
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 600, fontSize: '1rem' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
            />
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#0077B5', 
                textDecoration: 'none', 
                fontWeight: 600,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.color = '#00A3E0'}
              onMouseLeave={(e) => e.target.style.color = '#0077B5'}
            >
              Sign In
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
