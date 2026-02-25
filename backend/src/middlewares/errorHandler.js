// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Joi Validation Errors
  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map((d) => d.message).join(", ");
  }

  // Postgres / Supabase Errors
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique violation
        statusCode = 409;
        message = "Duplicate record found. This resource already exists.";
        break;
      case "23503": // FK violation
        statusCode = 400;
        message = "Reference error. The linked resource does not exist.";
        break;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
