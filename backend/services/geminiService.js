const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLinkedInArticle = async (ideaText, tone = 'default', regenerate = false, includeSources = false) => {
  try {
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
4. Automatically choose the ideal post length (short or long) depending on the idea's depth, ensuring maximum reach and engagement.
   - If the idea is quick or thought-provoking → keep it short (under 1,000 characters).
   - If the idea is insightful, story-based, or educational → expand it into ~1,500–2,000 characters.
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

Idea:
${ideaText}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    return generatedText.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate article with Gemini AI');
  }
};

module.exports = {
  generateLinkedInArticle,
};

