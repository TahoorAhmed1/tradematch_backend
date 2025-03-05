const { Router } = require("express");
const router = Router();

const userOnboardingRoutes = require("./user_onboarding_response/user_onboarding_response.routes");

router.use("/user-onboarding", userOnboardingRoutes);

module.exports = router;
