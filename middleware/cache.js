const redisClient = require("../redis");

const cache = async (req, res, next) => {
  console.log("In cache middleware");
  const { id } = req.params;
  console.log(id);
  await redisClient.connect();
  console.log("client connected");
  data = await redisClient.hGetAll(id);
  await redisClient.disconnect();
  if (!Object.keys(data).length) {
    return next();
  } else {
    console.log(data);
    return res.status(200).json({ data });
  }
};

module.exports = cache;
