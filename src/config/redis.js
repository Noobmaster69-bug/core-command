const { createClient } = require("redis");
const client = createClient();
const subscriber = client.duplicate();
const debug = require("../utils/debug")("app");
(async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();
    await subscriber.connect();
  } catch (err) {
    console.log(err);
  }
})();

module.exports = { client, subscriber };
