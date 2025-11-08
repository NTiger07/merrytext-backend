const {
  xpToNextLevel,
  calculateLevel,
  progressToNextLevel,
} = require("../src/utils/levelCalculation");

describe("Level Calculation Utils", () => {
  describe("calculateLevel", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("should return level 2 for 100 XP", () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it("should return level 3 for 250 XP", () => {
      expect(calculateLevel(250)).toBe(3);
    });
  });

  describe("xpToNextLevel", () => {
    it("should return 150 XP needed for level 1", () => {
      expect(xpToNextLevel(0)).toBe(150);
    });

    it("should return 225 XP needed for level 2", () => {
      expect(xpToNextLevel(100)).toBe(225);
    });
  });

  describe("progressToNextLevel", () => {
    it("should return 0% progress at start of level", () => {
      expect(progressToNextLevel(0)).toBe(0);
    });

    it("should return 33% progress at 50 XP", () => {
      const progress = progressToNextLevel(50);
      expect(progress).toBeCloseTo(33.33, 1);
    });

    it("should not exceed 100%", () => {
      const progress = progressToNextLevel(10000);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });
});
