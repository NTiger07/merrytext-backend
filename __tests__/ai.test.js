const {
  validateRequest,
  buildRoastPrompt,
  buildMessagePrompt,
  getTemplateContext,
} = require("../src/controllers/ai.controller");

describe("AI Controller - Validation", () => {
  describe("validateRequest", () => {
    it("should return error if templateType is missing", () => {
      const result = validateRequest({});
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Template type is required");
    });

    it("should return error if roast template is missing friend name", () => {
      const result = validateRequest({
        templateType: "AI ROAST GENERATOR",
        friendInfo: { traits: "funny" },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Friend's name and traits are required");
    });

    it("should return error if roast template is missing friend traits", () => {
      const result = validateRequest({
        templateType: "AI ROAST GENERATOR",
        friendInfo: { name: "Mike" },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Friend's name and traits are required");
    });

    it("should return error if friend name is too long", () => {
      const result = validateRequest({
        templateType: "AI ROAST GENERATOR",
        friendInfo: {
          name: "a".repeat(51),
          traits: "funny",
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too long");
    });

    it("should return error if traits are too long", () => {
      const result = validateRequest({
        templateType: "AI ROAST GENERATOR",
        friendInfo: {
          name: "Mike",
          traits: "a".repeat(201),
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too long");
    });

    it("should validate successfully for valid roast template", () => {
      const result = validateRequest({
        templateType: "AI ROAST GENERATOR",
        friendInfo: {
          name: "Mike",
          traits: "always late, terrible cook",
          funnyMemory: "fell asleep during movie night",
          relationship: "college roommate",
        },
      });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should return error if prompt is missing for non-roast template", () => {
      const result = validateRequest({
        templateType: "FIREPLACE CHAT",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Prompt is required for message generation");
    });

    it("should return error if prompt is empty", () => {
      const result = validateRequest({
        templateType: "FIREPLACE CHAT",
        prompt: "   ",
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Prompt is required for message generation");
    });

    it("should return error if prompt is too long", () => {
      const result = validateRequest({
        templateType: "FIREPLACE CHAT",
        prompt: "a".repeat(501),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too long");
    });

    it("should validate successfully for valid prompt-based template", () => {
      const result = validateRequest({
        templateType: "FIREPLACE CHAT",
        prompt: "Write a warm holiday message about family traditions",
      });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

describe("AI Controller - Prompt Building", () => {
  describe("buildRoastPrompt", () => {
    it("should build basic roast prompt with name and traits", () => {
      const prompt = buildRoastPrompt({
        name: "Mike",
        traits: "always late, terrible cook",
      });
      expect(prompt).toContain("Mike");
      expect(prompt).toContain("always late, terrible cook");
      expect(prompt).toContain("witty comedian");
      expect(prompt).toContain("roast message");
    });

    it("should include funny memory in prompt if provided", () => {
      const prompt = buildRoastPrompt({
        name: "Mike",
        traits: "always late",
        funnyMemory: "fell asleep during movie night",
      });
      expect(prompt).toContain("fell asleep during movie night");
      expect(prompt).toContain("Funny memory:");
    });

    it("should include relationship in prompt if provided", () => {
      const prompt = buildRoastPrompt({
        name: "Mike",
        traits: "always late",
        relationship: "college roommate",
      });
      expect(prompt).toContain("college roommate");
      expect(prompt).toContain("Relationship:");
    });

    it("should include all fields when provided", () => {
      const prompt = buildRoastPrompt({
        name: "Sarah",
        traits: "coffee addict, always on phone",
        funnyMemory: "walked into a glass door",
        relationship: "best friend since high school",
      });
      expect(prompt).toContain("Sarah");
      expect(prompt).toContain("coffee addict, always on phone");
      expect(prompt).toContain("walked into a glass door");
      expect(prompt).toContain("best friend since high school");
    });

    it("should include roast generation rules", () => {
      const prompt = buildRoastPrompt({
        name: "Mike",
        traits: "funny",
      });
      expect(prompt).toContain("light-hearted");
      expect(prompt).toContain("never mean-spirited");
      expect(prompt).toContain("wordplay");
      expect(prompt).toContain("Don't include greetings");
    });
  });

  describe("getTemplateContext", () => {
    it("should return correct context for known templates", () => {
      expect(getTemplateContext("FIREPLACE CHAT")).toBe("cozy, warm holiday");
      expect(getTemplateContext("CONFETTI CANNON COUNTDOWN")).toBe(
        "exciting, celebratory"
      );
      expect(getTemplateContext("GRATITUDE JAR")).toBe(
        "grateful, appreciative"
      );
      expect(getTemplateContext("PERSONALIZED CAROL")).toBe(
        "festive, musical holiday"
      );
      expect(getTemplateContext("MEMORY LANE SLIDESHOW")).toBe(
        "nostalgic, memory-focused"
      );
    });

    it("should return default context for unknown templates", () => {
      expect(getTemplateContext("UNKNOWN_TEMPLATE")).toBe("festive");
    });
  });

  describe("buildMessagePrompt", () => {
    it("should build message prompt with template context and user prompt", () => {
      const prompt = buildMessagePrompt(
        "FIREPLACE CHAT",
        "Write a warm holiday message about family traditions"
      );
      expect(prompt).toContain("cozy, warm holiday");
      expect(prompt).toContain(
        "Write a warm holiday message about family traditions"
      );
      expect(prompt).toContain("creative writer");
    });

    it("should include message generation rules", () => {
      const prompt = buildMessagePrompt(
        "GRATITUDE JAR",
        "Express thanks for teachers"
      );
      expect(prompt).toContain("heartfelt");
      expect(prompt).toContain("warm, genuine, and personal");
      expect(prompt).toContain("Doesn't include greetings or signatures");
      expect(prompt).toContain("100-250 words");
    });

    it("should work with different template types", () => {
      const prompt = buildMessagePrompt(
        "CONFETTI CANNON COUNTDOWN",
        "Celebrate New Year countdown"
      );
      expect(prompt).toContain("exciting, celebratory");
      expect(prompt).toContain("Celebrate New Year countdown");
    });
  });
});

describe("AI Controller - Integration Tests", () => {
  // Note: These are placeholder tests. Actual integration tests would require
  // mocking the Google Generative AI SDK or using test API keys.

  it("should have all required exports", () => {
    const controller = require("../src/controllers/ai.controller");
    expect(controller.generateAIMessage).toBeDefined();
    expect(controller.validateRequest).toBeDefined();
    expect(controller.buildRoastPrompt).toBeDefined();
    expect(controller.buildMessagePrompt).toBeDefined();
    expect(controller.getTemplateContext).toBeDefined();
  });
});
