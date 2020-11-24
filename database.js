const MongoClient = require('mongodb').MongoClient;

let db;
let client;
let usersCol;

MongoClient.connect(process.env.CONURL, function(err, c) {
    if (err) throw err;

    client = c;
    db = client.db(process.env.DATABASE);
    usersCol = db.collection("users");
});

exports.Link = (uuid, discordId) => {
    return new Promise((resolve, reject) => {
        usersCol.updateOne({mcUUID : uuid}, {$set: {discordId}}, function(err, result) {
            if(err) return reject(err);
            resolve();
        });
    });
}