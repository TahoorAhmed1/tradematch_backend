const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { reqLogger } = require("@/configs/logger");
const errorHandler = require("@/middlewares/errorHandler.middleware");
const uploadImage = require("@/middlewares/uploadPicture.middleware");
const handleMultipartData = require("@/middlewares/populateMultipartData.middleware");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
    noSniff: true,
    hidePoweredBy: true,
  })
);

app.use(compression());

app.use(cors());

app.use(
  express.json({
    limit: "100mb",
    extended: true,
    parameterLimit: 5000,
  })
);

app.use(
  express.urlencoded({
    limit: "100mb",
    extended: true,
    parameterLimit: 5000,
  })
);

app.use(reqLogger);
app.post("/upload", handleMultipartData, uploadImage);
app.use("/api/client", require("@/routes/client"));
app.use("/api/admin", require("@/routes/admin"));
app.use("/api", require("@/routes/auth"));

app.use(errorHandler);

module.exports = app;
