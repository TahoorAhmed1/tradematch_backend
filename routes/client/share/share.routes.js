const { Router } = require("express");
const router = Router();
const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const { updateProfileSchema } = require("@/validations/profile");
const verifyUserByToken = require("@/middlewares/verifyUserByToken");
const { sharePost } = require("@/controllers/client/share/share.controller");

router.patch("/", verifyUserByToken,   validateRequest(updateProfileSchema), sharePost);

module.exports = router;
