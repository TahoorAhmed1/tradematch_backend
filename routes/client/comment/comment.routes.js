const { createComment, updateComment, deleteComment } = require("@/controllers/client/comment/comment.controller");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");
const verifyUserByToken = require("@/middlewares/verifyUserByToken");
const { updateCommentSchema, createCommentSchema } = require("@/validations/comment");
const express = require("express");
const router = express.Router();


router.post("/", verifyUserByToken, validateRequest(createCommentSchema), createComment);

router.patch("/comment/:comment_id", verifyUserByToken, validateRequest(updateCommentSchema), updateComment);

router.delete("/:comment_id", verifyUserByToken, deleteComment);

module.exports = router;
