const createGroupSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow(null, "").optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    is_private: Joi.boolean().default(false),
  });


  const updateGroupSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().allow(null, "").optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    is_private: Joi.boolean().optional(),
  });
  
  module.exports = { createGroupSchema,updateGroupSchema };