const database = require("./database");

exports.Team = data => {
    return {
        GetWGID: () => {
            return data["WGID"];
        },
        GetLeader: () => {
            return database.GetAccountInfoSPS(database.BufToUUID(data["leader"].buffer));
        },
        GetName: () => {
            return data["name"];
        },
        GetMembers: () => {
            return new Promise(async (resolve, reject) => {
                let members = [];

                data["members"].forEach(member => {
                    members.push(database.GetAccountInfoSPS(database.BufToUUID(member.buffer)));
                });

                resolve(members);
            });
        }
    };
}

exports.Account = data => {
    let acc = {
        GetOAuthId: () => {
            return data["oAuthId"];
        },
        IsBanned: () => {
            return data["banned"];
        },
        GetMCName: () => {
            return data["mcName"];
        },
        GetMCUUID: () => {
            return data["mcUUID"];
        },
        IsMuted: () => {
            return data["muted"];
        },
        GetOAuthEmail: () => {
            return data["oAuthEmail"];
        },
        GetOAuthName: () => {
            return data["oAuthName"];
        },
        GetID: () => {
            return data["_id"];
        }
    };

    acc["GetTeam"] = () => database.GetTeam(acc);

    return acc;
}