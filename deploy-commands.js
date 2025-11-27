require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load all command definitions
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
        console.log(`⚠️  Skipping ${file}: missing 'data' or 'execute' property`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`\n🚀 Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('\n📝 Registered commands:');
        data.forEach(cmd => console.log(`   - /${cmd.name}: ${cmd.description}`));
        console.log('\n🎉 Commands are now available in all servers with the bot!');
        console.log('⏱️  Note: Global commands may take up to 1 hour to appear. For instant updates, use guild commands instead.\n');
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
