const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with bot commands and features'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2) // Discord Blurple
            .setTitle('📚 Brevis-Pal Help Guide')
            .setDescription('Learn how to use the bot to understand ZK proofs and Brevis!')
            .addFields(
                {
                    name: '🔍 Proof Commands',
                    value: `\`/stats @user\` - View user activity statistics
\`/prove @user message_count\` - Generate proof of message count
\`/prove @user keyword_count [keyword]\` - Prove keyword usage
\`/verify [proof_id]\` - Verify any proof by ID

**Example:** \`/prove @yourself message_count\``,
                    inline: false
                },
                {
                    name: '🏆 Competition Commands',
                    value: `\`/leaderboard most_active [timeframe]\` - Most active users
\`/leaderboard keyword [keyword] [timeframe]\` - Keyword champions
\`/achievements [@user]\` - View achievements and roles

**Example:** \`/leaderboard most_active week\``,
                    inline: false
                },
                {
                    name: '📖 Learning Commands',
                    value: `\`/learn basics\` - Learn about ZK proofs
\`/learn brevis\` - What is Brevis?
\`/learn bot\` - How this bot works
\`/learn verify\` - Why verification matters

**Example:** \`/learn brevis\``,
                    inline: false
                },
                {
                    name: '💡 Quick Start',
                    value: `1. Check your stats: \`/stats @yourself\`
2. Generate your first proof: \`/prove @yourself message_count\`
3. See the leaderboard: \`/leaderboard most_active all\`
4. Learn about Brevis: \`/learn brevis\``,
                    inline: false
                },
                {
                    name: '🎓 Educational Purpose',
                    value: `This bot demonstrates how Brevis works:
• **Discord messages** = Blockchain transactions
• **Our proofs** = ZK proofs
• **Verification** = On-chain verification
• **Leaderboards** = Provable rankings

Everything you learn here applies to blockchain!`,
                    inline: false
                },
                {
                    name: '🔗 Useful Links',
                    value: `[Brevis Documentation](https://docs.brevis.network)
[Brevis Website](https://brevis.network)
[What are ZK Proofs?](https://ethereum.org/en/zero-knowledge-proofs/)`,
                    inline: false
                }
            )
            .setFooter({ text: 'Use /learn to dive deeper into specific topics!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
