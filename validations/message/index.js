const Joi = require("joi");

const create1to1Schema = Joi.object({
  body: Joi.object({
    recipientId: Joi.string().uuid().required(),
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const createGroupSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(3).required(),
    memberIds: Joi.array().items(Joi.string().uuid()).min(1).required()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const getMessagesSchema = Joi.object({
  params: Joi.object({
    conversationId: Joi.string().uuid().required(),
  }),
  body: Joi.object({}),
  query: Joi.object({})
});

const sendMessageSchema = Joi.object({
  body: Joi.object({

    content: Joi.string().trim().min(1).required(),
  }),
  params: Joi.object({
    conversationId: Joi.string().uuid().required(),
  }),
  query: Joi.object({})
});

const updateGroupSchema = Joi.object({
  params: Joi.object({
    conversationId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(3).optional(),
    addMemberIds: Joi.array().items(Joi.string().uuid()).optional(),
    removeMemberIds: Joi.array().items(Joi.string().uuid()).optional(),
  }).or("name", "addMemberIds", "removeMemberIds"),
  query: Joi.object({})

});

module.exports = {
  create1to1Schema,
  updateGroupSchema,
  sendMessageSchema,
  getMessagesSchema,
  createGroupSchema

}