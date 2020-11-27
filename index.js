require("dotenv").config();

const discord = require("discord.js");
const axios = require("axios");

const commands = require("./commands");
const webserver = require("./webserver");

const client = new discord.Client();
exports.client = client;

client.on("message", msg => {
    if (msg.author.bot) return;

    const content = msg.content.trim();
    const prefix = content.startsWith(process.env.PREFIX) ? process.env.PREFIX : (content.startsWith("<@" + client.user.id + ">") ? "<@" + client.user.id + ">" : content.startsWith("<@!" + client.user.id + ">") ? "<@!" + client.user.id + ">" : null);

    if (!prefix) return handleMessage(msg);

    commands.run(msg, content.substr(prefix.length), prefix === process.env.PREFIX);
});

function handleMessage(msg) {
    if (msg.channel.id === process.env.BROADCAST_CHANNEL) {
        axios.post("http://" + process.env.SERVER_HOST + ":" + process.env.SERVER_PORT + "/broadcast", "§d[DISCORD] " + msg.member.displayName + ": " + msg.content.trim().replace(/<:(.+):.+>/g, (x, y) => ":"+y+":"));
        return;
    }
}

client.login(process.env.TOKEN);