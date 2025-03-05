const Joi = require("joi");

const createWorkoutSubcategoryCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    name: Joi.string().required(),  
    image: Joi.string().uri().optional(),  
    workout_subcategory_id: Joi.number().min(1).optional(), 
  }),
});

const updateWorkoutSubcategoryCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    category_id: Joi.number().min(1).required(),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.string().uri().optional(), 
    workout_subcategory_id: Joi.number().min(1).optional(), 
  }),
});

const getWorkoutSubcategoryCategoryByIdSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    category_id: Joi.number().min(1).required(),
  }),
  body: Joi.object({}),
});

const getAllWorkoutSubcategoryCategoriesSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  createWorkoutSubcategoryCategorySchema,
  updateWorkoutSubcategoryCategorySchema,
  getWorkoutSubcategoryCategoryByIdSchema,
  getAllWorkoutSubcategoryCategoriesSchema,
};
