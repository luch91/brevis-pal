const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const EmbedTemplates = require('../utils/embeds');
const { checkAchievements, getBrevisRoles } = require('../utils/achievements');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('achievements')
        .setDescription('View achievements and roles')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to view achievements for (leave empty for yourself)')
                .setRequired(false)
        ),

    async execute(interaction, db) {
        const targetUser = interaction.options.getUser('user') || interaction.user;

        // Check if user is a bot
        if (targetUser.bot) {
            const errorEmbed = EmbedTemplates.createErrorEmbed('Cannot view achievements for bots!');
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            await interaction.deferReply();

            // Get guild member for role info
            const member = await interaction.guild.members.fetch(targetUser.id);

            // Get user stats
            const stats = db.getUserStats(targetUser.id, interaction.guildId);

            if (stats.messageCount === 0) {
                const errorEmbed = EmbedTemplates.createErrorEmbed(
                    `${targetUser.username} hasn't sent any messages yet. No achievements to show.`
                );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Check achievements
            const { unlocked, locked } = checkAchievements(stats, db, targetUser.id, interaction.guildId);

            // Get Brevis Discord roles
            const brevisRoles = getBrevisRoles(member);

            // Create achievement embed
            const embed = new EmbedBuilder()
                .setColor(0x00AE86) // Teal
                .setTitle(`📊 Profile: ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            // Add Discord roles section
            if (brevisRoles.length > 0) {
                const rolesText = brevisRoles.map(role => `✓ ${role}`).join('\n');
                embed.addFields({ name: '🎭 Server Roles', value: rolesText, inline: false });
            } else {
                embed.addFields({ name: '🎭 Server Roles', value: 'No special roles yet', inline: false });
            }

            // Add unlocked achievements
            if (unlocked.length > 0) {
                const unlockedText = unlocked.map(ach =>
                    `${ach.emoji} **${ach.name}** - ${ach.description}`
                ).join('\n');
                embed.addFields({ name: '🏆 Unlocked Achievements', value: unlockedText, inline: false });
            } else {
                embed.addFields({ name: '🏆 Unlocked Achievements', value: 'No achievements unlocked yet', inline: false });
            }

            // Add locked achievements with progress
            if (locked.length > 0) {
                const lockedText = locked.slice(0, 5).map(ach => {
                    const progressText = ach.progress
                        ? ` (${ach.progress.current}/${ach.progress.required})`
                        : '';
                    return `🔒 **${ach.name}** - ${ach.description}${progressText}`;
                }).join('\n');

                const moreText = locked.length > 5 ? `\n*...and ${locked.length - 5} more*` : '';
                embed.addFields({ name: '📋 Locked Achievements', value: lockedText + moreText, inline: false });
            }

            // Add stats footer
            embed.setFooter({
                text: `${stats.messageCount} total messages | Member since ${stats.firstMessage?.toLocaleDateString() || 'Unknown'}`
            });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in achievements command:', error);
            const errorEmbed = EmbedTemplates.createErrorEmbed('An error occurred while fetching achievements.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
