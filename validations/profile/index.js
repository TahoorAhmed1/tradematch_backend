const { regionEnum } = require("@/enums");
const Joi = require("joi");

const updateProfileSchema = Joi.object({
  body: Joi.object({
    first_name: Joi.string().optional().allow(null, ""),
    last_name: Joi.string().optional().allow(null, ""),
    company_name: Joi.string().optional().allow(null, ""),
    phone_number: Joi.string().optional().allow(null, ""),
    bio: Joi.string().optional().allow(null, ""),
    website_link: Joi.string().uri().optional().allow(null, ""),
    country: Joi.string().optional().allow(null, ""),
    city_region: Joi.string().optional().allow(null, ""),
    region: Joi.string().optional().allow(null, ""),
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
