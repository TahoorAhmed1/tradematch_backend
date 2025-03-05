const { Router } = require("express");
const router = Router();
const {
  createOnboardingAnswers,
  getAllOnboardingAnswers,
  updateAnswers,
} = require("@/controllers/admin/onboarding_answers/onboarding_answers.controller");
const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const { createOnboardingAnswerSchema, getOnboardingAllAnswerSchema, updateOnboardingAnswerSchema } = require("@/validations/admin/onboarding_answers");

router.get("/", validateRequest(getOnboardingAllAnswerSchema), getAllOnboardingAnswers);
router.post("/",  validateRequest(createOnboardingAnswerSchema), createOnboardingAnswers);
router.patch("/:id",  validateRequest(updateOnboardingAnswerSchema), updateAnswers);

module.exports = router;
