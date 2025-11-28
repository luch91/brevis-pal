const Database = require('better-sqlite3');
const path = require('path');

class BrevisPalDB {
    constructor(dbPath = './brevis-pal.db') {
        this.db = new Database(dbPath);
        this.initializeTables();
    }

    initializeTables() {
        // Messages table - stores all Discord messages
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                channel_id TEXT NOT NULL,
                channel_name TEXT,
                guild_id TEXT NOT NULL,
                guild_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create index for faster queries
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_timestamp
            ON messages(user_id, timestamp)
        `);

        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_guild_timestamp
            ON messages(guild_id, timestamp)
        `);

        // Proofs table - stores all generated proofs
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS proofs (
                proof_id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id TEXT NOT NULL,
                requester_username TEXT NOT NULL,
                target_user_id TEXT,
                target_username TEXT,
                proof_type TEXT NOT NULL,
                claim TEXT NOT NULL,
                result TEXT NOT NULL,
                data_hash TEXT NOT NULL,
                guild_id TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_proof_id
            ON proofs(proof_id)
        `);

        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_requester
            ON proofs(requester_id)
        `);

        console.log('✅ Database tables initialized');
    }

    // Insert a new message
    insertMessage(messageData) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO messages
            (id, user_id, username, content, timestamp, channel_id, channel_name, guild_id, guild_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        try {
            stmt.run(
                messageData.id,
                messageData.userId,
                messageData.username,
                messageData.content,
                messageData.timestamp,
                messageData.channelId,
                messageData.channelName,
                messageData.guildId,
                messageData.guildName
            );
            return true;
        } catch (error) {
            console.error('Error inserting message:', error);
            return false;
        }
    }

    // Get total message count
    getTotalMessages() {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages');
        return stmt.get().count;
    }

    // Get messages by user
    getMessagesByUser(userId) {
        const stmt = this.db.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY timestamp DESC');
        return stmt.all(userId);
    }

    // Get message count by user
    getMessageCountByUser(userId) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE user_id = ?');
        return stmt.get(userId).count;
    }

    // Get stats for a guild
    getGuildStats(guildId) {
        const totalMessages = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE guild_id = ?').get(guildId).count;
        const uniqueUsers = this.db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE guild_id = ?').get(guildId).count;
        const oldestMessage = this.db.prepare('SELECT MIN(timestamp) as oldest FROM messages WHERE guild_id = ?').get(guildId).oldest;

        return {
            totalMessages,
            uniqueUsers,
            oldestMessage: oldestMessage ? new Date(oldestMessage) : null
        };
    }

    // Insert a new proof
    insertProof(proofData) {
        const stmt = this.db.prepare(`
            INSERT INTO proofs
            (requester_id, requester_username, target_user_id, target_username,
             proof_type, claim, result, data_hash, guild_id, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        try {
            const info = stmt.run(
                proofData.requesterId,
                proofData.requesterUsername,
                proofData.targetUserId,
                proofData.targetUsername,
                proofData.proofType,
                proofData.claim,
                proofData.result,
                proofData.dataHash,
                proofData.guildId,
                proofData.timestamp
            );
            return info.lastInsertRowid;
        } catch (error) {
            console.error('Error inserting proof:', error);
            return null;
        }
    }

    // Get proof by ID
    getProofById(proofId) {
        const stmt = this.db.prepare('SELECT * FROM proofs WHERE proof_id = ?');
        return stmt.get(proofId);
    }

    // Get all proofs by requester
    getProofsByRequester(requesterId) {
        const stmt = this.db.prepare('SELECT * FROM proofs WHERE requester_id = ? ORDER BY timestamp DESC');
        return stmt.all(requesterId);
    }

    // Get total proof count
    getTotalProofs() {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM proofs');
        return stmt.get().count;
    }

    // Get user stats (extended for proofs)
    getUserStats(userId, guildId) {
        const messageCount = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE user_id = ? AND guild_id = ?').get(userId, guildId).count;
        const firstMessage = this.db.prepare('SELECT MIN(timestamp) as first FROM messages WHERE user_id = ? AND guild_id = ?').get(userId, guildId).first;
        const lastMessage = this.db.prepare('SELECT MAX(timestamp) as last FROM messages WHERE user_id = ? AND guild_id = ?').get(userId, guildId).last;

        // Get most active channel
        const mostActiveChannel = this.db.prepare(`
            SELECT channel_name, COUNT(*) as count
            FROM messages
            WHERE user_id = ? AND guild_id = ?
            GROUP BY channel_id
            ORDER BY count DESC
            LIMIT 1
        `).get(userId, guildId);

        return {
            messageCount,
            firstMessage: firstMessage ? new Date(firstMessage) : null,
            lastMessage: lastMessage ? new Date(lastMessage) : null,
            mostActiveChannel: mostActiveChannel?.channel_name || 'N/A',
            mostActiveChannelCount: mostActiveChannel?.count || 0
        };
    }

    // Count keyword occurrences for a user
    countKeywordForUser(userId, keyword, guildId, timeframe = null) {
        let query = 'SELECT content FROM messages WHERE user_id = ? AND guild_id = ?';
        const params = [userId, guildId];

        if (timeframe) {
            query += ' AND timestamp >= ?';
            params.push(timeframe);
        }

        const messages = this.db.prepare(query).all(...params);

        let count = 0;
        const lowerKeyword = keyword.toLowerCase();
        const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

        messages.forEach(msg => {
            const matches = msg.content.toLowerCase().match(regex);
            if (matches) count += matches.length;
        });

        return count;
    }

    // Get leaderboard for message count
    getLeaderboard(guildId, limit = 10, timeframe = null) {
        let query = `
            SELECT user_id, username, COUNT(*) as count
            FROM messages
            WHERE guild_id = ?
        `;
        const params = [guildId];

        if (timeframe) {
            query += ' AND timestamp >= ?';
            params.push(timeframe);
        }

        query += `
            GROUP BY user_id
            ORDER BY count DESC
            LIMIT ?
        `;
        params.push(limit);

        return this.db.prepare(query).all(...params);
    }

    // Get leaderboard for specific keyword
    getKeywordLeaderboard(keyword, guildId, limit = 10, timeframe = null) {
        let query = 'SELECT user_id, username, content FROM messages WHERE guild_id = ?';
        const params = [guildId];

        if (timeframe) {
            query += ' AND timestamp >= ?';
            params.push(timeframe);
        }

        const messages = this.db.prepare(query).all(...params);

        // Count keywords per user
        const userCounts = {};
        const lowerKeyword = keyword.toLowerCase();
        const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

        messages.forEach(msg => {
            const matches = msg.content.toLowerCase().match(regex);
            if (matches) {
                if (!userCounts[msg.user_id]) {
                    userCounts[msg.user_id] = {
                        user_id: msg.user_id,
                        username: msg.username,
                        count: 0
                    };
                }
                userCounts[msg.user_id].count += matches.length;
            }
        });

        // Convert to array and sort
        return Object.values(userCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    // Get days since first message (for veteran achievement)
    getDaysSinceFirstMessage(userId, guildId) {
        const first = this.db.prepare('SELECT MIN(timestamp) as first FROM messages WHERE user_id = ? AND guild_id = ?').get(userId, guildId).first;
        if (!first) return 0;

        const daysDiff = (Date.now() - first) / (1000 * 60 * 60 * 24);
        return Math.floor(daysDiff);
    }

    // Get consecutive days with messages (for streak achievement)
    getActivityStreak(userId, guildId) {
        const messages = this.db.prepare(`
            SELECT DISTINCT DATE(timestamp / 1000, 'unixepoch') as date
            FROM messages
            WHERE user_id = ? AND guild_id = ?
            ORDER BY date DESC
        `).all(userId, guildId);

        if (messages.length === 0) return 0;

        let streak = 1;
        for (let i = 0; i < messages.length - 1; i++) {
            const current = new Date(messages[i].date);
            const next = new Date(messages[i + 1].date);
            const diffDays = (current - next) / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = BrevisPalDB;
