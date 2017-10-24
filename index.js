var paramsRoute = require("./route/params");

/**
 * Exposes a route automatically at <host>/params
 * @param app Express app
 * @param apiKey RHMAP Platform 
 */
module.exports = function(app, apiKey) {
  app.use("/params", paramsRoute(apiKey));
}