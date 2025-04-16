const { Router } = require("express");
const router = Router();
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const {
  createStory,
  getActiveStories,
} = require("../../../controllers/client/store/store.controller");
const {
  storyCreateSchema,
  storyGetSchema,
} = require("../../../validations/story");
const handleMultipartData = require("../../../middlewares/populateMultipartData.middleware");

router.post(
  "/",
  verifyUserByToken,
  validateRequest(storyCreateSchema),
  handleMultipartData,
  createStory
);
router.get(
  "/",
  verifyUserByToken,
  validateRequest(storyGetSchema),
  getActiveStories
);

module.exports = router;
