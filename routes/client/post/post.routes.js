const express = require("express");
const router = express.Router();
const verifyUserByToken = require("@/middlewares/verifyUserByToken");
const handleMultipartData = require("@/middlewares/populateMultipartData.middleware");
const {
  createPost,
  likePost,
  unlikePost,
  getAllVisiblePublicPost,
} = require("@/controllers/client/post/post.controller");
const {
  createPostSchema,
  likePostSchema,
  getPostSchema,
} = require("@/validations/post");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");

router.post(
  "/",
  verifyUserByToken,
  handleMultipartData,
  validateRequest(createPostSchema),
  createPost
);
router.get(
  "/public",
  verifyUserByToken,
  validateRequest(getPostSchema),
  getAllVisiblePublicPost
);

router.post(
  "/like",
  verifyUserByToken,
  validateRequest(likePostSchema),
  likePost
);



module.exports = router;
