const NodeCache = require("node-cache");

exports.links = new NodeCache({stdTTL: 3600});