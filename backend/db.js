const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.DB_URL);
client.connect();

module.exports = { client };
