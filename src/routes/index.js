const deviceService = require("./deviceService.router");
module.exports = function (app) {
  app.use("/device-service", deviceService);
};
