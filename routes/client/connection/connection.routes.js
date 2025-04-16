const express = require("express");
const router = express.Router();
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const {
  acceptConnection,
  toggleBlockConnection,
  sendConnection,
  getAllPendingConnection,
  getAllConfirmConnection,
} = require("../../../controllers/client/connection/connection.controller");
const {
  createConnectionSchema,
  acceptConnectionSchema,
  toggleBlockSchema,
  getConnectionSchema,
} = require("../../../validations/connection");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");

router.post(
  "/send",
  verifyUserByToken,
  validateRequest(createConnectionSchema),
  sendConnection
);
router.get(
  "/pending",
  verifyUserByToken,
  validateRequest(getConnectionSchema),
  getAllPendingConnection
);

router.patch(
  "/:connection_id/accept",
  verifyUserByToken,
  validateRequest(acceptConnectionSchema),
  acceptConnection
);
router.get(
  "/accept-connection",
  verifyUserByToken,
  validateRequest(getConnectionSchema),
  getAllConfirmConnection
);

router.patch(
  "/:connection_id/block",
  verifyUserByToken,
  validateRequest(toggleBlockSchema),
  toggleBlockConnection
);



module.exports = router;
