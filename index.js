const express = require("express");
const bodyParser = require("body-parser");
//addition module
const cors = require("cors");
const crypto = require("crypto");

// Create express server app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Router
app.post("/acc/webhook", async (req, res) => {
  console.log("@@@ ----------- testApi -----------");

  if (verifyAuthorizationTokenHTTP(req)) {
    const data = extractPayloadHTTP(req);
    console.log(data);
  }
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

app.get("/acc", (req, res) => {
  res.status(200).send("<h1> Welcome to my Server </h1>");
});

app.listen(process.env.PORT || 80, () => console.log("Server is running"));
