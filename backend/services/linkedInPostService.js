const axios = require('axios');
const LinkedInConnection = require('../models/LinkedInConnection');

const postToLinkedIn = async (userId, tenantId, content) => {
  try {
    // Get user's LinkedIn connection
    const connection = await LinkedInConnection.findOne({
      userId,
      tenantId,
      softDelete: false,
      isActive: true
    }).select('+accessToken');

    if (!connection) {
      throw new Error('LinkedIn account not connected');
    }

    // Get LinkedIn user ID (sub)
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
    });

    const linkedInUserId = profileResponse.data.sub;

    // Post to LinkedIn using UGC API
    const postData = {
      author: `urn:li:person:${linkedInUserId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    return {
      success: true,
      postId: response.data.id,
      message: 'Posted to LinkedIn successfully'
    };
  } catch (error) {
    console.error('LinkedIn post error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to post to LinkedIn');
  }
};

module.exports = {
  postToLinkedIn,
};


