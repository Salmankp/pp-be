const smileIdentityCore = require("smile-identity-core");
const WebApi = smileIdentityCore.WebApi;

// Initialize
let partner_id = "2234"; // login to the Smile Identity portal to view your partner id
let default_callback = "https://salsa.free.beeceptor.com/my/api/path";
let api_key = "c87a5383-4741-400e-bd17-f89a83e571c5"; // copy your API key from the Smile Identity portal
let sid_server = "0"; // Use '0' for the sandbox server, use '1' for production server

exports.connection = new WebApi(
  partner_id,
  default_callback,
  api_key,
  sid_server
);
