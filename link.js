const NodeCache = require("node-cache");

exports.links = new NodeCache({stdTTL: 3600});
exports.linksDID = new NodeCache({stdTTL: 3600});