const cron = require('node-cron');
const LinkedInPost = require('../models/LinkedInPost');
const ArticleVersion = require('../models/ArticleVersion');
const Idea = require('../models/Idea');
const { postToLinkedIn } = require('./linkedInPostService');

// Check for scheduled posts every 5 minutes
const startScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Checking for scheduled posts...');
    
    try {
      const now = new Date();
      
      // Find all posts scheduled to be published
      const scheduledPosts = await LinkedInPost.find({
        status: 'scheduled',
        scheduledAt: { $lte: now },
        softDelete: false
      }).populate('userId');

      console.log(`Found ${scheduledPosts.length} posts ready to publish`);

      for (const post of scheduledPosts) {
        try {
          // Post to LinkedIn
          const result = await postToLinkedIn(post.userId._id, post.userId.tenantId, post.content);

          // Update post status
          post.status = 'published';
          post.publishedAt = new Date();
          post.linkedInPostId = result.postId;
          post.updatedBy = post.userId._id;
          await post.save();

          // Update article version
          await ArticleVersion.findByIdAndUpdate(post.articleVersionId, {
            status: 'published',
            updatedBy: post.userId._id
          });

          // Update idea with posted status and date
          await Idea.findByIdAndUpdate(post.ideaId, {
            status: 'posted',
            postedAt: new Date(),
            updatedBy: post.userId._id
          });

          console.log(`Successfully published scheduled post: ${post._id}`);
        } catch (error) {
          console.error(`Failed to publish post ${post._id}:`, error.message);
          
          // Update post with error
          post.status = 'failed';
          post.errorMessage = error.message;
          post.updatedBy = post.userId._id;
          await post.save();
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });

  console.log('LinkedIn post scheduler started - checking every 5 minutes');
};

module.exports = {
  startScheduler,
};

