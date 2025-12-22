/**
 * Request Validation Middleware
 * Validates request body, query, or params
 * 
 * @param {Function} schema - Validation schema function (e.g., from Joi, Yup, etc.)
 * @param {string} source - 'body', 'query', or 'params'
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};











