const { SlashCommandBuilder } = require('discord.js');
const EmbedTemplates = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify a proof by its ID')
        .addIntegerOption(option =>
            option
                .setName('proof_id')
                .setDescription('The proof ID to verify')
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction, db) {
        const proofId = interaction.options.getInteger('proof_id');

        try {
            // Look up the proof
            const proof = db.getProofById(proofId);

            if (!proof) {
                const errorEmbed = EmbedTemplates.createErrorEmbed(
                    `Proof #${String(proofId).padStart(5, '0')} not found. Please check the ID and try again.`
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Create proof card
            const proofEmbed = EmbedTemplates.createProofCard(proof);

            await interaction.reply({ embeds: [proofEmbed] });

            console.log(`🔍 Proof #${proofId} verified by ${interaction.user.tag}`);
        } catch (error) {
            console.error('Error in verify command:', error);
            const errorEmbed = EmbedTemplates.createErrorEmbed('An error occurred while verifying proof.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
