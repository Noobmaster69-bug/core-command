const debug = require("../utils/debug")("app");
const axios = require("axios");
const { client } = require("../config/redis");
module.exports = {
  DSMODBUS: async function (req, res) {
    const { name, channels, southProtocol, isProvision, northProtocol } =
      req.body;
    try {
      const gatewayId = await new Promise((resolve, reject) => {
        client.get("gatewayId", (err, reply) => {
          resolve(reply);
        });
      });
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
            switch (northProtocol) {
              case null:
              case "mqtt":
                axios
                  .post(
                    (process.env.MQTT || "http://127.0.0.1:33337") +
                      "/telemetry",
                    {
                      id: req.body.mqtt?.deviceId || null,
                      package,
                    }
                  )
                  .then()
                  .catch(debug);
                break;
              default:
            }
          }
          res.sendStatus(200);
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
