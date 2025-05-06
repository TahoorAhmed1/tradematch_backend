const Joi = require("joi");

const getAllNotificationsSchema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
});

const markNotificationAsReadAndDeleteSchema = Joi.object({
    body: Joi.object({

    }),
    query: Joi.object({}),
    params: Joi.object({

        id: Joi.string().required(),
    }),
});

const markAllNotificationsAsReadAndDeleteSchema = Joi.object({
    body: Joi.object({}),
    query: Joi.object({}),
    params: Joi.object({}),
});

module.exports = {
    getAllNotificationsSchema,
    markNotificationAsReadAndDeleteSchema,
    markAllNotificationsAsReadAndDeleteSchema,
};
