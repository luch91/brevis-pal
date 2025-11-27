require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const BrevisPalDB = require('./database');
const fs = require('fs');
const path = require('path');

// Initialize database
const db = new BrevisPalDB(process.env.DATABASE_PATH || './brevis-pal.db');

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️  Skipping ${file}: missing 'data' or 'execute' property`);
    }
}

// Bot ready event
client.once(Events.ClientReady, (readyClient) => {
    console.log('═══════════════════════════════════════════');
    console.log('🤖 Brevis-Pal Bot is Online!');
    console.log(`📝 Logged in as: ${readyClient.user.tag}`);
    console.log(`🔗 Bot ID: ${readyClient.user.id}`);
    console.log(`📊 Watching ${readyClient.guilds.cache.size} server(s)`);
    console.log(`⚡ Loaded ${client.commands.size} slash commands`);
    console.log('═══════════════════════════════════════════');

    // Set bot status
    client.user.setActivity('messages for proofs', { type: 3 }); // Type 3 = "Watching"
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, db);
    } catch (error) {
        console.error(`❌ Error executing command ${interaction.commandName}:`, error);
        const errorMessage = { content: 'There was an error executing this command!', ephemeral: true };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Message create event - collect all messages
client.on(Events.MessageCreate, async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Ignore DMs (only collect from servers)
    if (!message.guild) return;

    // Prepare message data
    const messageData = {
        id: message.id,
        userId: message.author.id,
        username: message.author.tag,
        content: message.content,
        timestamp: message.createdTimestamp,
        channelId: message.channel.id,
        channelName: message.channel.name,
        guildId: message.guild.id,
        guildName: message.guild.name,
    };

    // Save to database
    const saved = db.insertMessage(messageData);

    if (saved) {
        console.log(`💾 Saved message from ${message.author.tag} in #${message.channel.name}`);
    }

    // Simple ping-pong command for testing
    if (message.content.toLowerCase() === '!ping') {
        const totalMessages = db.getTotalMessages();
        const totalProofs = db.getTotalProofs();
        await message.reply(`🏓 Pong! I'm online and collecting data.\n📊 Total messages stored: ${totalMessages}\n📜 Total proofs generated: ${totalProofs}`);
    }

    // Simple stats command for testing
    if (message.content.toLowerCase() === '!mystats') {
        const count = db.getMessageCountByUser(message.author.id);
        await message.reply(`📈 You have sent ${count} messages that I've recorded!`);
    }

    // Server stats command
    if (message.content.toLowerCase() === '!serverstats') {
        const stats = db.getGuildStats(message.guild.id);
        let response = `📊 **Server Statistics**\n`;
        response += `📝 Total Messages: ${stats.totalMessages}\n`;
        response += `👥 Active Users: ${stats.uniqueUsers}\n`;
        if (stats.oldestMessage) {
            response += `📅 Collecting since: ${stats.oldestMessage.toLocaleDateString()}`;
        }
        await message.reply(response);
    }
});

// Error handling
client.on(Events.Error, (error) => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Brevis-Pal...');
    db.close();
    client.destroy();
    process.exit(0);
});

// Login to Discord
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ ERROR: DISCORD_TOKEN not found in .env file!');
    console.log('📝 Please copy .env.example to .env and add your bot token');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
