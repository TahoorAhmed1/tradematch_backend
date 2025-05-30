const express = require("express");
const cors = require("cors");
const compression = require("compression");
const { reqLogger } = require("./configs/logger");
const errorHandler = require("./middlewares/errorHandler.middleware");

const app = express();

require("./configs/redis");

app.use(compression());

app.use(
  cors({
    origin: ["https://tradematch-frontend.vercel.app", "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "50mb",
    extended: true,
    parameterLimit: 5000,
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 5000,
  })
);

app.use(reqLogger);

app.use("/api", require("./routes/auth"));
app.use("/api/client", require("./routes/client"));

app.use(errorHandler);

module.exports = app;
