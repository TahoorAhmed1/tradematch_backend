const { Router } = require("express");
const router = Router();
const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const {
  registerAsGuest,
  getUserDetail,
  getUser,
} = require("@/controllers/auth/auth.controllers");
const { userRegisterGuestSchema } = require("@/validations/auth");
const verifyUserByToken = require("@/middlewares/verifyUserByToken");

router.post(
  "/guest-register",
  validateRequest(userRegisterGuestSchema),
  registerAsGuest
);

router.get(
  "/guest-detail",
  verifyUserByToken,
  validateRequest(userRegisterGuestSchema),
  getUserDetail
);
router.get(
  "/guest-detail",
  verifyUserByToken,
  validateRequest(userRegisterGuestSchema),
  getUserDetail
);
router.get(
  "/",
  validateRequest(userRegisterGuestSchema),
  getUser
);

module.exports = router;
