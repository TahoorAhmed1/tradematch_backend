const { Router } = require("express");
const router = Router();
const validateRequest = require("../../middlewares/validateRequestJoi.middleware");

const {
  userRegisterSchema,
  userLoginSchema,
  socialLoginSchema,
  ResetPasswordSchema,
  forgotSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
} = require("../../validations/auth");

const {
  register,
  login,
  socialLogin,
  resetPassword,
  generateForgetLink,
  forgotPassword,
  verifyOtp,
  getUserId,
  resendOtp,
} = require("../../controllers/auth/auth.controllers");
const verifyUserByToken = require("../../middlewares/verifyUserByToken");
const verifyOTP = require("../../middlewares/verifyOtp");
const verifyOtpAuthToken = require("../../middlewares/verifyOtpAuthToken.middleware");

router.post("/register", validateRequest(userRegisterSchema), register);
router.post("/login", validateRequest(userLoginSchema), login);
router.post(
  "/generateForgetLink",
  validateRequest(forgotSchema),
  generateForgetLink
);
router.post("/social-login", validateRequest(socialLoginSchema), socialLogin);
router.patch(
  "/resetpassword",
  verifyUserByToken,
  validateRequest(ResetPasswordSchema),
  resetPassword
);
router.post(
  "/new-password",
  validateRequest(forgotPasswordSchema),
  verifyOTP,
  forgotPassword
);

router.post(
  "/verify",
  verifyOtpAuthToken,
  validateRequest(verifyOtpSchema),
  verifyOtp
);

router.post("/resend-otp", verifyOtpAuthToken, resendOtp);

router.get("/", verifyUserByToken, getUserId);


module.exports = router;
