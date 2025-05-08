const express = require("express");
const router = express.Router();
const { createGroupSchema, getByIdSchema, updateGroupSchema, sharePostToGroupSchema, updateRequestStatusSchema } = require("../../../validations/group");
const {
  createGroup,
  updateGroup,
  getAllGroups,
  getGroup,
  joinGroup,
  getAllGroupPost,
  leaveGroup,
  sharePostToGroup,
  getUserGroups,
  permanentDeleteGroup,
  getAllJoinRequestsForAdmin,
  updateRequestStatus,
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
  handleMultipartData,
  validateRequest(updateGroupSchema),
  updateGroup
);

router.get(
  "/",
  getAllGroups
);

router.get(
  "/user",
  verifyUserByToken,
  getUserGroups
);

router.get(
  "/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  getGroup
);

router.get(
  "/user/pending",
  verifyUserByToken,
  getAllJoinRequestsForAdmin
);

router.patch(
  "/user/update",
  verifyUserByToken,
  validateRequest(updateRequestStatusSchema),
  updateRequestStatus
);

router.get(
  "/join/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  joinGroup
);
router.delete(
  "/delete/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  permanentDeleteGroup
);
router.get(
  "/leave/:id",
  verifyUserByToken,
  validateRequest(getByIdSchema),
  leaveGroup
);
router.post(
  "/share-post",
  verifyUserByToken,
  validateRequest(sharePostToGroupSchema),
  sharePostToGroup
);
router.get(
  "/post/:id",
  verifyUserByToken,
  getAllGroupPost
);


module.exports = router;
