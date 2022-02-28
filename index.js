const debug = require("./src/utils/debug")("command");
const app = require("express")();

app.listen(process.env.PORT || 33333, () => {
  debug("is running on port " + (process.env.PORT || 33333));
});
require("./src/middleware/index")(app);
require("./src/routes/index")(app);
