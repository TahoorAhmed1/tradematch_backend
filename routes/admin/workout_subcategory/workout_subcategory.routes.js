const { Router } = require("express");
const router = Router();

const {
  createSubCategoryWorkout,
  getAllSubCategoryWorkouts,
} = require("@/controllers/admin/workout_subcategory/workout_subcategory.controller");

const validateRequest = require("@/middlewares/validateRequestJoi.middleware");
const { createWorkoutSubcategorySchema, getAllWorkoutSubcategoriesSchema, updateWorkoutSubcategorySchema } = require("@/validations/admin/workout_subcategory");

router.get("/", validateRequest(getAllWorkoutSubcategoriesSchema), getAllSubCategoryWorkouts);
router.post("/", validateRequest(createWorkoutSubcategorySchema), createSubCategoryWorkout);
router.post("/:id", validateRequest(updateWorkoutSubcategorySchema), createSubCategoryWorkout);

module.exports = router;
