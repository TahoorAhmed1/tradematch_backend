const { Router } = require("express");
const router = Router();

const {
createOnboardingQuestions,
getAllOnboardingQuestions,
updateQuestion
} = require("@/controllers/admin/onboarding_questions/onboarding_questions.controller");
const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const { getOnboardingQuestionSchema, updateOnboardingQuestionSchema, createOnboardingQuestionSchema } = require("@/validations/admin/onboarding_questions");


router.get("/",validateRequest(getOnboardingQuestionSchema),  getAllOnboardingQuestions);

router.post("/", validateRequest(createOnboardingQuestionSchema), createOnboardingQuestions);
router.patch("/:id", validateRequest(updateOnboardingQuestionSchema), updateQuestion);

module.exports = router;
