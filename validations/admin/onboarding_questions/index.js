const Joi = require("joi");

const createOnboardingQuestionSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    question: Joi.string().required(),
  }),
});

const getOnboardingQuestionByIdSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    question_id: Joi.number().min(1).required(),
  }),
  body: Joi.object({}),
});
const getOnboardingQuestionSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
  }),
  body: Joi.object({}),
});

const updateOnboardingQuestionSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    id: Joi.number().min(1).required(),
  }),
  body: Joi.object({
    question: Joi.string().optional(),
  }),
});

module.exports = {
  createOnboardingQuestionSchema,
  getOnboardingQuestionByIdSchema,
  updateOnboardingQuestionSchema,
  getOnboardingQuestionSchema,
};
