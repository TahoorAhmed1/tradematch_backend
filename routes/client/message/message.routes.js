
const express = require("express");
const router = express.Router();
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");
const { getMessages, sendMessage, updateGroup, listConversations, create1to1, createGroup, typingNotification } = require("../../../controllers/client/message/message.controller");
const { getMessagesSchema, sendMessageSchema, updateGroupSchema, create1to1Schema, createGroupSchema } = require("../../../validations/message");

router.post(
  "/conversation",
  verifyUserByToken,
  validateRequest(create1to1Schema),
  create1to1
);

router.post(
  "/conversation/group",
  verifyUserByToken,
  validateRequest(createGroupSchema),
  createGroup
);

router.get("/conversations", verifyUserByToken, listConversations);

router.get(
  "/conversation/:conversationId/messages",
  verifyUserByToken,
  validateRequest(getMessagesSchema),
  getMessages
);

router.post(
  "/conversation/:conversationId/messages",
  verifyUserByToken,
  validateRequest(sendMessageSchema),
  sendMessage
);

router.patch(
  "/conversation/:conversationId",
  verifyUserByToken,
  validateRequest(updateGroupSchema),
  updateGroup
);


router.post("/conversation/:conversationId/typing", verifyUserByToken, typingNotification);

module.exports = router;
