const redis = require("redis");

const redisPort = process.env.REDIS_PORT || 6379;

const client = redis.createClient(redisPort);

module.exports = client;
