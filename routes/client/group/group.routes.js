const express = require("express");
const router = express.Router();
const { createGroupSchema, getByIdSchema, updateGroupSchema } = require("../../../validations/group");
const {
  createGroup,
  updateGroup,
  getAllGroups,
  getGroup,
  joinGroup,
  getAllGroupPost,
  leaveGroup,
} = require("../../../controllers/client/group/group.controller");
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const handleMultipartData = require("../../../middlewares/populateMultipartData.middleware");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");

router.post(
  "/",
  verifyUserByToken,
  handleMultipartData,
  validateRequest(createGroupSchema),
  createGroup
);

router.patch(
  "/:group_id",
  verifyUserByToken,

  validateRequest(updateGroupSchema),
  updateGroup
);

router.get(
  "/",
  verifyUserByToken,
  getAllGroups
);

router.get(
  "/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  getGroup
);
router.get(
  "/join/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  joinGroup
);
router.get(
  "/leave/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  leaveGroup
);
router.get(
  "/post/:id",
  verifyUserByToken,
  getAllGroupPost
);


module.exports = router;
