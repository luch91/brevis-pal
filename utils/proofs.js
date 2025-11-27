const crypto = require('crypto');

class ProofGenerator {
    /**
     * Generate a proof for message count
     * @param {Object} params - Proof parameters
     * @returns {Object} - Proof data ready for database
     */
    static generateMessageCountProof(params) {
        const {
            requesterId,
            requesterUsername,
            targetUserId,
            targetUsername,
            messageCount,
            guildId,
            messages = []
        } = params;

        const claim = `${targetUsername} sent ${messageCount} message${messageCount !== 1 ? 's' : ''}`;
        const result = `✓ VERIFIED - ${messageCount} message${messageCount !== 1 ? 's' : ''}`;
        const dataHash = this.generateDataHash(messages);

        return {
            requesterId,
            requesterUsername,
            targetUserId,
            targetUsername,
            proofType: 'message_count',
            claim,
            result,
            dataHash,
            guildId,
            timestamp: Date.now()
        };
    }

    /**
     * Generate data commitment hash
     * @param {Array} data - Data to hash
     * @returns {string} - SHA-256 hash
     */
    static generateDataHash(data) {
        const dataString = JSON.stringify(data);
        return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
    }

    /**
     * Format proof ID with padding
     * @param {number} proofId - Raw proof ID
     * @returns {string} - Formatted proof ID (e.g., "00042")
     */
    static formatProofId(proofId) {
        return String(proofId).padStart(5, '0');
    }

    /**
     * Get proof type display name
     * @param {string} proofType - Internal proof type
     * @returns {string} - User-friendly name
     */
    static getProofTypeName(proofType) {
        const typeNames = {
            'message_count': 'Message Count',
            'keyword_count': 'Keyword Frequency',
            'activity_streak': 'Activity Streak',
            'first_message': 'First Message Date'
        };
        return typeNames[proofType] || 'Unknown';
    }
}

module.exports = ProofGenerator;
