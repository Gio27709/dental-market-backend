import Joi from "joi";

// Schema for Creating a Product with Variations
export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),
  description: Joi.string().required(),
  category_id: Joi.string().uuid().required(),
  price: Joi.number().min(0.01).required(),
  images: Joi.array().items(Joi.string().uri()).min(1).default([]),
  variations: Joi.array()
    .items(
      Joi.object({
        attribute_name: Joi.string().required(),
        attribute_value: Joi.string().required(),
        stock: Joi.number().integer().min(0).default(0),
        price_modifier: Joi.number().default(0.0),
        sku: Joi.string().allow("", null),
      }),
    )
    .min(1)
    .required(), // At least one variation is mandatory
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(150),
  description: Joi.string(),
  category_id: Joi.string().uuid(),
  price: Joi.number().min(0.01),
  images: Joi.array().items(Joi.string().uri()),
  is_active: Joi.boolean(),
});

export const addVariationSchema = Joi.object({
  attribute_name: Joi.string().required(),
  attribute_value: Joi.string().required(),
  stock: Joi.number().integer().min(0).default(0),
  price_modifier: Joi.number().default(0.0),
  sku: Joi.string().allow("", null),
});
