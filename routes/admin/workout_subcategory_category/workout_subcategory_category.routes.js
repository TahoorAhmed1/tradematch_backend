const { Router } = require("express");
const router = Router();

const {
  getAllSubCategoryCategoryWorkouts,
  createSubCategoryCategoryWorkout,
} = require("@/controllers/admin/workout_subcategory_category/workout_subcategory_category.controller");

const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const { createWorkoutSubcategoryCategorySchema, getAllWorkoutSubcategoryCategoriesSchema } = require("@/validations/admin/workout_subcategory_category");

router.get("/", validateRequest(getAllWorkoutSubcategoryCategoriesSchema),  getAllSubCategoryCategoryWorkouts);

router.post("/", validateRequest(createWorkoutSubcategoryCategorySchema), createSubCategoryCategoryWorkout);

module.exports = router;
