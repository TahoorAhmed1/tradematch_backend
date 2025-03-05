const Joi = require("joi");

const createWorkoutCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    name: Joi.string().required(),  
    image: Joi.string().uri().optional(),  
    workout_level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    video: Joi.string().uri().optional(),
  }),
});

const updateWorkoutCategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    category_id: Joi.number().min(1).required(), 
  }),
  body: Joi.object({
    name: Joi.string().optional(),  
    image: Joi.string().uri().optional(),  
    workout_level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    video: Joi.string().uri().optional(),
  }),
});

const getWorkoutCategoryByIdSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    category_id: Joi.number().min(1).required(), 
  }),
  body: Joi.object({}),
});

const getAllWorkoutCategoriesSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  createWorkoutCategorySchema,
  updateWorkoutCategorySchema,
  getWorkoutCategoryByIdSchema,
  getAllWorkoutCategoriesSchema,
};
