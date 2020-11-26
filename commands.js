const discord = require("discord.js");
const crypto = require("crypto");

const link = require("./link");
const database = require("./database");

exports.run = (msg, content, mention) => {
    const args = content.split(" ");
    const command = args.shift().trim().toLowerCase();

    switch(command){
        case "link":
            linkCommand(msg, args, mention);
            break;

        case "help":
            helpCommand(msg, args, mention);
            break;

        case "test":
            database.GetAccountInfo("test").then(x => x.GetTeam().then(y => y.GetMembers().then(z => console.log(z)).catch(e2 => console.log(e2))).catch(e1 => console.log(e1))).catch(e => console.log(e));
            break;
    }
}

function getMention(msg, mention, num, fallback){
    if(msg.mentions.members.size < num+(mention ? 2 : 1)) return fallback ? fallback : null;
    return msg.mentions.members.array()[mention ? num+1 : num];
}

function helpCommand(msg, args, mention){
    const p = process.env.PREFIX;

    return msg.channel.send(new discord.MessageEmbed()
        .setTitle("Help")
        .addField(p+"link", "Link your SPS and Discord accounts to use the bot's personalized commands.")
    );
}

function linkCommand(msg, args, mention){
    try {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                console.error(err);
                return new msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
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
    }
    catch(e){
        console.error(e);
        return new msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("An error occurred. Please try again."));
    }
}

function teamCommand(msg, args, mention){
    const user = getMention(msg, mention, 0, msg.member);


}