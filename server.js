require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build")));

// API endpoint to generate auth token (using crypto)
app.get("/generate-auth-token", (req, res) => {
  const crypto = require("crypto");
  const moment = require("moment");

  const PUBLIC_KEY =
    process.env.REACT_APP_AUTHORIZATION_TOKEN_PUBLIC_KEY.replace(/\\n/g, "\n");

  const encryptData = (data, publicKey) => {
    const buffer = Buffer.from(data, "utf8");
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return encrypted.toString("base64");
  };

  const createAuthHeader = (mitraId) => {
    const timestamp = moment.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
    const tokenData = `${mitraId}+${timestamp}`;
    return encryptData(tokenData, PUBLIC_KEY);
  };

  const mitraId = "18b536cd-067f-4131-a10e-dbc470fe28a8";
  if (mitraId) {
    const encryptedAuthToken = createAuthHeader(mitraId);
    res.json({ authToken: encryptedAuthToken });
  } else {
    res.status(400).json({ error: "mitraId is required" });
  }
});

// Serve the React app if no API matches
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
