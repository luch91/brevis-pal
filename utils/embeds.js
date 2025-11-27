const { EmbedBuilder } = require('discord.js');
const ProofGenerator = require('./proofs');

class EmbedTemplates {
    /**
     * Create a proof card embed
     * @param {Object} proof - Proof data from database
     * @returns {EmbedBuilder} - Discord embed
     */
    static createProofCard(proof) {
        const formattedId = ProofGenerator.formatProofId(proof.proof_id);
        const proofTypeName = ProofGenerator.getProofTypeName(proof.proof_type);
        const timestamp = new Date(proof.timestamp);

        const embed = new EmbedBuilder()
            .setColor(0x00FF00) // Green for verified
            .setTitle(`📜 Proof #${formattedId}`)
            .setDescription('━━━━━━━━━━━━━━━━━━━━━━')
            .addFields(
                { name: '📋 Claim', value: proof.claim, inline: false },
                { name: '✓ Result', value: proof.result, inline: false },
                { name: '📅 Generated', value: timestamp.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }), inline: true },
                { name: '🔐 Data Hash', value: `\`${proof.data_hash}\``, inline: true },
                { name: '📂 Type', value: proofTypeName, inline: true }
            )
            .setFooter({ text: `Anyone can verify: /verify ${formattedId} | Requested by ${proof.requester_username}` })
            .setTimestamp(timestamp);

        return embed;
    }

    /**
     * Create a stats card embed
     * @param {Object} params - Stats parameters
     * @returns {EmbedBuilder} - Discord embed
     */
    static createStatsCard(params) {
        const { user, stats, guildName } = params;

        const embed = new EmbedBuilder()
            .setColor(0x3498db) // Blue
            .setTitle(`📊 Activity Stats for ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '💬 Total Messages', value: stats.messageCount.toString(), inline: true },
                { name: '📍 Most Active Channel', value: `#${stats.mostActiveChannel} (${stats.mostActiveChannelCount} msgs)`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true } // Spacer
            );

        if (stats.firstMessage) {
            embed.addFields({
                name: '📅 First Seen',
                value: stats.firstMessage.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                inline: true
            });
        }

        if (stats.lastMessage) {
            embed.addFields({
                name: '🕐 Last Active',
                value: stats.lastMessage.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                inline: true
            });
        }

        embed.setFooter({ text: `Server: ${guildName}` })
            .setTimestamp();

        return embed;
    }

    /**
     * Create an error embed
     * @param {string} message - Error message
     * @returns {EmbedBuilder} - Discord embed
     */
    static createErrorEmbed(message) {
        return new EmbedBuilder()
            .setColor(0xFF0000) // Red
            .setTitle('❌ Error')
            .setDescription(message)
            .setTimestamp();
    }

    /**
     * Create a success embed
     * @param {string} message - Success message
     * @returns {EmbedBuilder} - Discord embed
     */
    static createSuccessEmbed(message) {
        return new EmbedBuilder()
            .setColor(0x00FF00) // Green
            .setTitle('✅ Success')
            .setDescription(message)
            .setTimestamp();
    }
}

module.exports = EmbedTemplates;
