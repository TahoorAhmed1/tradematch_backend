const Joi = require("joi");

const createOnboardingAnswerSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    answer: Joi.string().required(),
    questions_id: Joi.number().integer().optional(),
  }),
});

const getOnboardingAnswerByIdSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    answer_id: Joi.number().min(1).required(),
  }),
  body: Joi.object({}),
});
const getOnboardingAllAnswerSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

const updateOnboardingAnswerSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    id: Joi.number().min(1).required(),
  }),
  body: Joi.object({
    answer: Joi.string().optional(),
    questions_id: Joi.number().integer().optional(),
  }),
});

module.exports = {
  createOnboardingAnswerSchema,
  getOnboardingAllAnswerSchema,
  getOnboardingAnswerByIdSchema,
  updateOnboardingAnswerSchema,
};
