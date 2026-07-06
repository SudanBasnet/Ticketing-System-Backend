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
    if (schemas.query) req.query = schemas.query.parse(req.query) as ParsedQs;
    next();
  };
