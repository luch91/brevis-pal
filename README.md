# Brevis-Pal Discord Bot

An educational Discord bot that demonstrates how Brevis ZK proofs work using Discord messages.

## Setup

1. Copy `.env.example` to `.env`
2. Add your Discord bot token and client ID to `.env`
3. Run `npm install`
4. Deploy slash commands: `npm run deploy`
5. Start the bot: `npm start`

## Features

### Phase 1: Data Collection ✅
- Collects all server messages in real-time
- Stores message data in SQLite database
- Basic stats commands (!ping, !mystats, !serverstats)

### Phase 2: Proof System ✅
- `/stats @user` - View detailed user activity statistics
- `/prove @user message_count` - Generate verifiable proof of message count
- `/verify [proof_id]` - Verify any past proof by ID
- Professional proof cards with unique IDs
- Data commitment hashing for integrity

### Phase 3: Competitions & Achievements ✅
- `/leaderboard most_active [timeframe]` - Top 10 most active users
- `/leaderboard keyword [keyword] [timeframe]` - Keyword usage rankings
- `/prove @user keyword_count [keyword]` - Prove keyword usage
- `/achievements [@user]` - View achievements and Discord roles
- Tracks Brevis community roles and bot achievements
- Progress tracking for locked achievements

### Phase 4: Educational Layer & Polish ✅
- Educational explanations in every proof card
- Brevis parallels in leaderboards and achievements
- `/learn` command with ZK proof and Brevis education
- `/help` command with comprehensive guide
- Enhanced error messages with educational tips
- Discord vs Brevis comparison tables

## Commands

### Slash Commands

**Proofs:**
- `/stats @user` - Show activity statistics for a user
- `/prove @user message_count` - Generate proof of message count
- `/prove @user keyword_count [keyword]` - Generate proof of keyword usage
- `/verify [proof_id]` - Look up and verify any proof

**Leaderboards:**
- `/leaderboard most_active [week|month|all]` - Most active users
- `/leaderboard keyword [keyword] [week|month|all]` - Keyword champions

**Achievements:**
- `/achievements` - View your achievements and roles
- `/achievements @user` - View someone else's achievements

**Learning:**
- `/learn basics` - Learn about ZK proofs
- `/learn brevis` - What is Brevis?
- `/learn bot` - How this bot works
- `/learn verify` - Why verification matters
- `/help` - Complete command guide

### Legacy Commands (Testing)
- `!ping` - Check bot status
- `!mystats` - Quick personal stats
- `!serverstats` - Server-wide statistics

## Tracked Keywords

gbrevis, good morning, brevis, zk proof, zkproof, pico prism, proof, coprocessor, active, help, tailblazer, how are you, contributor, contribution

## Bot Achievements

- **Chatterbox** - 1000+ messages
- **Veteran** - Member for 30+ days
- **Early Bird** - Active 3+ days in a row
- **gBrevis Champion** - Said "gbrevis" 50+ times
- **Brevis Expert** - Said "brevis" 100+ times
- **Proof Master** - Generated 10+ proofs
- **Consistent** - Active 7+ days in a row
- **Helper** - Said "help" 25+ times

## Tracked Brevis Roles

Tailblazer, Kactive, Whisker Prime, Script Kitty, OG, Claw and Order, Picatsso, Viral Claws, Frame Purrfect, Whiskerpedia, Alphakat, Watchkat, Katcrew, Pawsitive Prover

## Project Structure

```
brevis-pal/
├── commands/              # Slash command handlers
│   ├── stats.js           # User statistics
│   ├── prove.js           # Proof generation
│   ├── verify.js          # Proof verification
│   ├── leaderboard.js     # Leaderboards
│   ├── achievements.js    # Achievements & roles
│   ├── learn.js           # Educational content
│   └── help.js            # Help system
├── utils/                 # Utility modules
│   ├── proofs.js          # Proof generation logic
│   ├── embeds.js          # Discord embed templates
│   ├── keywords.js        # Keyword configuration
│   ├── achievements.js    # Achievement definitions
│   └── education.js       # Educational content & comparisons
├── index.js               # Main bot file
├── database.js            # Database operations
├── deploy-commands.js     # Command registration script
└── .env                  # Configuration (keep secret!)
```

## Database Schema

### messages
Stores all Discord messages for proof generation

### proofs
Stores all generated proofs for verification and audit trail

## Educational Purpose

This bot teaches Brevis concepts through Discord:
- **Discord messages** = Blockchain transactions
- **Proof generation** = ZK proof creation
- **Verification** = On-chain proof verification
- **Leaderboards** = Provable rankings (no cheating!)
- **Achievements** = Verifiable milestones
