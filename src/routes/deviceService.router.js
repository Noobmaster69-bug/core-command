const controller = require("../controller/deviceService.controller");
const Router = require("express").Router();
module.exports = Router.use("/", controller.DSMODBUS);
