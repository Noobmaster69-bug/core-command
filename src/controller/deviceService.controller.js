const debug = require("../utils/debug")("app");
const axios = require("axios");
const { client } = require("../config/redis");
module.exports = {
  DSMODBUS: async function (req, res) {
    const { name, SouthProtocol, NothProtocol, NothUrl } = req.body;
    const {
      data: { host, id, port, baudRate, parity, stopBits, dataBits, channels },
    } = await axios.post(
      process.env.METADATA || "http://127.0.0.1:33335/getCommand/ByName",
      { name }
    );
    try {
      const gatewayId = await client.get("gatewayId");
      const result = await Promise.all(
        channels.map((channel) => {
          let path = SouthProtocol === "modbus-rtu" ? "rtu" : "tcp";
          return axios.post(
            `${process.env.DSMODBUS || "http://127.0.0.1:33336"}/${path}`,
            {
              host,
              id,
              port,
              baudRate,
              parity,
              stopBits,
              dataBits,
              ...channel,
            }
          );
        })
      );
      const resultAsObject = result.reduce(
        (pre, curr) => Object.assign(pre, curr.data),
        {}
      );
      const package = {
        gatewayId,
        timestamp: new Date().toISOString(),
        devices: {
          [name]: resultAsObject,
        },
      };
      axios
        .post(
          (process.env.MQTT || "http://127.0.0.1:33337") + "/telemetry",
          package
        )
        .then()
        .catch(debug);
    } catch (err) {
      debug(err.message);
    }
    return res.sendStatus(200);
  },
};
