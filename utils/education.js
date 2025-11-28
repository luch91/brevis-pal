/**
 * Educational Content
 * Contains all educational text explaining Brevis concepts through Discord bot analogies
 */

const EDUCATIONAL_CONTENT = {
    // Proof-related education
    proof: {
        messageCount: {
            title: '🎓 Brevis Parallel',
            description: 'In Brevis, this is like proving:\n"Wallet made X transactions to Contract Y"',
            whyItMatters: '• Data is verifiable (anyone can check)\n• Computation is proven (not just claimed)\n• History is preserved (proof stored forever)'
        },
        keywordCount: {
            title: '🎓 Brevis Parallel',
            description: 'In Brevis, this is like proving:\n"Wallet interacted with Protocol X exactly Y times"',
            whyItMatters: '• Proves behavior patterns on-chain\n• Enables reputation systems\n• Powers conditional access (prove usage to unlock features)'
        },
        general: {
            title: '💡 What This Proves',
            description: 'This proof is permanent and verifiable. Anyone can use `/verify [id]` to check it anytime.',
            analogy: 'Like a blockchain transaction - once proven, always provable!'
        }
    },

    // Leaderboard-related education
    leaderboard: {
        mostActive: {
            title: '🎓 Learn: Provably Fair Rankings',
            description: 'Every ranking can be verified with `/prove`.\nIn Brevis, this prevents cheating in on-chain leaderboards.',
            example: 'Example: DeFi protocols can prove top traders without trusting a centralized authority.'
        },
        keyword: {
            title: '🎓 Learn: Verifiable Behavior',
            description: 'Keyword tracking proves engagement patterns.\nIn Brevis, this enables reputation based on proven on-chain activity.',
            example: 'Example: Prove you\'re an "active governance participant" by verified voting history.'
        }
    },

    // Achievement-related education
    achievement: {
        unlocked: {
            title: '🎓 Brevis Connection',
            description: 'This achievement is verifiable and permanent.\nLike proving you\'re a "DeFi power user" with 100+ protocol interactions.',
            benefit: 'On-chain achievements enable:\n• Reputation systems\n• Access control\n• Reward distribution'
        },
        progress: {
            title: '💡 Progress Tracking',
            description: 'Your progress is calculated from verifiable data.\nIn Brevis, similar logic runs in ZK circuits for privacy-preserving proofs.'
        }
    },

    // Learn command content
    learn: {
        basics: {
            title: '📚 What are ZK Proofs?',
            content: `**Zero-Knowledge Proofs** let you prove something is true without revealing the underlying data.

**Example:**
Prove you're over 18 without showing your birthdate.

**How this bot demonstrates it:**
We prove message counts without exposing every message.
We prove keyword usage without revealing exact content.

**Why it matters:**
• Privacy-preserving verification
• Trustless computation
• Scalable blockchain applications`,
            footer: 'Try: /prove to generate your first ZK-style proof!'
        },
        brevis: {
            title: '🔷 What is Brevis?',
            content: `**Brevis** is a ZK coprocessor that enables smart contracts to access and compute over historical blockchain data.

**The Problem:**
Smart contracts can't efficiently access old blockchain data.

**Brevis Solution:**
Generate ZK proofs of historical data and computations off-chain, verify on-chain.

**Real Use Cases:**
• DeFi: Prove trading volume for tiered fees
• Governance: Prove voting history for reputation
• Gaming: Prove in-game achievements
• Identity: Prove on-chain credentials

**This Bot's Parallel:**
We prove Discord history → Brevis proves blockchain history`,
            footer: 'Learn more: https://docs.brevis.network',
            link: 'https://docs.brevis.network'
        },
        bot: {
            title: '🤖 How This Bot Works',
            content: `**Data Collection:**
The bot stores all Discord messages (like blockchain stores transactions).

**Proof Generation:**
When you request a proof, we:
1. Query the database
2. Calculate the result
3. Generate a data commitment hash
4. Store the proof permanently

**Verification:**
Anyone can use \`/verify [id]\` to see the proof anytime.

**The Parallel:**
Discord Messages → Blockchain Transactions
Our Database → Blockchain History
Our Proofs → ZK Proofs
/verify Command → On-chain Verification`,
            footer: 'Try: /stats to see your collected data!'
        },
        verify: {
            title: '✅ Why Verification Matters',
            content: `**Trust vs. Proof:**
❌ Without proofs: "Trust me, I have 1000 messages"
✅ With proofs: "Here's proof #42, anyone can verify"

**Permanence:**
Proofs are stored forever. Even if data changes, the proof remains valid for its timestamp.

**Transparency:**
Every proof shows:
• What was proven
• When it was proven
• How to verify it
• Data commitment hash

**In Brevis:**
Smart contracts verify ZK proofs on-chain.
No need to trust the prover - math guarantees correctness!`,
            footer: 'Try: /verify 1 to see your first proof!'
        }
    },

    // Comparison tables
    comparisons: {
        discordVsBrevis: {
            title: '📊 Discord Bot vs Brevis',
            table: `\`\`\`
| Discord Bot          | Brevis               |
|---------------------|---------------------|
| Message             | Transaction         |
| User activity       | Wallet behavior     |
| Our database        | Blockchain          |
| Your proof          | ZK Proof            |
| /verify command     | On-chain verify     |
| Data hash           | State commitment    |
\`\`\``,
            description: 'Same concepts, different context!'
        },
        traditionalVsZK: {
            title: '🔐 Traditional vs ZK Verification',
            table: `\`\`\`
| Traditional          | Zero-Knowledge      |
|---------------------|---------------------|
| Show all data       | Prove property      |
| "Here are my msgs"  | "I have 100+ msgs"  |
| Privacy risk        | Privacy preserved   |
| Large data transfer | Small proof         |
\`\`\``,
            description: 'ZK proofs are smaller, faster, and more private!'
        }
    }
};

/**
 * Get educational content for proof type
 */
function getProofEducation(proofType) {
    const education = EDUCATIONAL_CONTENT.proof[proofType] || EDUCATIONAL_CONTENT.proof.general;
    return education;
}

/**
 * Get educational content for leaderboard type
 */
function getLeaderboardEducation(leaderboardType) {
    return EDUCATIONAL_CONTENT.leaderboard[leaderboardType] || EDUCATIONAL_CONTENT.leaderboard.mostActive;
}

/**
 * Get educational content for achievements
 */
function getAchievementEducation(isUnlocked) {
    return isUnlocked ? EDUCATIONAL_CONTENT.achievement.unlocked : EDUCATIONAL_CONTENT.achievement.progress;
}

/**
 * Get learn command content
 */
function getLearnContent(topic) {
    return EDUCATIONAL_CONTENT.learn[topic];
}

/**
 * Get comparison table
 */
function getComparison(type) {
    return EDUCATIONAL_CONTENT.comparisons[type];
}

module.exports = {
    EDUCATIONAL_CONTENT,
    getProofEducation,
    getLeaderboardEducation,
    getAchievementEducation,
    getLearnContent,
    getComparison
};
