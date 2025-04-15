const { regionEnum } = require("@/enums");
const Joi = require("joi");

const updateProfileSchema = Joi.object({
  body: Joi.object({
    company_name: Joi.string().optional(),
    phone_number: Joi.string().optional(),
    bio: Joi.string().optional().allow(null, ""),
    website_link: Joi.string().uri().optional().allow(null, ""),
    country: Joi.string().optional(),
    city_region: Joi.string().optional().allow(null, ""),
    region: Joi.string()
      .valid(...regionEnum)
      .optional(),
    linkedin: Joi.string().uri().optional().allow(null, ""),
    twitter: Joi.string().uri().optional().allow(null, ""),
    instagram: Joi.string().uri().optional().allow(null, ""),
    facebook: Joi.string().uri().optional().allow(null, ""),
    contact_info: Joi.string().optional().allow(null, ""),
    industry_subcategory_ids: Joi.array().items(Joi.string().uuid()).optional(), 
  }),
  query: Joi.object({}),
  params: Joi.object({}),
});

module.exports = { updateProfileSchema };
