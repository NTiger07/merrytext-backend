const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

/**
 * Validate the AI generation request
 * @param {Object} body - Request body
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateRequest(body) {
  const { templateType, prompt, friendInfo } = body;

  if (!templateType) {
    return { valid: false, error: "Template type is required" };
  }

  // Validate roast template requirements
  if (templateType === "AI ROAST GENERATOR") {
    if (!friendInfo?.name || !friendInfo?.traits) {
      return {
        valid: false,
        error: "Friend's name and traits are required for roast generation",
      };
    }

    if (friendInfo.name.length > 50) {
      return {
        valid: false,
        error: "Friend's name is too long (max 50 characters)",
      };
    }

    if (friendInfo.traits.length > 200) {
      return {
        valid: false,
        error: "Traits description is too long (max 200 characters)",
      };
    }

    if (friendInfo.funnyMemory && friendInfo.funnyMemory.length > 300) {
      return {
        valid: false,
        error: "Funny memory is too long (max 300 characters)",
      };
    }

    if (friendInfo.relationship && friendInfo.relationship.length > 100) {
      return {
        valid: false,
        error: "Relationship description is too long (max 100 characters)",
      };
    }
  } else {
    // Validate prompt for other templates
    if (!prompt || prompt.trim().length === 0) {
      return {
        valid: false,
        error: "Prompt is required for message generation",
      };
    }

    if (prompt.length > 500) {
      return { valid: false, error: "Prompt is too long (max 500 characters)" };
    }
  }

  return { valid: true };
}

/**
 * Build roast generation prompt
 * @param {Object} friendInfo - Friend information
 * @returns {string} - Formatted prompt for Gemini
 */
function buildRoastPrompt(friendInfo) {
  const { name, traits, funnyMemory, relationship } = friendInfo;

  let prompt = `You are a witty comedian creating a friendly, humorous roast for a friend. 
Generate a playful roast message (150-300 words) based on the following information:

Friend's name: ${name}
Personality traits: ${traits}`;

  if (funnyMemory) {
    prompt += `\nFunny memory: ${funnyMemory}`;
  }

  if (relationship) {
    prompt += `\nRelationship: ${relationship}`;
  }

  prompt += `

Rules:
- Keep it light-hearted and funny, never mean-spirited or hurtful
- Use clever wordplay and observational humor
- Include 2-3 specific jokes about their traits
- Make it feel personal and from a friend
- End with a friendly note
- Use casual, conversational language
- Don't include greetings like "Dear" or signatures
- Focus on being funny but not offensive

Generate the roast now:`;

  return prompt;
}

/**
 * Get template context description
 * @param {string} templateType - Template type
 * @returns {string} - Context description
 */
function getTemplateContext(templateType) {
  const contexts = {
    "FIREPLACE CHAT": "cozy, warm holiday",
    "CONFETTI CANNON COUNTDOWN": "exciting, celebratory",
    "GRATITUDE JAR": "grateful, appreciative",
    "PERSONALIZED CAROL": "festive, musical holiday",
    "MEMORY LANE SLIDESHOW": "nostalgic, memory-focused",
  };

  return contexts[templateType] || "festive";
}

/**
 * Build message generation prompt
 * @param {string} templateType - Template type
 * @param {string} userPrompt - User's prompt
 * @returns {string} - Formatted prompt for Gemini
 */
function buildMessagePrompt(templateType, userPrompt) {
  const templateContext = getTemplateContext(templateType);

  return `You are a creative writer helping users compose ${templateContext} messages.

User's request: ${userPrompt}

Generate a heartfelt, appropriate message (100-250 words) that:
- Matches the tone and style of a ${templateContext}
- Fulfills the user's request
- Is warm, genuine, and personal
- Uses appropriate seasonal/holiday language if relevant
- Doesn't include greetings or signatures (just the message body)
- Is suitable for sharing with friends and family

Generate the message now:`;
}

/**
 * Generate AI message controller
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
const generateAIMessage = async (req, res) => {
  try {
    const { templateType, prompt, friendInfo } = req.body;

    // Validate request
    const validation = validateRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY is not configured");
      return res.status(500).json({
        success: false,
        error: "AI service configuration error. Please try again later.",
      });
    }

    // Build appropriate prompt
    let finalPrompt;

    if (templateType === "AI ROAST GENERATOR" && friendInfo) {
      finalPrompt = buildRoastPrompt(friendInfo);
    } else if (prompt) {
      finalPrompt = buildMessagePrompt(templateType, prompt);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid request parameters",
      });
    }

    // Log generation request (for monitoring)
    console.log("AI generation request:", {
      userId: req.user?.id,
      templateType,
      hasPrompt: !!prompt,
      hasFriendInfo: !!friendInfo,
      timestamp: new Date().toISOString(),
    });

    // Get the model
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // Generate content with Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: {
        temperature: templateType === "AI ROAST GENERATOR" ? 0.9 : 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      },
    });

    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error("Generated text is empty");
    }

    // Log successful generation
    console.log("AI generation success:", {
      userId: req.user?.id,
      templateType,
      generatedLength: generatedText.length,
      timestamp: new Date().toISOString(),
    });

    // Return successful response
    return res.status(200).json({
      success: true,
      generatedText: generatedText.trim(),
    });
  } catch (error) {
    console.error("AI generation error:", {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // Handle specific errors
    if (
      error.message?.includes("API key") ||
      error.message?.includes("API_KEY")
    ) {
      return res.status(500).json({
        success: false,
        error: "AI service configuration error. Please try again later.",
      });
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return res.status(429).json({
        success: false,
        error:
          "AI service temporarily unavailable. Please try again in a few moments.",
      });
    }

    // Content safety filter triggered
    if (
      error.message?.includes("safety") ||
      error.message?.includes("blocked")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Your input contains inappropriate content. Please try again with different information.",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "Failed to generate message. Please try again.",
    });
  }
};

module.exports = {
  generateAIMessage,
  validateRequest,
  buildRoastPrompt,
  buildMessagePrompt,
  getTemplateContext,
};
