const discord = require("discord.js");
const crypto = require("crypto");

const link = require("./link");
const database = require("./database");

exports.run = (msg, content, mention) => {
    const args = content.split(" ");
    const command = args.shift().trim().toLowerCase();

    try {
        switch (command) {
            case "link":
                linkCommand(msg, args, mention);
                break;

            case "help":
                helpCommand(msg, args, mention);
                break;

            case "info":
                infoCommand(msg, args, mention);
                break;

            case "unlink":
                unLinkCommand(msg, args, mention);
                break;
        }
    } catch (e) {
        console.error("cmd-" + command, e);
        msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
    }
}

function getMention(msg, mention, num, fallback) {
    if (msg.mentions.members.size < num + (mention ? 2 : 1)) return fallback ? fallback : null;
    return msg.mentions.members.array()[mention ? num + 1 : num];
}

function helpCommand(msg, args, mention) {
    const p = process.env.PREFIX;

    return msg.channel.send(new discord.MessageEmbed()
        .setTitle("Help")
        .addField(p + "help", "View every command the bot has.", true)
        .addField(p + "link", "Link your SPS and Discord accounts to use the bot's personalized commands.", true)
        .addField(p + "unlink", "Unlink your SPS and Discord accounts.", true)
        .addField(p + "info [@user]", "Get info about a certain person.", true)
    );
}

function linkCommand(msg, args, mention) {
    database.GetAccountInfo(msg.author.id).then(acc => {
        if (acc !== null) {
            return msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("You already have an account linked. Unlink it before linking a new account."));
        }

        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                console.error("link1", err);
                return msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
            }

            const token = buf.toString("hex");
            if (link.linksDID.has(msg.author.id)) {
                const oldToken = link.linksDID.take(msg.author.id);
                link.links.del(oldToken);
            }

            link.linksDID.set(msg.author.id, token);
            link.links.set(token, msg.author.id);

            msg.author.send("Run ``/link " + token + "`` ingame to link your minecraft and discord accounts.");
        });
    }).catch(e => {
        console.error("link2", e);
        msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
    });
}

async function infoCommand(msg, args, mention) {
    const user = getMention(msg, mention, 0, msg.member);

    database.GetAccountInfo(user.user.id).then(account => {
        if (account === null) {
            return msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("This user does not have their discord linked to their SPS account. Run the ``" + process.env.PREFIX + "link`` to link your discord and SPS accounts."));
        }

        account.GetTeam().then(team => {
            let embed = new discord.MessageEmbed().setTitle(account.GetMCName()).setDescription("Info for " + account.GetMCName()).addField("Banned", account.IsBanned() ? "Yes" : "No", true);
            if (team !== null) embed.addField("Team", embed.GetName(), true);

            msg.channel.send(embed);
        }).catch(e => {
            console.error("info1", e);
            msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
        })
    }).catch(e => {
        console.error("info2", e);
        msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
    });
}

function unLinkCommand(msg, args, mention) {
    database.GetAccountInfo(msg.author.id).then(acc => {
        if (acc === null) {
            return msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("You don't have an account linked."));
        }

        database.Link(acc.GetMCUUID(), null).then(() => {
            msg.channel.send(new discord.MessageEmbed().setTitle("Success").setDescription("Your account has been successfully unlinked!"));
        }).catch(e => {
            console.error("link1", e);
            msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
        });
    }).catch(e => {
        console.error("link2", e);
        msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
    });
}