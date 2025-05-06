const { Router } = require("express");
const router = Router();

const profileRoute = require("./profile/profile.routes");
const postRoute = require("./post/post.routes");
const connectionRoute = require("./connection/connection.routes");
const commentRoute = require("./comment/comment.routes");
const storyRoute = require("./store/store.routes");
const notificationRoute = require("./notification/notification.route");
const messageRoute = require("./message/message.routes");
const groupRoute = require("./group/group.routes");

router.use("/post", postRoute);
router.use("/profile", profileRoute);
router.use("/connection", connectionRoute);
router.use("/comment", commentRoute);
router.use("/story", storyRoute);
router.use("/notification", notificationRoute);
router.use("/message", messageRoute);
router.use("/group", groupRoute);

module.exports = router;
