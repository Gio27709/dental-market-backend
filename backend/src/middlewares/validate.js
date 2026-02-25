const validate = (schema) => {
  return (req, res, next) => {
    // Evaluate the request body, allowing unknown properties if needed globally or per schema
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // Re-format Joi errors to be concise and pass it down to ErrorHandler
      error.statusCode = 400;
      return next(error);
    }

    // Overwrite the request body with exactly the validated/stripped response
    req.body = value;
    next();
  };
};

export default validate;
