const { SlashCommandBuilder } = require('discord.js');
const EmbedTemplates = require('../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show activity statistics for a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get stats for')
                .setRequired(true)
        ),

    async execute(interaction, db) {
        const targetUser = interaction.options.getUser('user');

        // Check if user is a bot
        if (targetUser.bot) {
            const errorEmbed = EmbedTemplates.createErrorEmbed('Cannot get stats for bots!');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Get user stats from database
            const stats = db.getUserStats(targetUser.id, interaction.guildId);

            if (stats.messageCount === 0) {
                const errorEmbed = EmbedTemplates.createErrorEmbed(
                    `No messages found for ${targetUser.username}. They may not have sent any messages since I started collecting data.`
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Create stats embed
            const statsEmbed = EmbedTemplates.createStatsCard({
                user: targetUser,
                stats: stats,
                guildName: interaction.guild.name
            });

            await interaction.reply({ embeds: [statsEmbed] });
        } catch (error) {
            console.error('Error in stats command:', error);
            const errorEmbed = EmbedTemplates.createErrorEmbed('An error occurred while fetching stats.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
