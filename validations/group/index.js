const Joi = require("joi");

const createGroupSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().allow(null, "").optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    is_private: Joi.boolean().optional(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});


const updateGroupSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().allow(null, "").optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    is_private: Joi.boolean().optional(),
  }),
  query: Joi.object({}),
  params: Joi.object({
    group_id: Joi.string().uuid().required(),

  }),

});

const getByIdSchema = Joi.object({
  body: Joi.object({
  }),
  query: Joi.object({}),
  params: Joi.object({
    id: Joi.string().uuid().required(),

  }),
});





module.exports = { createGroupSchema, updateGroupSchema, getByIdSchema };