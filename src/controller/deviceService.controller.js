const debug = require("../utils/debug")("app");
const axios = require("axios");
const { client } = require("../config/redis");
module.exports = {
  DSMODBUS: async function (req, res) {
    const { name, channels, southProtocol, isProvision } = req.body;
    const protocol = req.body[southProtocol];
    try {
      const gatewayId = await client.get("gatewayId");
      switch (southProtocol) {
        case "modbusRTU":
        case "modbusTCP":
          const result = await Promise.all(
            channels.map((e) =>
              axios.post(
                `${process.env.DSMODBUS || "http://127.0.0.1:33336"}/action/${
                  southProtocol.split("modbus")[1]
                }`,
                {
                  ...req.body[southProtocol],
                  ...e,
                }
              )
            )
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
          if (isProvision === true) {
            axios
              .post(
                (process.env.MQTT || "http://127.0.0.1:33337") + "/telemetry",
                package
              )
              .then()
              .catch(debug);
          }
          res.send(200);
          break;
        default:
          throw new Error("protocol not supported");
      }
    } catch (err) {
      debug(err);
      res.send(404);
    }
  },
};
