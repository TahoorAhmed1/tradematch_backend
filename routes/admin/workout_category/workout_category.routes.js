const { Router } = require("express");
const router = Router();

const {
  createWorkout,
  getAllWorkouts,
  updateWorkout,
} = require("@/controllers/admin/workout_category/workout_category.controller");

const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const {
  createWorkoutCategorySchema,
  getAllWorkoutCategoriesSchema,
  updateWorkoutCategorySchema,
} = require("@/validations/admin/workout_category");

router.get("/", validateRequest(getAllWorkoutCategoriesSchema), getAllWorkouts);
router.post("/", validateRequest(createWorkoutCategorySchema), createWorkout);
router.put("/:id", validateRequest(updateWorkoutCategorySchema), updateWorkout);

module.exports = router;
