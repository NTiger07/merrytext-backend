/**
 * Calculate XP needed to reach the next level
 */
const xpToNextLevel = (currentTotalXp) => {
  const level = calculateLevel(currentTotalXp);
  const baseXp = 100;
  const levelMultiplier = 1.5;
  return Math.floor(baseXp * Math.pow(levelMultiplier, level));
};

/**
 * Calculate current level from total XP
 */
const calculateLevel = (totalXp) => {
  let level = 1;
  let xpNeeded = 100;
  let xpAccumulated = 0;

  while (xpAccumulated + xpNeeded <= totalXp) {
    xpAccumulated += xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
  }

  return level;
};

/**
 * Calculate progress percentage to next level
 */
const progressToNextLevel = (currentTotalXp) => {
  const level = calculateLevel(currentTotalXp);
  const currentLevelXp =
    level === 1 ? 0 : Math.floor(100 * Math.pow(1.5, level - 1));
  const nextLevelXp = xpToNextLevel(currentTotalXp);
  const xpInCurrentLevel = currentTotalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;

  return Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);
};

module.exports = {
  xpToNextLevel,
  calculateLevel,
  progressToNextLevel,
};
