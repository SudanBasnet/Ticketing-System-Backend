import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as service from "./serviceRecord.service.js";

export const list = async (req: Request, res: Response, next: NextFunction) => { try { const result = await service.listRecords(String(req.params.type), req.query, req.user!); sendSuccess(res, 200, "Records retrieved", result.items, result.meta); } catch (e) { next(e); } };
export const create = async (req: Request, res: Response, next: NextFunction) => { try { const record = await service.createRecord(String(req.params.type), req.body, req.user!); sendSuccess(res, 201, "Record created", { record }); } catch (e) { next(e); } };
export const update = async (req: Request, res: Response, next: NextFunction) => { try { const record = await service.updateRecord(String(req.params.type), String(req.params.recordId), req.body, req.user!); sendSuccess(res, 200, "Record updated", { record }); } catch (e) { next(e); } };
export const remove = async (req: Request, res: Response, next: NextFunction) => { try { await service.deleteRecord(String(req.params.type), String(req.params.recordId), req.user!.role); sendSuccess(res, 200, "Record deleted", null); } catch (e) { next(e); } };
export const overview = async (_req: Request, res: Response, next: NextFunction) => { try { sendSuccess(res, 200, "Overview retrieved", await service.getOverview()); } catch (e) { next(e); } };
