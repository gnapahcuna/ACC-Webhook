let express = require("express");
let bodyParser = require("body-parser");
let router = express.Router();
let cors = require("cors");
let app = express();
app.use(cors());
const config = require("./config.js");

const authenticationToken = config.authenticationToken;
const serviceIPAdress = config.serviceIPAdress;
const serviceIPAdressUserLine = config.serviceIPAdressUserLine;

// all of our routes will be prefixed with /api
app.use("/hitech/cctv", bodyParser.json(), router); //[use json]
app.use("/hitech/cctv", bodyParser.urlencoded({ extended: false }), router);

router.route("/webhook").post((req, res) => {
  if (!isEmpty(req)) {
    //check token
    if (verifyAuthorizationTokenHTTPS(req)) {
      //
      //console.log("WEBHOOK_VERIFIED");
      //console.log("req : ", extractPayloadHTTPS(req));

      if (
        extractPayloadHTTPS(req).type === "HELLO" ||
        extractPayloadHTTPS(req).type === "HEARTBEAT"
      ) {
        console.log(extractPayloadHTTPS(req).type);
      } else {
        //print log event
        console.log(
          "event alert & UMD: ",
          extractPayloadHTTPS(req).notifications[0].event
        );
        reply(req);
        res.status(200);
      }
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

router.route("/welcome").get((req, res) => {
  res.status(200).send("Welcome to CCTV Webhook v2");
});

function isEmpty(obj) {
  return !Object.keys(obj).length > 0;
}

// verify https
function verifyAuthorizationTokenHTTPS(request) {
  return authenticationToken === request.body.authenticationToken;
}
function verifyAuthorizationTokenHTTP(request) {
  const authenticationTokenBinary = Buffer.from(authenticationToken, "base64");
  const authHeader = request.headers.authorization;
  const hmac = crypto.createHmac("sha256", authenticationTokenBinary);
  hmac.update(request.body);
  const hashInBase64 = hmac.digest("base64");

  return hashInBase64 === authHeader;
}

// extract data from payload of body
function extractPayloadHTTPS(request) {
  return request.body;
}
function extractPayloadHTTP(request) {
  return JSON.parse(request.body);
}

//call web api for push data in HiTech(database)
function reply(req) {
  console.log("Start psuh event!");
  const axios = require("axios");

  //const url = "http://192.168.1.199:5300/cctvsvr/event/push";
  const url = serviceIPAdress + "/cctvsvr/event/push";

  axios
    .post(url, req.body)
    .then((res) => {
      //console.log("Status: ", res.status);
      //console.log("Body: ", res.data);
    })
    .catch((err) => {
      console.error("Errer : ", err);
    });
}

app.use("*", (req, res) => res.status(404).send("404 Not found"));
app.listen(process.env.PORT || config.webhookPort, () =>
  console.log("Server is running")
);
