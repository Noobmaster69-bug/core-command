const DEBUG = require("debug");
const debug = DEBUG("core");
DEBUG.enable("core:*");
module.exports = function (type) {
  if (process.env.dev === "true") {
    return debug.extend(type);
  } else {
    return (type) => {};
  }
};
