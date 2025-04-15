const Joi = require("joi");

const storyGetSchema = Joi.object({
  body: Joi.object({}),

  query: Joi.object({}),
  params: Joi.object({}),
});
const storyCreateSchema = Joi.object({
  body: Joi.object({
    caption: Joi.any().optional(),
  }),

  query: Joi.object({}),
  params: Joi.object({}),
});

module.exports = {
  storyCreateSchema,
  storyGetSchema,
};
