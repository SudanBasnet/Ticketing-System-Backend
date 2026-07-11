import type { NextFunction, Request, Response } from "express";
import type { ParsedQs } from "qs";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodTypeAny } from "zod";

type Schemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) req.params = schemas.params.parse(req.params) as ParamsDictionary;
    if (schemas.query) {
      const parsedQuery = schemas.query.parse(req.query) as ParsedQs;
      // Express 5 exposes req.query as a getter, so direct assignment throws.
      // Shadow the getter for the remainder of this request with validated data.
      Object.defineProperty(req, "query", {
        value: parsedQuery,
        writable: true,
        configurable: true
      });
    }
    next();
  };
