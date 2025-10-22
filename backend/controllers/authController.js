const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseHelper');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register with Email
exports.register = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // Validation
    if (!name || !email || !password || !tenantId) {
      return validationErrorResponse(res, { message: 'Name, email, password, and tenantId are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email, tenantId, softDelete: false });
    if (existingUser) {
      return errorResponse(res, 'User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      tenantId,
      createdBy: null, // Will be set after first user is created
      updatedBy: null
    });

    // Update createdBy and updatedBy with the user's own ID
    user.createdBy = user._id;
    user.updatedBy = user._id;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(res, { user: userResponse, token }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate key error (user already exists)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return errorResponse(res, 'An account with this email already exists. Please sign in instead.', 400);
    }
    
    return errorResponse(res, error.message, 500);
  }
};

// Login with Email
exports.login = async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    // Validation
    if (!email || !password || !tenantId) {
      return validationErrorResponse(res, { message: 'Email, password, and tenantId are required' });
    }

    // Find user
    const user = await User.findOne({ email, tenantId, softDelete: false }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user registered with Google
    if (user.authProvider === 'google') {
      return errorResponse(res, 'Please login with Google', 400);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    user.updatedBy = user._id;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(res, { user: userResponse, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Google SSO Login
exports.googleLogin = async (req, res) => {
  try {
    const { idToken, tenantId } = req.body;

    if (!idToken || !tenantId) {
      return validationErrorResponse(res, { message: 'Google ID token and tenantId are required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ 
      $or: [{ googleId }, { email, tenantId }],
      softDelete: false 
    });

    if (user) {
      // Update existing user
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.lastLogin = new Date();
      user.profilePicture = picture;
      user.isEmailVerified = true;
      user.updatedBy = user._id;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        authProvider: 'google',
        isEmailVerified: true,
        tenantId,
        createdBy: null,
        updatedBy: null
      });

      // Update createdBy and updatedBy with the user's own ID
      user.createdBy = user._id;
      user.updatedBy = user._id;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    return successResponse(res, { user, token }, 'Google login successful');
  } catch (error) {
    console.error('Google login error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).where({ softDelete: false });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, { user }, 'User retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled on the client side
    // You can implement token blacklisting here if needed
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, error.message, 500);
  }
};


