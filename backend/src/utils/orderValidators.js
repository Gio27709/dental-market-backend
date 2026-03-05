import Joi from "joi";

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().uuid().allow(null),
        variation_id: Joi.string().uuid().allow(null).required(),
        store_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().min(0.01).required(),
      }),
    )
    .min(1)
    .required(),
  shipping_address: Joi.string().min(10).required(),
  contact_phone: Joi.string().min(7).required(),
  payment_method: Joi.string().required(),
  notes: Joi.string().allow("", null).optional(),
  amount: Joi.number().optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("processing", "shipped", "delivered", "cancelled")
    .required(),
});

export const shipItemSchema = Joi.object({
  tracking_code: Joi.string().allow("", null),
  shipping_carrier: Joi.string().allow("", null),
});
