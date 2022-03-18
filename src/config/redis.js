const debug = require("../utils/debug")("redis");
let client;
(async () => {
  try {
    const { createClient } = require("redis");
    client = createClient();
    client.on("error", (err) => {
      if (err.code === "ECONNREFUSED") {
      } else {
        debug(err);
      }
    });
    client.on("ready", () => {
      debug("Redis ready!");
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
    } else {
      console.log(err);
    }
  }
})();

module.exports = { client };
