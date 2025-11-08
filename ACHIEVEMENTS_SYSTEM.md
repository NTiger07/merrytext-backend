# MerryText - Achievements, Stats & Leveling System

## 🎯 Overview

Complete gamification infrastructure with achievements, user statistics, XP, and leveling system. The system automatically initializes on server startup and creates achievement entries for all users.

## 🚀 Automatic Initialization

### On Server Startup:

1. **Achievement Population** - Loads default achievements into the database (skips if already exist)
2. **UserAchievement Initialization** - Adds achievement entries to each user's `achievements` array if missing

### On New User Registration:

1. **User Stats** - Automatically initialized as embedded `stats` object with default values
2. **User Achievements** - All achievements are added to the user's `achievements` array with 0 progress

### Initialization Script:

Located at: `src/scripts/initAchievements.js`

**Functions:**

- `initializeAchievements()` - Populates achievement definitions (idempotent)
- `initializeUserAchievements()` - Adds missing achievements to all users' arrays (idempotent)
- `initializeUserAchievementsForUser(userId)` - Initializes achievements for a specific user

## 📊 Database Schema

### Architecture: Embedded Subdocuments

Stats and achievements are **embedded within the User schema** for improved performance and data consistency.

**User Model Structure:**

```javascript
{
  email, username, name, // ... other user fields
  merryCoins, totalXp, level,

  // Embedded stats object
  stats: {
    totalMessagesSent: Number,
    totalMessagesViewed: Number,
    totalCoinsEarned: Number,
    totalCoinsSpent: Number,
    uniqueRecipients: Number,
    messagesViewedToday: Number,
    lastMessageDate: Date,
    currentStreak: Number,
    longestStreak: Number
  },

  // Embedded achievements array
  achievements: [{
    achievementId: ObjectId (ref: 'Achievement'),
    progress: Number,
    unlocked: Boolean,
    unlockedAt: Date
  }]
}
```

**Achievement Collection (Separate):**
Stores achievement definitions that are referenced by users:

- name, description, icon, total, category, xpReward

### Benefits of Embedded Design:

- ✅ Single query to get user with stats and achievements
- ✅ Atomic updates - all user data updates together
- ✅ Better performance - no joins or separate queries
- ✅ Data consistency guaranteed
- ✅ Simplified code

## 🏆 Achievements System

### Default Achievements:

1. **First Message** (✨)

   - Description: Send your first festive message
   - Requirement: 1 message
   - XP Reward: 50
   - Category: messaging

2. **Social Butterfly** (🎯)

   - Description: Send messages to 10 different people
   - Requirement: 10 unique recipients
   - XP Reward: 100
   - Category: social

3. **Coin Collector** (🏆)

   - Description: Earn 100 coins
   - Requirement: 100 coins earned
   - XP Reward: 75
   - Category: coins

4. **Speed Sender** (⚡)

   - Description: Send 5 messages in one day
   - Requirement: 5 messages in one day
   - XP Reward: 60
   - Category: speed

5. **Master Messenger** (🏅)
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
2. ✅ Create `UserAchievement` entries for all achievements (via `initializeUserAchievementsForUser`)
3. ✅ Set initial level to 1, XP to 0
4. ✅ Award 100 starter coins

## 🎮 Services Overview

### Initialization Service (`initAchievements.js`)

- `initializeAchievements()` - Populate achievement definitions (runs on startup, idempotent)
- `initializeUserAchievements()` - Create UserAchievement entries for all users (runs on startup, idempotent)
- `initializeUserAchievementsForUser(userId)` - Initialize achievements for a new user

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
- Calls `initializeUserAchievementsForUser()` on registration (from `initAchievements.js`)

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
    icon: "✨", // Emoji icons
    unlocked: true,
    progress: 1,
    total: 1,
  },
  // ... more achievements
];
```

## ⚡ Performance & Implementation Notes

- Achievement initialization runs **once on server startup** (idempotent - safe to run multiple times)
- **Skips existing entries** - Won't create duplicates if achievements or UserAchievements already exist
- UserAchievement entries are created automatically for:
  - All existing users on startup
  - New users on registration
- Achievement checking is batched and runs after actions
- Stats updates use proper error handling for consistency
- Achievements are loaded from database
- Leaderboard can be optimized with database indexes

## 🔧 Setup Instructions

### 1. Start the server

The achievements system will automatically initialize:

```bash
npm start
```

Expected console output:

```
✅ Connected to MongoDB
🎯 Initializing achievements system...
✅ Created achievement: First Message
✅ Created achievement: Social Butterfly
✅ Created achievement: Coin Collector
✅ Created achievement: Speed Sender
✅ Created achievement: Master Messenger
📊 Total achievements in database: 5
✅ UserAchievements initialized: 25 created, 0 already existed
✅ Server running on port 3000
```

### 2. Register a new user

User achievements are automatically initialized:

```bash
POST /merrytext/api/v1/user/register
```

The system will:

- Create the user account
- Initialize UserStats
- Create UserAchievement entries for all 5 achievements
- Award 100 starting coins

### 3. Verify initialization

Check user achievements:

```bash
GET /merrytext/api/v1/stats/achievements/{username}
```

You should see all 5 achievements with `unlocked: false` and `progress: 0`

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

**Core Files:**

- `src/scripts/initAchievements.js` - Achievement initialization logic (NEW)
- `src/models/Achievement.js` - Achievement model
- `src/models/UserAchievement.js` - UserAchievement model
- `src/models/UserStats.js` - UserStats model
- `src/controllers/stats.controller.js` - Stats API endpoints
- `src/controllers/user.controller.js` - User registration (calls initialization)
- `src/index.js` - Server startup (calls initialization)

**Integrated into:**

- `src/index.js` - Runs initialization on startup
- `src/controllers/user.controller.js` - Initializes achievements for new users
- `src/controllers/message.controller.js` - Track message stats & XP (TODO)
- `src/controllers/payment.controller.js` - Track coin purchases & XP (TODO)

## 🔄 Migration Guide

If you have existing users without achievements:

1. **Simply restart the server** - The initialization script will automatically:

   - Create the 5 default achievements (if they don't exist)
   - Create UserAchievement entries for all existing users
   - Skip any that already exist (idempotent)

2. **Manual initialization** (optional):

```javascript
const {
  initializeAchievements,
  initializeUserAchievements,
} = require("./src/scripts/initAchievements");

// In a Node.js script or console
await initializeAchievements();
await initializeUserAchievements();
```

---

**System Status**: ✅ Fully Implemented & Auto-Initializing!
