import { z, ZodError } from "zod";

export const idParams = z.object({
  id: z.coerce.number({ error: "Invalid id" }).int("Invalid id").positive("Invalid id"),
});

export class HttpError extends Error {
  constructor(status, message, code = "error", details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Validate req[part] against a zod schema and replace it with the parsed value. */
export const validate =
  (schema, part = "body") =>
  (req, res, next) => {
    const parsed = schema.parse(req[part] ?? {});
    // Express 5 exposes req.query as a getter, so store parsed query/params separately.
    if (part === "body") req.body = parsed;
    else req.valid = { ...req.valid, [part]: parsed };
    next();
  };

export const notFound = (req, res, next) => next(new HttpError(404, "Route not found", "not_found"));

// Postgres error codes we translate into client errors instead of 500s.
const PG_ERRORS = {
  23505: [409, "That record already exists", "conflict"],
  23503: [409, "This record is still referenced by other data", "conflict"],
  "22P02": [400, "Invalid identifier", "bad_request"],
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let code = err.code;
  let message = err.message;
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400;
    code = "validation_error";
    message = err.issues[0]?.message || "Invalid request";
    details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
  } else if (PG_ERRORS[err.code]) {
    [status, message, code] = PG_ERRORS[err.code];
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    code = "bad_json";
    message = "Malformed JSON body";
  } else if (status >= 500) {
    console.error(err);
    code = "internal_error";
    message = "Something went wrong on our side";
  }

  res.status(status).json({ success: false, error: { code: code || "error", message, ...(details && { details }) } });
};
