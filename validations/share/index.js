const sharePostSchema = Joi.object({
  post_id: Joi.string().uuid().required(),
  group_ids: Joi.array().items(Joi.string().uuid()).required(),
});
module.exports = { sharePostSchema };
