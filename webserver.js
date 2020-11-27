const express = require("express");
const bodyParser = require("body-parser");

const links = require("./link");
const database = require("./database");
const index = require("./index");

const app = express();

app.use(bodyParser.text({type: "*/*"}));

app.post("/link", (req, res) => {
    try {
        const token = req.body.substr(0, 32);
        const uuid = req.body.substr(32);

        if (!links.links.has(token)) {
            return res.send("E1");
        }

        const discordId = links.links.take(token);
        links.linksDID.del(discordId);

        database.Link(uuid, discordId).then(() => {
            res.send("S");
        }).catch(e => {
            console.error(e);
            res.send("E2");
        });
    } catch (e) {
        console.error(e);
        res.send("E");
    }
});

app.post("/postcount", (req, res) => {
    index.client.user.setPresence({ game: { name: req.body+"/50 players" , type: 'WATCHING' }, status: 'online' });
});

app.listen(process.env.BOT_PORT);