const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLearnContent, getComparison } = require('../utils/education');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('learn')
        .setDescription('Learn about ZK proofs, Brevis, and how this bot works')
        .addStringOption(option =>
            option
                .setName('topic')
                .setDescription('What would you like to learn about?')
                .setRequired(true)
                .addChoices(
                    { name: 'ZK Proofs Basics', value: 'basics' },
                    { name: 'What is Brevis?', value: 'brevis' },
                    { name: 'How This Bot Works', value: 'bot' },
                    { name: 'Why Verification Matters', value: 'verify' }
                )
        ),

    async execute(interaction) {
        const topic = interaction.options.getString('topic');

        try {
            const content = getLearnContent(topic);

            if (!content) {
                return interaction.reply({
                    content: '❌ Topic not found. Please try another topic.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2) // Discord Blurple
                .setTitle(content.title)
                .setDescription(content.content)
                .setFooter({ text: content.footer })
                .setTimestamp();

            // Add comparison table if available
            if (topic === 'bot') {
                const comparison = getComparison('discordVsBrevis');
                embed.addFields({
                    name: comparison.title,
                    value: comparison.table + '\n' + comparison.description,
                    inline: false
                });
            }

            // Add link if available
            if (content.link) {
                embed.setURL(content.link);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in learn command:', error);
            await interaction.reply({
                content: '❌ An error occurred while loading educational content.',
                ephemeral: true
            });
        }
    },
};
