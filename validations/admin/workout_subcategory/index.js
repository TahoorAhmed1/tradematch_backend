const Joi = require("joi");

const createWorkoutSubcategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    name: Joi.string().required(), 
    image: Joi.string().uri().optional(),  
    type: Joi.string().optional(),  
    description: Joi.string().optional(),  
    workout_time: Joi.number().integer().optional(), 
    workout_category_id: Joi.number().min(1).optional(),
  }),
});

const updateWorkoutSubcategorySchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    subcategory_id: Joi.number().min(1).required(),  
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    image: Joi.string().uri().optional(),  
    type: Joi.string().optional(), 
    description: Joi.string().optional(),  
    workout_time: Joi.number().integer().optional(),  
    workout_category_id: Joi.number().min(1).optional(), 
  }),
});

const getWorkoutSubcategoryByIdSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    subcategory_id: Joi.number().min(1).required(),
  }),
  body: Joi.object({}),
});

const getAllWorkoutSubcategoriesSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  createWorkoutSubcategorySchema,
  updateWorkoutSubcategorySchema,
  getWorkoutSubcategoryByIdSchema,
  getAllWorkoutSubcategoriesSchema,
};
