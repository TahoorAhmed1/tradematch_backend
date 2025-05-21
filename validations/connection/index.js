const Joi = require("joi");

const createConnectionSchema = Joi.object({
  body: Joi.object({
    receiver_id: Joi.string().uuid().required()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});
const cancelConnectionSchema = Joi.object({
  body: Joi.object({
    receiver_id: Joi.string().uuid().required()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const acceptConnectionSchema = Joi.object({
  params: Joi.object({
    connection_id: Joi.string().uuid().required(),
  }),
  query: Joi.object({}),
  body: Joi.object({}),
});

const getConnectionSchema = Joi.object({
  params: Joi.object({
  }),
  query: Joi.object({}),
  body: Joi.object({}),
});

const toggleBlockSchema = Joi.object({
  params: Joi.object({
    connection_id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    block: Joi.boolean().required(),
  }),
  query: Joi.object({}),
});

module.exports = {
  createConnectionSchema,
  acceptConnectionSchema,
  getConnectionSchema,
  toggleBlockSchema,
  cancelConnectionSchema
};
