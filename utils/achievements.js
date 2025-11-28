/**
 * Achievements System
 * Defines bot achievements and calculation logic
 */

// Achievement definitions
const BOT_ACHIEVEMENTS = [
    {
        id: 'chatterbox',
        name: 'Chatterbox',
        description: '1000+ messages',
        emoji: '💬',
        threshold: 1000,
        check: (stats, db, userId, guildId) => {
            return stats.messageCount >= 1000;
        }
    },
    {
        id: 'veteran',
        name: 'Veteran',
        description: 'Member for 30+ days',
        emoji: '🏛️',
        threshold: 30,
        check: (stats, db, userId, guildId) => {
            const days = db.getDaysSinceFirstMessage(userId, guildId);
            return days >= 30;
        },
        progress: (stats, db, userId, guildId) => {
            const days = db.getDaysSinceFirstMessage(userId, guildId);
            return { current: days, required: 30 };
        }
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Active 3+ days in a row',
        emoji: '🌅',
        threshold: 3,
        check: (stats, db, userId, guildId) => {
            const streak = db.getActivityStreak(userId, guildId);
            return streak >= 3;
        },
        progress: (stats, db, userId, guildId) => {
            const streak = db.getActivityStreak(userId, guildId);
            return { current: streak, required: 3 };
        }
    },
    {
        id: 'gbrevis_champion',
        name: 'gBrevis Champion',
        description: 'Said "gbrevis" 50+ times',
        emoji: '🏆',
        threshold: 50,
        check: (stats, db, userId, guildId) => {
            const count = db.countKeywordForUser(userId, 'gbrevis', guildId);
            return count >= 50;
        },
        progress: (stats, db, userId, guildId) => {
            const count = db.countKeywordForUser(userId, 'gbrevis', guildId);
            return { current: count, required: 50 };
        }
    },
    {
        id: 'brevis_expert',
        name: 'Brevis Expert',
        description: 'Said "brevis" 100+ times',
        emoji: '🎓',
        threshold: 100,
        check: (stats, db, userId, guildId) => {
            const count = db.countKeywordForUser(userId, 'brevis', guildId);
            return count >= 100;
        },
        progress: (stats, db, userId, guildId) => {
            const count = db.countKeywordForUser(userId, 'brevis', guildId);
            return { current: count, required: 100 };
        }
    },
    {
        id: 'proof_master',
        name: 'Proof Master',
        description: 'Generated 10+ proofs',
        emoji: '📜',
        threshold: 10,
        check: (stats, db, userId, guildId) => {
            const proofs = db.getProofsByRequester(userId);
            return proofs.length >= 10;
        },
        progress: (stats, db, userId, guildId) => {
            const proofs = db.getProofsByRequester(userId);
            return { current: proofs.length, required: 10 };
        }
    },
    {
        id: 'consistent',
        name: 'Consistent',
        description: 'Active 7+ days in a row',
        emoji: '📅',
        threshold: 7,
        check: (stats, db, userId, guildId) => {
            const streak = db.getActivityStreak(userId, guildId);
            return streak >= 7;
        },
        progress: (stats, db, userId, guildId) => {
            const streak = db.getActivityStreak(userId, guildId);
            return { current: streak, required: 7 };
        }
    },
    {
        id: 'helper',
        name: 'Helper',
        description: 'Said "help" 25+ times',
        emoji: '🤝',
        threshold: 25,
        check: (stats, db, userId, guildId) => {
            const count = db.countKeywordForUser(userId, 'help', guildId);
            return count >= 25;
        },
        progress: (stats, db, userId, guildId) => {
            const count = db.countKeywordForUser(userId, 'help', guildId);
            return { current: count, required: 25 };
        }
    }
];

// Brevis Discord roles to track
const BREVIS_ROLES = [
    'Tailblazer',
    'Kactive',
    'Whisker Prime',
    'Script Kitty',
    'OG',
    'Claw and Order',
    'Picatsso',
    'Viral Claws',
    'Frame Purrfect',
    'Whiskerpedia',
    'Alphakat',
    'Watchkat',
    'Katcrew',
    'Pawsitive Prover'
];

/**
 * Check all achievements for a user
 * @param {Object} stats - User stats
 * @param {Object} db - Database instance
 * @param {string} userId - Discord user ID
 * @param {string} guildId - Discord guild ID
 * @returns {Object} Unlocked and locked achievements
 */
function checkAchievements(stats, db, userId, guildId) {
    const unlocked = [];
    const locked = [];

    BOT_ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievement.check(stats, db, userId, guildId);

        if (isUnlocked) {
            unlocked.push({
                ...achievement,
                unlocked: true
            });
        } else {
            const progress = achievement.progress ? achievement.progress(stats, db, userId, guildId) : null;
            locked.push({
                ...achievement,
                unlocked: false,
                progress
            });
        }
    });

    return { unlocked, locked };
}

/**
 * Get user's Brevis Discord roles
 * @param {GuildMember} member - Discord guild member
 * @returns {Array<string>} List of Brevis role names
 */
function getBrevisRoles(member) {
    const userRoles = member.roles.cache.map(role => role.name);
    return BREVIS_ROLES.filter(brevisRole =>
        userRoles.some(userRole => userRole.toLowerCase() === brevisRole.toLowerCase())
    );
}

module.exports = {
    BOT_ACHIEVEMENTS,
    BREVIS_ROLES,
    checkAchievements,
    getBrevisRoles
};
