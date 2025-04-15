const { Router } = require("express");
const router = Router();

const profileRoute = require("./profile/profile.routes");
const postRoute = require("./post/post.routes");
const connectionRoute = require("./connection/connection.routes");
const commentRoute = require("./comment/comment.routes");
const storyRoute = require("./store/store.routes");

router.use("/post", postRoute);
router.use("/profile", profileRoute);
router.use("/connection", connectionRoute);
router.use("/comment", commentRoute);
router.use("/story", storyRoute);

module.exports = router;
