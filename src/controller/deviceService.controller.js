const debug = require("../utils/debug")("app");
const axios = require("axios");
module.exports = {
  DSMODBUS: async function (req, res) {
    const { name, method } = req.body;
    const {
      data: { host, id, port, baudRate, parity, stopBits, dataBits, channels },
    } = await axios.post(
      process.env.METADATA || "http://127.0.0.1:33335/getCommand/ByName",
      { name }
    );
    const data = await axios.post(
      process.env.METADATA || "http://127.0.0.1:33335/getCommand/ByName",
      { name }
    );
    console.log(data);

    debug(
      await Promise.all(
        channels.map((channel) => {
          let { fc, addr, quantity } = channel;
          let path = method === "modbus-rtu" ? "rtu" : "tcp";
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
              fc,
              addr,
              quantity,
            }
          );
        })
      )
    );
    return res.sendStatus(200);
  },
};
