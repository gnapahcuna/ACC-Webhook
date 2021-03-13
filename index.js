let express = require("express");
let bodyParser = require("body-parser");
let router = express.Router();
let cors = require("cors");
let app = express();
app.use(cors());

// all of our routes will be prefixed with /api
app.use("/cctv", bodyParser.json(), router); //[use json]
app.use("/cctv", bodyParser.urlencoded({ extended: false }), router);

router.route("/webhook").post((req, res) => {
  console.log("@@@ ----------- testApi -----------");

  if (verifyAuthorizationTokenHTTP(req)) {
    const data = extractPayloadHTTP(req);
    console.log(data);
    res.status(200);
  }
});

router.route("/welcome").get((req, res) => {
  res.status(200).send("Welcome to CCTV Webhook");
});

function extractPayloadHTTP(request) {
  return JSON.parse(request.body);
}

function verifyAuthorizationTokenHTTP(request) {
  const authenticationTokenBinary = Buffer.from(authenticationToken, "base64");

  const authHeader = request.headers.authorization;
  const hmac = crypto.createHmac("sha256", authenticationTokenBinary);
  hmac.update(request.body);
  const hashInBase64 = hmac.digest("base64");

  return hashInBase64 === authHeader;
}

app.use("*", (req, res) => res.status(404).send("404 Not found"));
app.listen(process.env.PORT || 80, () => console.log("Server is running"));
