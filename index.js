require("dotenv").config();

const discord = require("discord.js");

const commands = require("./commands");

const client = new discord.Client();

client.on("message", msg => {
    if(msg.author.bot) return;

    const content = msg.content.trim();
    const prefix = content.startsWith(process.env.PREFIX) ? process.env.TOKEN : (content.startsWith("<@"+client.user.id+">") ? "<@"+client.user.id+">" : content.startsWith("<@!"+client.user.id+">") ? "<@!"+client.user.id+">" : null);

    if(!prefix) return;

    commands.run(msg, content.substr(prefix.length), prefix === process.env.TOKEN);
});

client.login(process.env.TOKEN);