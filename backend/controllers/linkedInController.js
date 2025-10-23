const axios = require('axios');
const LinkedInConnection = require('../models/LinkedInConnection');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Get LinkedIn OAuth URL
exports.getLinkedInAuthUrl = async (req, res) => {
  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/linkedin/callback';
    const state = Buffer.from(JSON.stringify({ userId: req.user._id.toString() })).toString('base64');
    const scope = 'openid profile email w_member_social';

    // Debug logging
    console.log('LinkedIn OAuth Configuration:', {
      clientId: clientId ? 'SET' : 'NOT SET',
      redirectUri,
      isProduction: process.env.NODE_ENV === 'production'
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    return successResponse(res, { authUrl }, 'LinkedIn auth URL generated');
  } catch (error) {
    console.error('Get LinkedIn auth URL error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get LinkedIn connection status
exports.getConnectionStatus = async (req, res) => {
  try {
    const connection = await LinkedInConnection.findOne({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false,
      isActive: true
    });

    if (connection) {
      return successResponse(res, {
        connected: true,
        connection: {
          firstName: connection.firstName,
          lastName: connection.lastName,
          email: connection.email,
          profilePicture: connection.profilePicture
        }
      }, 'Connection status retrieved');
    }

    return successResponse(res, { connected: false }, 'Not connected');
  } catch (error) {
    console.error('Get connection status error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// LinkedIn OAuth Callback
exports.linkedInCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/linkedin-connections?error=no_code`);
    }

    // Decode state to get userId
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = decodedState.userId;

    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/linkedin/callback',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Get user profile from LinkedIn
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileResponse.data;

    // Find user by userId
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/linkedin-connections?error=user_not_found`);
    }

    // Check if already connected
    let connection = await LinkedInConnection.findOne({
      userId: user._id,
      tenantId: user.tenantId,
      softDelete: false
    });

    const tokenExpiry = new Date(Date.now() + expires_in * 1000);

    if (connection) {
      // Update existing connection
      connection.linkedInId = profile.sub;
      connection.firstName = profile.given_name;
      connection.lastName = profile.family_name;
      connection.email = profile.email;
      connection.profilePicture = profile.picture;
      connection.accessToken = access_token;
      connection.tokenExpiry = tokenExpiry;
      connection.isActive = true;
      connection.updatedBy = user._id;
      await connection.save();
    } else {
      // Create new connection
      connection = await LinkedInConnection.create({
        userId: user._id,
        linkedInId: profile.sub,
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        profilePicture: profile.picture,
        accessToken: access_token,
        tokenExpiry,
        tenantId: user.tenantId,
        createdBy: user._id,
        updatedBy: user._id
      });
    }

    // Redirect back to frontend with success
    return res.redirect(`${process.env.FRONTEND_URL}/linkedin-connections?linkedin=connected`);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/linkedin-connections?error=callback_failed`);
  }
};

// Disconnect LinkedIn account
exports.disconnectLinkedIn = async (req, res) => {
  try {
    const connection = await LinkedInConnection.findOne({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!connection) {
      return notFoundResponse(res, 'No LinkedIn connection found');
    }

    connection.softDelete = true;
    connection.isActive = false;
    connection.updatedBy = req.user._id;
    await connection.save();

    return successResponse(res, null, 'LinkedIn disconnected successfully');
  } catch (error) {
    console.error('Disconnect LinkedIn error:', error);
    return errorResponse(res, error.message, 500);
  }
};

