const {
  generateMessageUrl,
  getFullViewUrl,
  generateShareableText,
} = require("../src/utils/linkGeneration");

describe("Link Generation Utils", () => {
  describe("generateMessageUrl", () => {
    it("should generate a 16-character hex string", () => {
      const url = generateMessageUrl();
      expect(url).toHaveLength(16);
      expect(url).toMatch(/^[a-f0-9]{16}$/);
    });

    it("should generate unique URLs", () => {
      const url1 = generateMessageUrl();
      const url2 = generateMessageUrl();
      expect(url1).not.toBe(url2);
    });
  });

  describe("getFullViewUrl", () => {
    it("should generate full URL with message code", () => {
      const messageUrl = "abc123";
      const fullUrl = getFullViewUrl(messageUrl);
      expect(fullUrl).toContain("/view/abc123");
    });
  });

  describe("generateShareableText", () => {
    it("should include user name and URL", () => {
      const user = { name: "John Doe" };
      const messageUrl = "abc123";
      const text = generateShareableText(user, messageUrl);

      expect(text).toContain("John Doe");
      expect(text).toContain("abc123");
    });
  });
});
