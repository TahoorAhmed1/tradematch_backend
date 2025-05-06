const { Router } = require("express");
const router = Router();
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");
const { updateProfileSchema, searchProfileSchema, profileByIdSchema } = require("../../../validations/profile");
const {
  updateProfile,
  getAllProfile,
  searchProfiles,
  searchGroupAndProfiles,
  getProfilesById,
} = require("../../../controllers/client/profile/profile.controller");
const verifyUserByToken = require("../../../middlewares/verifyUserByToken");
const handleMultipartData = require("../../../middlewares/populateMultipartData.middleware");

router.patch(
  "/",
  verifyUserByToken,
  handleMultipartData,
  validateRequest(updateProfileSchema),
  updateProfile
);
router.get(
  "/all-user",
  verifyUserByToken,
  getAllProfile
);
router.get(
  "/all-user/search",
  verifyUserByToken,
  validateRequest(searchProfileSchema),
  searchProfiles
);
router.get(
  "/global/search",
  verifyUserByToken,
  validateRequest(searchProfileSchema),
  searchGroupAndProfiles
);
router.get(
  "/:id",
  verifyUserByToken,
  validateRequest(profileByIdSchema),
  getProfilesById
);

module.exports = router;
