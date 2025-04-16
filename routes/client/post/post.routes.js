const express = require("express");
const router = express.Router();
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const handleMultipartData = require("../../../middlewares/populateMultipartData.middleware");
const {
  createPost,
  likePost,
  unlikePost,
  getAllVisiblePublicPost,
  updatePost,
  deletePost,
} = require("../../../controllers/client/post/post.controller");
const {
  createPostSchema,
  likePostSchema,
  getPostSchema,
  updatePostSchema,
} = require("../../../validations/post");
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");

router.post(
  "/",
  verifyUserByToken,
  handleMultipartData,
  validateRequest(createPostSchema),
  createPost
);

router.patch(
  "/:post_id",
  verifyUserByToken,
  validateRequest(updatePostSchema),
  updatePost
);

router.delete("/:post_id", verifyUserByToken, deletePost);

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
