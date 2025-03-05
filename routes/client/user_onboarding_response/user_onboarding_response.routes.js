const { Router } = require("express");
const router = Router();
const validateRequest = require("@/middlewares/validateRequestJoi.middleware"); 
const { createUserOnboardingResponseSchema } = require("@/validations/client/user_onboarding_response");
const { createUserOnBoarding } = require("@/controllers/client/user_onboarding_response/user_onboarding_response.controller");
const verifyUserByToken = require("@/middlewares/verifyUserByToken");

router.post("/",verifyUserByToken, validateRequest(createUserOnboardingResponseSchema), createUserOnBoarding);

module.exports = router;
