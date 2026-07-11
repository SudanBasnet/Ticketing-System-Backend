import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import * as controller from "./workNote.controller.js";
import { createWorkNoteSchema } from "./workNote.schemas.js";

export const workNoteRoutes = Router({ mergeParams: true });
workNoteRoutes.get("/", controller.list);
workNoteRoutes.post("/", validate({ body: createWorkNoteSchema }), controller.create);
