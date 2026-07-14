import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./serviceRecord.controller.js";
import { createRecordSchema, listRecordQuerySchema, recordParamSchema, typeParamSchema, updateRecordSchema } from "./serviceRecord.schemas.js";

export const serviceRecordRoutes = Router();
serviceRecordRoutes.use(authenticate);
serviceRecordRoutes.get("/overview", authorize("agent", "admin", "super_admin"), controller.overview);
serviceRecordRoutes.get("/:type", validate({ params: typeParamSchema, query: listRecordQuerySchema }), controller.list);
serviceRecordRoutes.post("/:type", validate({ params: typeParamSchema, body: createRecordSchema }), controller.create);
serviceRecordRoutes.patch("/:type/:recordId", validate({ params: recordParamSchema, body: updateRecordSchema }), controller.update);
serviceRecordRoutes.delete("/:type/:recordId", validate({ params: recordParamSchema }), controller.remove);
