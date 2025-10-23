const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Idea = require('../models/Idea');
const CreditTransaction = require('../models/CreditTransaction');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLinkedInArticle = async (ideaText, tone = 'default', regenerate = false, includeSources = false, userId = null, ideaId = null, tenantId = null) => {
  try {
    // Check credits if userId is provided
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.aiCreditsRemaining < 1) {
        throw new Error('Insufficient AI credits. Please purchase more credits to continue generating articles.');
      }

      // Deduct credit before generation
      const creditsBeforeTransaction = user.aiCreditsRemaining;
      user.aiCreditsRemaining -= 1;
      user.updatedBy = userId;
      await user.save();

      // Create credit transaction record
      const transaction = await CreditTransaction.create({
        userId: user._id,
        ideaId: ideaId,
        transactionType: 'deduct',
        creditsChanged: -1,
        creditsBeforeTransaction: creditsBeforeTransaction,
        creditsAfterTransaction: user.aiCreditsRemaining,
        reason: 'ai_generation',
        metadata: {
          tone: tone,
          includeSources: includeSources,
          regeneration: regenerate
        },
        tenantId: tenantId || user.tenantId,
        createdBy: userId,
        updatedBy: userId
      });

      console.log(`Credit deducted for user ${user.email}. Remaining: ${user.aiCreditsRemaining}. Transaction ID: ${transaction._id}`);

      // Update idea credits tracking
      if (ideaId) {
        const idea = await Idea.findById(ideaId);
        if (idea) {
          idea.creditsUsed = (idea.creditsUsed || 0) + 1;
          idea.aiGenerationCount = (idea.aiGenerationCount || 0) + 1;
          idea.updatedBy = userId;
          await idea.save();
        }
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

    let toneInstructions = '';
    if (regenerate && tone !== 'default') {
      const toneMap = {
        professional: 'Use a highly professional and formal tone. Be authoritative and data-driven.',
        casual: 'Use a casual, friendly, and conversational tone. Be relatable and approachable.',
        inspiring: 'Use an inspiring and motivational tone. Be uplifting and encouraging.',
        educational: 'Use an educational and informative tone. Be clear, structured, and teach valuable insights.',
        storytelling: 'Use a storytelling narrative tone. Share experiences, lessons, and personal anecdotes.'
      };
      toneInstructions = `\n\nIMPORTANT: The user didn't like the previous version. Generate a COMPLETELY DIFFERENT version with a ${tone} tone:\n${toneMap[tone] || 'Use a different approach and style.'}\n`;
    }

    let sourcesInstructions = '';
    if (includeSources) {
      sourcesInstructions = `
      
10. INCLUDE CREDIBLE SOURCES: Research and include 2-4 credible web sources that support the content.
   - Add relevant links from authoritative websites (research papers, reputable news sites, industry publications, official statistics).
   - Format links naturally within the text, e.g., "According to [Harvard Business Review](https://example.com), ..." or "Research from [MIT](https://example.com) shows..."
   - Ensure sources are real, credible, and relevant to the topic.
   - Place sources strategically throughout the article to back up key claims and statistics.
   - Use markdown format for links: [Link Text](URL)
`;
    } else {
      sourcesInstructions = `
      
10. This is a FREE-FORM article without external sources or links. Focus on personal insights, experiences, and original thoughts.
`;
    }

    const prompt = `
You are an expert LinkedIn content strategist and AI writer.

Given the following idea or rough text, your goal is to:
1. Expand it into a beautifully written, contextually accurate, and highly engaging LinkedIn article.
2. Preserve the original meaning and intent while improving grammar, structure, and readability.
3. Optimize tone and flow for professional audiences — conversational, inspiring, and authoritative.
4. **CRITICAL: Keep the output to a maximum of 1500 characters (approximately 250-300 words).** This is a hard limit — do not exceed it.
5. Ensure the post fits LinkedIn's "See More" cutoff strategy — make the first 2–3 lines a strong hook that compels the reader to click "See More".
6. Include short paragraphs, bullet points, and spacing for easy mobile readability.
7. Use nice icons and relevant emojis 🌟 thoughtfully — to highlight ideas, emphasize emotion, or improve visual flow, but never overdo them.
8. Avoid hashtags (they'll be added later programmatically).
9. Maintain a positive, authentic, and human tone that resonates with professionals and encourages interaction (likes, comments, shares).
${sourcesInstructions}
${toneInstructions}
💡 Extra Tip:
Remember this exact writing style — tone, structure, emoji usage, and engagement flow — for all future article generations in this project.
Ensure consistency in style, storytelling rhythm, and readability across every output for maximum LinkedIn engagement.

**LENGTH REMINDER: Keep the final output under 1500 characters total. Be concise and impactful.**

Idea:
${ideaText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text().trim();

    // Enforce 1500 character limit (safety check)
    if (generatedText.length > 1500) {
      console.log(`Generated text exceeded 1500 chars (${generatedText.length}). Truncating...`);
      // Truncate at the last complete sentence within 1500 chars
      const truncated = generatedText.substring(0, 1500);
      const lastPeriod = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
      );
      if (lastPeriod > 1200) { // Only truncate at sentence if we have enough content
        generatedText = truncated.substring(0, lastPeriod + 1);
      } else {
        generatedText = truncated + '...';
      }
    }

    // Update transaction with generated content length
    if (userId && ideaId) {
      await CreditTransaction.findOneAndUpdate(
        { userId, ideaId, transactionType: 'deduct' },
        { 
          'metadata.articleLength': generatedText.length 
        },
        { sort: { createdAt: -1 } }
      );
    }

    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Refund credit if generation failed and credit was deducted
    if (userId && error.message !== 'Insufficient AI credits. Please purchase more credits to continue generating articles.') {
      try {
        const user = await User.findById(userId);
        if (user) {
          const creditsBeforeRefund = user.aiCreditsRemaining;
          user.aiCreditsRemaining += 1;
          await user.save();

          await CreditTransaction.create({
            userId: user._id,
            ideaId: ideaId,
            transactionType: 'refund',
            creditsChanged: 1,
            creditsBeforeTransaction: creditsBeforeRefund,
            creditsAfterTransaction: user.aiCreditsRemaining,
            reason: 'refund',
            notes: `Refund due to generation error: ${error.message}`,
            tenantId: tenantId || user.tenantId,
            createdBy: userId,
            updatedBy: userId
          });

          console.log(`Credit refunded for user due to error. New balance: ${user.aiCreditsRemaining}`);
        }
      } catch (refundError) {
        console.error('Failed to refund credit:', refundError);
      }
    }
    
    throw new Error('Failed to generate article with Gemini AI: ' + error.message);
  }
};

module.exports = {
  generateLinkedInArticle,
};

