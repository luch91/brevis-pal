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

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = BrevisPalDB;
