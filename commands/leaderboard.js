const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const EmbedTemplates = require('../utils/embeds');
const { getLeaderboardEducation } = require('../utils/education');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View activity leaderboards')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of leaderboard')
                .setRequired(true)
                .addChoices(
                    { name: 'Most Active (Messages)', value: 'most_active' },
                    { name: 'Keyword Usage', value: 'keyword' }
                )
        )
        .addStringOption(option =>
            option
                .setName('timeframe')
                .setDescription('Time period')
                .setRequired(false)
                .addChoices(
                    { name: 'This Week', value: 'week' },
                    { name: 'This Month', value: 'month' },
                    { name: 'All Time', value: 'all' }
                )
        )
        .addStringOption(option =>
            option
                .setName('keyword')
                .setDescription('Keyword to track (required for keyword type)')
                .setRequired(false)
        ),

    async execute(interaction, db) {
        const type = interaction.options.getString('type');
        const timeframe = interaction.options.getString('timeframe') || 'all';
        const keyword = interaction.options.getString('keyword');

        try {
            await interaction.deferReply();

            // Calculate timestamp for timeframe
            let timeframeTimestamp = null;
            let timeframeDisplay = 'All Time';

            if (timeframe === 'week') {
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                timeframeTimestamp = weekAgo;
                timeframeDisplay = 'This Week';
            } else if (timeframe === 'month') {
                const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                timeframeTimestamp = monthAgo;
                timeframeDisplay = 'This Month';
            }

            if (type === 'most_active') {
                // Get message leaderboard
                const leaderboard = db.getLeaderboard(interaction.guildId, 10, timeframeTimestamp);

                if (leaderboard.length === 0) {
                    const errorEmbed = EmbedTemplates.createErrorEmbed('No data available for this timeframe.');
                    return interaction.editReply({ embeds: [errorEmbed] });
                }

                // Create leaderboard embed
                const embed = new EmbedBuilder()
                    .setColor(0xFFD700) // Gold
                    .setTitle(`🏆 Most Active Users - ${timeframeDisplay}`)
                    .setDescription('Ranked by message count')
                    .setTimestamp();

                // Add rankings
                let description = '';
                leaderboard.forEach((user, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    description += `${medal} **${user.username}** - ${user.count} messages\n`;
                });

                embed.addFields({ name: 'Rankings', value: description });

                // Add educational section
                const education = getLeaderboardEducation('mostActive');
                embed.addFields(
                    { name: '\u200B', value: '\u200B', inline: false }, // Spacer
                    { name: education.title, value: education.description, inline: false }
                );

                embed.setFooter({ text: `Server: ${interaction.guild.name} | Use /prove to verify counts` });

                await interaction.editReply({ embeds: [embed] });

            } else if (type === 'keyword') {
                if (!keyword) {
                    const errorEmbed = EmbedTemplates.createErrorEmbed('Please provide a keyword for keyword leaderboard!');
                    return interaction.editReply({ embeds: [errorEmbed] });
                }

                // Get keyword leaderboard
                const leaderboard = db.getKeywordLeaderboard(keyword, interaction.guildId, 10, timeframeTimestamp);

                if (leaderboard.length === 0) {
                    const errorEmbed = EmbedTemplates.createErrorEmbed(`No one has said "${keyword}" in this timeframe.`);
                    return interaction.editReply({ embeds: [errorEmbed] });
                }

                // Create leaderboard embed
                const embed = new EmbedBuilder()
                    .setColor(0x9B59B6) // Purple
                    .setTitle(`🔤 Keyword Leaderboard: "${keyword}" - ${timeframeDisplay}`)
                    .setDescription(`Who says "${keyword}" the most?`)
                    .setTimestamp();

                // Add rankings
                let description = '';
                leaderboard.forEach((user, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    description += `${medal} **${user.username}** - ${user.count} times\n`;
                });

                embed.addFields({ name: 'Rankings', value: description });

                // Add educational section
                const keywordEducation = getLeaderboardEducation('keyword');
                embed.addFields(
                    { name: '\u200B', value: '\u200B', inline: false }, // Spacer
                    { name: keywordEducation.title, value: keywordEducation.description, inline: false }
                );

                embed.setFooter({ text: `Server: ${interaction.guild.name} | Use /prove to verify` });

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error in leaderboard command:', error);
            const errorEmbed = EmbedTemplates.createErrorEmbed('An error occurred while fetching leaderboard.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
