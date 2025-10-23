import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Share,
  ContentCopy,
  CheckCircle,
  People,
  CardGiftcard,
  EmojiEvents,
  PersonAdd,
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';
import { referralAPI } from '../services/referralService';

const Referrals = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      console.log('Fetching referral data...');
      const response = await referralAPI.getReferralStats();
      const data = response.data.data;
      
      console.log('Referral data received:', data);
      
      setReferralCode(data.referralCode);
      setReferralStats(data.referralStats || { totalReferred: 0, creditsEarnedFromReferrals: 0 });
      setReferrals(data.referrals || []);
      setActivePlan(data.activePlan || { creditsForReferrer: 10, creditsForReferee: 10 });
      
      if (!data.referralCode) {
        console.warn('No referral code returned from API');
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load referral data');
      // Set default plan on error
      setActivePlan({ creditsForReferrer: 10, creditsForReferee: 10 });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
  };

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
  };

  const handleShare = async () => {
    const credits = activePlan?.creditsForReferee || 10;
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    const shareText = `Join me on LinkedIn AI Content Creator and get ${credits} free AI credits! Use my referral code: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join LinkedIn AI Content Creator',
          text: shareText,
          url: referralLink
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Refer & Earn
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Invite your friends and both get {activePlan?.creditsForReferee || 10} free AI credits!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            bgcolor: 'primary.lighter',
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <People sx={{ fontSize: 32, color: 'primary.main' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {referralStats?.totalReferred || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Referrals
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            bgcolor: 'success.lighter',
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CardGiftcard sx={{ fontSize: 32, color: 'success.main' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700} color="success.main">
                            {referralStats?.creditsEarnedFromReferrals || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Credits Earned
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ bgcolor: 'warning.lighter' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            bgcolor: 'warning.main',
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <EmojiEvents sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700} color="warning.dark">
                            {activePlan?.creditsForReferrer || 10}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Your Credits/Referral
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Referral Code Section */}
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Your Referral Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Share this code with your friends. When they sign up, you get {activePlan?.creditsForReferrer || 10} credits and they get {activePlan?.creditsForReferee || 10} credits!
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'primary.main',
                      mb: 3,
                    }}
                  >
                    {referralCode ? (
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="primary.main"
                        sx={{ 
                          fontFamily: 'monospace',
                          letterSpacing: 2,
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        {referralCode}
                      </Typography>
                    ) : (
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <CircularProgress size={32} />
                      </Box>
                    )}
                    <Tooltip title={referralCode ? "Copy Code" : "Loading..."}>
                      <span>
                        <IconButton
                          onClick={handleCopyCode}
                          color="primary"
                          disabled={!referralCode}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                            '&.Mui-disabled': {
                              bgcolor: 'action.disabledBackground',
                            }
                          }}
                        >
                          {copied ? <CheckCircle /> : <ContentCopy />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Share Buttons */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ContentCopy />}
                        onClick={handleCopyLink}
                        size="large"
                        disabled={!referralCode}
                      >
                        Copy Referral Link
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Share />}
                        onClick={handleShare}
                        size="large"
                        disabled={!referralCode}
                      >
                        Share
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    How It Works
                  </Typography>
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'primary.lighter',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <Share sx={{ fontSize: 32, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          1. Share Your Code
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Send your unique referral code or link to friends
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'success.lighter',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <PersonAdd sx={{ fontSize: 32, color: 'success.main' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          2. Friend Signs Up
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          They register using your referral code
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            bgcolor: 'warning.lighter',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          <CardGiftcard sx={{ fontSize: 32, color: 'warning.main' }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          3. Both Get Credits
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You receive {activePlan?.creditsForReferrer || 10} credits and your friend receives {activePlan?.creditsForReferee || 10} AI credits
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Referral History */}
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Referral History
                  </Typography>
                  
                  {referrals.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <People sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No referrals yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start sharing your referral code to earn credits!
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {referrals.map((referral, index) => (
                        <React.Fragment key={referral._id}>
                          {index > 0 && <Divider />}
                          <ListItem
                            sx={{
                              py: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={referral.refereeId?.profilePicture}
                                alt={referral.refereeId?.name}
                                sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}
                              >
                                {referral.refereeId?.name?.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1" fontWeight={500}>
                                    {referral.refereeId?.name || 'Unknown User'}
                                  </Typography>
                                  <Chip
                                    label={`+${referral.creditsGrantedToReferrer} Credits`}
                                    size="small"
                                    color="success"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  Joined on {new Date(referral.refereeId?.createdAt).toLocaleDateString()}
                                </Typography>
                              }
                            />
                            <Chip
                              label={referral.status}
                              size="small"
                              color="success"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          message="Copied to clipboard!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </MainLayout>
  );
};

export default Referrals;

