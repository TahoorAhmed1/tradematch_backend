const express = require("express");
const router = express.Router();
const { getAllNotificationsSchema, markNotificationAsReadAndDeleteSchema, markAllNotificationsAsReadAndDeleteSchema } = require("../../../validations/notification");
const { getAllNotifications, markNotificationAsReadAndDelete, markAllNotificationsAsReadAndDelete } = require("../../../controllers/client/notification/notification.controller");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");

router.get("/", verifyUserByToken, validateRequest(getAllNotificationsSchema), getAllNotifications);
router.patch("/mark-read/:id", verifyUserByToken, validateRequest(markNotificationAsReadAndDeleteSchema), markNotificationAsReadAndDelete);
router.patch("/mark-all-read", verifyUserByToken, validateRequest(markAllNotificationsAsReadAndDeleteSchema), markAllNotificationsAsReadAndDelete);

module.exports = router;
