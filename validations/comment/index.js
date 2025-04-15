const Joi = require("joi");

const createCommentSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().min(1).required(),
    post_id: Joi.string().uuid().required(),
    parent_id: Joi.string().uuid().optional(), 
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const updateCommentSchema = Joi.object({
  params: Joi.object({
    comment_id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    content: Joi.string().min(1).required(),
  }),
  query: Joi.object({}),
});

module.exports = {
  createCommentSchema,
  updateCommentSchema,
};
