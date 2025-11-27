const { SlashCommandBuilder } = require('discord.js');
const EmbedTemplates = require('../utils/embeds');
const ProofGenerator = require('../utils/proofs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prove')
        .setDescription('Generate a verifiable proof of user activity')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to prove data for')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of proof to generate')
                .setRequired(true)
                .addChoices(
                    { name: 'Message Count', value: 'message_count' }
                )
        ),

    async execute(interaction, db) {
        const targetUser = interaction.options.getUser('user');
        const proofType = interaction.options.getString('type');

        // Check if user is a bot
        if (targetUser.bot) {
            const errorEmbed = EmbedTemplates.createErrorEmbed('Cannot generate proofs for bots!');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Defer reply since proof generation might take a moment
            await interaction.deferReply();

            if (proofType === 'message_count') {
                // Get message count and messages for hash
                const messageCount = db.getMessageCountByUser(targetUser.id);
                const messages = db.getMessagesByUser(targetUser.id);

                if (messageCount === 0) {
                    const errorEmbed = EmbedTemplates.createErrorEmbed(
                        `No messages found for ${targetUser.username}. Cannot generate proof.`
                    );
                    return interaction.editReply({ embeds: [errorEmbed] });
                }

                // Generate proof
                const proofData = ProofGenerator.generateMessageCountProof({
                    requesterId: interaction.user.id,
                    requesterUsername: interaction.user.tag,
                    targetUserId: targetUser.id,
                    targetUsername: targetUser.tag,
                    messageCount: messageCount,
                    guildId: interaction.guildId,
                    messages: messages.map(m => ({ id: m.id, timestamp: m.timestamp }))
                });

                // Save proof to database
                const proofId = db.insertProof(proofData);

                if (!proofId) {
                    const errorEmbed = EmbedTemplates.createErrorEmbed('Failed to generate proof. Please try again.');
                    return interaction.editReply({ embeds: [errorEmbed] });
                }

                // Retrieve the saved proof
                const savedProof = db.getProofById(proofId);

                // Create and send proof card
                const proofEmbed = EmbedTemplates.createProofCard(savedProof);

                await interaction.editReply({ embeds: [proofEmbed] });

                console.log(`✅ Generated proof #${proofId} for ${targetUser.tag} (requested by ${interaction.user.tag})`);
            }
        } catch (error) {
            console.error('Error in prove command:', error);
            const errorEmbed = EmbedTemplates.createErrorEmbed('An error occurred while generating proof.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
