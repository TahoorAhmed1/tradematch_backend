const { Router } = require("express");
const router = Router();
const workout_category_routes = require("./workout_category/workout_category.routes");
const workout_subcategory_routes = require("./workout_subcategory/workout_subcategory.routes");
const workout_subcategory_category_routes = require("./workout_subcategory_category/workout_subcategory_category.routes");
const onboarding_questions_routes = require("./onboarding_questions/onboarding_questions.routes");
const onboarding_answers_routes = require("./onboarding_answers/onboarding_answers.routes");

router.use("/workout_category", workout_category_routes);
router.use("/workout_subcategory", workout_subcategory_routes);
router.use("/workout_subcategory_category", workout_subcategory_category_routes);
router.use("/onboarding_questions", onboarding_questions_routes);
router.use("/onboarding_answers", onboarding_answers_routes);

module.exports = router;
