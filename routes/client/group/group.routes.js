const express = require("express");
const router = express.Router();
const { createGroupSchema } = require("../../../validations/group");
const {
  createGroup,
  updateGroup,
} = require("../../../controllers/client/group/group.controller");
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const handleMultipartData = require("../../../middlewares/populateMultipartData.middleware");

router.post(
  "/group",
  verifyUserByToken,
  handleMultipartData,
  validateRequest(createGroupSchema),
  createGroup
);

router.patch(
  "/group/:groupId",
  verifyUserByToken,
  handleMultipartData,
  validateRequest(updateGroupSchema),
  updateGroup
);


module.exports = router;
