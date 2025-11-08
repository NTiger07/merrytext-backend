# MerryText - Achievements, Stats & Leveling System

## 🎯 Overview

Complete gamification infrastructure with achievements, user statistics, XP, and leveling system.

## 📊 Database Schema

### New Tables Created:

1. **achievements** - Achievement definitions

   - id, name, description, icon, total, category, xp_reward, created_at

2. **user_achievements** - User's achievement progress

   - id, user_id, achievement_id, progress, unlocked, unlocked_at, created_at, updated_at

3. **user_stats** - User statistics tracking
   - id, user_id, total_messages_sent, total_messages_viewed, total_coins_earned, total_coins_spent
   - unique_recipients, messages_viewed_today, last_message_date, current_streak, longest_streak
   - created_at, updated_at

## 🏆 Achievements System

### Default Achievements:

1. **First Message** (Sparkles)

   - Description: Send your first festive message
   - Requirement: 1 message
   - XP Reward: 50
   - Category: messaging

2. **Social Butterfly** (Target)

   - Description: Send messages to 10 different people
   - Requirement: 10 unique recipients
   - XP Reward: 100
   - Category: social

3. **Coin Collector** (Trophy)

   - Description: Earn 100 coins
   - Requirement: 100 coins earned
   - XP Reward: 75
   - Category: coins

4. **Speed Sender** (Zap)

   - Description: Send 5 messages in one day
   - Requirement: 5 messages in one day
   - XP Reward: 60
   - Category: speed

5. **Master Messenger** (Award)
   - Description: Send 100 total messages
   - Requirement: 100 total messages
   - XP Reward: 200
   - Category: messaging

## 📈 XP & Leveling System

### Leveling Formula:

```
Level = floor(sqrt(XP / 100)) + 1
XP Required for Level = (Level - 1)^2 * 100
```

### XP Progression:

- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 4: 900 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP

### XP Rewards by Action:

- **MESSAGE_SENT**: 10 XP
- **MESSAGE_VIEWED**: 5 XP
- **ACHIEVEMENT_UNLOCKED**: 50 XP (base, plus achievement's xpReward)
- **DAILY_LOGIN**: 20 XP
- **PURCHASE_COINS**: 15 XP

### Level Up Rewards:

- **Coins**: 10 coins per level gained

## 📡 API Endpoints

### Stats & Achievements

#### Get User Stats

```http
GET /merrytext/api/v1/stats/user/{username}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "name": "John Doe",
    "merryCoins": 150,
    "totalXp": 2500,
    "level": 5,
    "xpToNextLevel": 100,
    "progressToNextLevel": 75.5,
    "totalMessagesSent": 45,
    "totalMessagesViewed": 120,
    "totalCoinsEarned": 200,
    "totalCoinsSpent": 50,
    "uniqueRecipients": 12,
    "currentStreak": 7,
    "longestStreak": 15
  }
}
```

#### Get User Achievements

```http
GET /merrytext/api/v1/stats/achievements/{username}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Message",
      "description": "Send your first festive message",
      "icon": "Sparkles",
      "unlocked": true,
      "progress": 1,
      "total": 1,
      "category": "messaging",
      "xpReward": 50
    },
    {
      "id": 2,
      "name": "Social Butterfly",
      "description": "Send messages to 10 different people",
      "icon": "Target",
      "unlocked": false,
      "progress": 5,
      "total": 10,
      "category": "social",
      "xpReward": 100
    }
  ]
}
```

#### Get Leaderboard

```http
GET /merrytext/api/v1/stats/leaderboard?sortBy=xp&limit=10
```

## 🔄 Automatic Tracking

### When a Message is Sent:

1. ✅ Increment `totalMessagesSent`
2. ✅ Add `coinsSpent` to `totalCoinsSpent`
3. ✅ Update streak (current & longest)
4. ✅ Award 10 XP
5. ✅ Check & update achievements
6. ✅ Update level if XP threshold reached

### When a Message is Viewed:

1. ✅ Increment `totalMessagesViewed`
2. ✅ Award 5 XP to message owner
3. ✅ Update achievements

### When Coins are Purchased:

1. ✅ Increment `totalCoinsEarned`
2. ✅ Award 15 XP
3. ✅ Check "Coin Collector" achievement

### On User Registration:

1. ✅ Initialize `UserStats` with all counters at 0
2. ✅ Create `UserAchievement` entries for all achievements
3. ✅ Set initial level to 1, XP to 0
4. ✅ Award 20 starter coins

## 🎮 Services Overview

### LevelService

- `calculateLevel(totalXp)` - Calculate level from XP
- `xpRequiredForLevel(level)` - XP needed for a level
- `xpToNextLevel(currentXp)` - XP to next level
- `progressToNextLevel(currentXp)` - Progress percentage
- `getXpForAction(action)` - XP reward for actions

### StatsService

- `initializeUserStats(userId)` - Create stats for new user
- `getUserStats(userId)` - Get user stats
- `incrementMessageSent(userId, coinsSpent)` - Track message
- `incrementMessageViewed(userId)` - Track view
- `incrementCoinsEarned(userId, amount)` - Track coins
- `updateUniqueRecipients(userId, count)` - Update recipients

### AchievementService

- `initializeUserAchievements(userId)` - Setup achievements
- `checkAndUpdateAchievements(userId)` - Check progress
- `awardXp(user, xpAmount)` - Award XP and update level
- `getUserAchievements(userId)` - Get all achievements

## 🔌 Integration Points

### MessageService

- Calls `statsService.incrementMessageSent()` on message creation
- Calls `achievementService.awardXp()` for MESSAGE_SENT
- Calls `achievementService.checkAndUpdateAchievements()`
- Awards XP to owner when message is viewed

### PaymentService

- Calls `statsService.incrementCoinsEarned()` on purchase
- Calls `achievementService.awardXp()` for PURCHASE_COINS
- Checks achievements after purchase

### AuthController

- Calls `statsService.initializeUserStats()` on registration
- Calls `achievementService.initializeUserAchievements()` on registration

## 📦 Models

### Achievement

- System-wide achievement definitions
- Stored in database, initialized on startup

### UserAchievement

- User-specific achievement progress
- Links user to achievement with progress tracking

### UserStats

- Comprehensive user statistics
- Tracks all user activity and progress

## 🚀 Usage Examples

### Frontend Integration Example:

```typescript
// Fetch user stats
const stats = await fetch("/merrytext/api/v1/stats/user/johndoe");

// Fetch achievements
const achievements = await fetch(
  "/merrytext/api/v1/stats/achievements/johndoe"
);

// Display level progress
const progressBar = (stats.progressToNextLevel / 100) * width;

// Show unlocked achievements
const unlockedAchievements = achievements.filter((a) => a.unlocked);
```

## 🎨 Frontend Display Format

Matches your provided format:

```javascript
const achievements = [
  {
    id: 1,
    name: "First Message",
    description: "Send your first festive message",
    icon: "Sparkles", // Can map to React icons
    unlocked: true,
    progress: 1,
    total: 1,
  },
  // ... more achievements
];
```

## ⚡ Performance Notes

- Achievement checking is batched and runs after actions
- Stats updates use @Transactional for consistency
- Achievements are cached in memory after first load
- Leaderboard can be optimized with database indexes

## 🔐 Security

- All stat endpoints require authentication (username in path)
- Stats are user-specific and cannot be modified via API
- Achievement unlocking is automatic and server-controlled
- XP and level calculations are server-side only

## 📝 Future Enhancements

- [ ] Daily challenges for bonus XP
- [ ] Seasonal achievements
- [ ] Achievement badges/tiers
- [ ] Social sharing of achievements
- [ ] Achievement notifications
- [ ] Leaderboard rankings
- [ ] Achievement categories filtering
- [ ] XP boosters/multipliers

## 🛠️ Development

All files created:

- Models: `Achievement.java`, `UserAchievement.java`, `UserStats.java`
- Repositories: `AchievementRepository.java`, `UserAchievementRepository.java`, `UserStatsRepository.java`
- Services: `LevelService.java`, `AchievementService.java`, `StatsService.java`
- Controller: `StatsController.java`
- Config: `DataInitializer.java`
- DTOs: `AchievementResponse.java`, Updated `UserStatsResponse.java`

Integrated into:

- `MessageService.java` - Track message stats & XP
- `PaymentService.java` - Track coin purchases & XP
- `AuthController.java` - Initialize new user stats

---

**System Status**: ✅ Fully Implemented & Ready to Use!
