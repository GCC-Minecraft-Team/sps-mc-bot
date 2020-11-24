const discord = require("discord.js");

const link = require("./link");
const database = require("./database");

exports.run = (msg, content, mention) => {
    const args = content.split(" ");
    const command = args.shift().trim().toLowerCase();

    switch(command){
        case "link":
            linkCommand(msg, args, mention);
            break;
    }
}

function linkCommand(msg, args, mention){
    if(args.length < 1){
        return msg.channel.send(new discord.MessageEmbed().setTitle("Invalid Syntax").setDescription("Syntax: "+process.env.PREFIX+"link <token>"));
    }

    const token = args[0].trim();

    if(msg.channel.type !== "dm"){
        if(link.links.has(token)) link.links.del(token);
        if(msg.deletable) msg.delete();
        return msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("This command can only be ran in DMs. This token has been invalidated. Please generate a new one in game."));
    }

    if(!link.links.has(token)){
        return msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("This command can only be ran in DMs."));
    }

    const uuid = link.links.take(token);

    database.Link(uuid, msg.author.id).then(() => {
        msg.channel.send(new discord.MessageEmbed().setTitle("Success").setDescription("Your discord and MC/SPS accounts have been linked!"));
    }).catch(e => {
        console.error(e);
        msg.channel.send(new discord.MessageEmbed().setTitle("Error").setDescription("There was an error. Please try again."));
    });
}