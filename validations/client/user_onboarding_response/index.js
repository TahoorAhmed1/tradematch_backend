const Joi = require("joi");

const createUserOnboardingResponseSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    onboardings: Joi.array().items({
      question_id: Joi.number().min(1).required(),
      answer_id: Joi.number().min(1).optional(),
    }),
  }),
});

const getAllUserOnboardingResponseSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  createUserOnboardingResponseSchema,
  getAllUserOnboardingResponseSchema,
};
