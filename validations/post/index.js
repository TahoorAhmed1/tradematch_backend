const Joi = require("joi");

const createPostSchema = Joi.object({
  body: Joi.object({
    content: Joi.string().allow("", null).optional(),
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});
const getPostSchema = Joi.object({
  body: Joi.object({}),
  query: Joi.object({}),
  params: Joi.object({}),
});
const likePostSchema = Joi.object({
  body: Joi.object({
    post_id: Joi.string().uuid().required(),
  }),

  query: Joi.object({}),
  params: Joi.object({}),
});

module.exports = { createPostSchema, likePostSchema, getPostSchema };
