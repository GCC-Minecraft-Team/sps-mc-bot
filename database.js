const {MongoClient, Binary} = require('mongodb');
const NodeCache = require("node-cache");
const Classes = require("./Classes");

const AccountCache = new NodeCache({stdTTL: 3600});
const AccountSPSCache = new NodeCache({stdTTL: 3600});
const Teams = new NodeCache({stdTTL: 3600});

let db;
let client;
let usersCol;
let wgCol;

MongoClient.connect(process.env.CONURL, function (err, c) {
    if (err) throw err;

    client = c;
    db = client.db(process.env.DATABASE);
    usersCol = db.collection("users");
    wgCol = db.collection("worldgroups");
});

exports.Link = (uuid, discordId) => {
    return new Promise((resolve, reject) => {
        usersCol.updateOne({mcUUID: uuid}, {$set: {discordId}}, function (err, result) {
            if (err) return reject(err);
            if (AccountCache.has(discordId)) AccountCache.del(discordId);
            resolve();
        });
    });
}

exports.GetAccountInfo = (discordId) => {
    return new Promise((resolve, reject) => {
        if (discordId === null) return null;
        if (AccountCache.has(discordId)) return resolve(AccountCache.get(discordId));

        usersCol.find({discordId}).toArray(function (err, result) {
            if (err) return reject(err);
            if (result.length < 1) return resolve(null);

            const account = Classes.Account(result[0]);

            AccountCache.set(discordId, account);
            resolve(account);
        });
    });
}

exports.GetAccountInfoSPS = (spsUUID) => {
    return new Promise((resolve, reject) => {
        if (spsUUID === null) return null;
        if (AccountSPSCache.has(spsUUID)) return resolve(AccountSPSCache.get(spsUUID));

        usersCol.find({oAuthId: spsUUID}).toArray(function (err, result) {
            if (err) return reject(err);
            if (result.length < 1) return resolve(null);

            const account = Classes.Account(result[0]);

            AccountSPSCache.set(spsUUID, account);
            resolve(account);
        });
    });
}

exports.GetTeam = (account) => {
    return new Promise((resolve, reject) => {
        if (Teams.has(account.GetOAuthId())) return resolve(Teams.get(account.GetOAuthId()));

        wgCol.find({'teams.members': Binary(exports.UUIDToBuf(account.GetOAuthId()), 3)}, {"teams.$": 1, "teams.members.$": 1}).toArray(function (err, result) {
            if (err) return reject(err);
            if (result.length < 1) return resolve(null);

            const team = Classes.Team(result[0]["teams"][0]);

            Teams.set(account.GetOAuthId(), team);
            resolve(team);
        });
    });
}

exports.BufToUUID = (buffer) => {
    const str = [...buffer.toString("hex")];
    let output = "";

    for (let i = 0; i < str.length; i++) {
        if ([8, 13, 18, 23, 36].includes(output.length)) output += "-";
        output += str[i];
    }

    return output;
}

exports.UUIDToBuf = (UUID) => {
    return Buffer.from(UUID.replace(/-/g, ""), "hex");
}