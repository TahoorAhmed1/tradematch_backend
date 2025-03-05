const Joi = require("joi");

const userRegisterRealSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email(),
    social_id: Joi.string().optional(),
    platform: Joi.string().optional(),
    type: Joi.string().optional(),
  }),
});
const userRegisterGuestSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  userRegisterGuestSchema,
  userRegisterRealSchema,
};
