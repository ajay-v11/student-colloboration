import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors to be easily consumed by the frontend
      const issues = error.issues || error.errors || [];
      const formatErrors = issues.map((err) => ({
        field: err.path.join('.').replace('body.', ''), // e.g. "email"
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation Failed",
        errors: formatErrors,
      });
    }
    next(error);
  }
};
