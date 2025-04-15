const { Router } = require("express");
const router = Router();
const validateRequest = require("../../../middlewares/validateRequestJoi.middleware");
const { updateProfileSchema } = require("@/validations/profile");
const {
  updateProfile,
  getAllProfile,
} = require("@/controllers/client/profile/profile.controller");
const verifyUserByToken = require("@/middlewares/verifyUserByToken");
const handleMultipartData = require("@/middlewares/populateMultipartData.middleware");

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

module.exports = router;
