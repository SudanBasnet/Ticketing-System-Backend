import { Types } from "mongoose";
import { AppError } from "../../utils/AppError.js";
import type { UserRole } from "../users/user.model.js";
import { ServiceRecordModel } from "./serviceRecord.model.js";

const Records = ServiceRecordModel as any;

const prefixes: Record<string, string> = { request: "REQ", problem: "PRB", change: "CHG", ci: "CI", knowledge: "KB", activity: "ACT", survey: "CSAT" };
const defaults: Record<string, string> = { request: "submitted", problem: "investigating", change: "draft", ci: "active", knowledge: "draft", activity: "unread", survey: "submitted" };
const staff = (role: UserRole) => ["agent", "admin", "super_admin"].includes(role);

const nextNumber = async (type: string) => `${prefixes[type]}${String(await Records.countDocuments({ type }) + 1).padStart(6, "0")}`;

export const listRecords = async (type: string, query: any, user: { id: string; role: UserRole }) => {
  const filter: any = { type };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.search) filter.$text = { $search: query.search };
  if (!staff(user.role) && type === "request") filter.requestedBy = new Types.ObjectId(user.id);
  if (!staff(user.role) && !["request", "knowledge"].includes(type)) return { items: [], meta: { page: 1, limit: query.limit, total: 0, totalPages: 0 } };
  const [items, total] = await Promise.all([
    Records.find(filter).populate("owner requestedBy approver", "name email role").sort(query.sort).skip((query.page - 1) * query.limit).limit(query.limit),
    Records.countDocuments(filter),
  ]);
  return { items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
};

export const createRecord = async (type: string, input: any, user: { id: string; role: UserRole }) => {
  if (!staff(user.role) && type !== "request" && type !== "survey") throw new AppError(403, "This module is restricted to service-desk staff", "FORBIDDEN");
  return Records.create({ ...input, type, number: await nextNumber(type), status: input.status || defaults[type], requestedBy: input.requestedBy || user.id });
};

export const updateRecord = async (type: string, id: string, input: any, user: { id: string; role: UserRole }) => {
  const record = await Records.findOne({ _id: id, type });
  if (!record) throw new AppError(404, "Record not found", "RECORD_NOT_FOUND");
  const requesterId = record.requestedBy?.toString();
  if (!staff(user.role) && requesterId !== user.id) throw new AppError(403, "You cannot update this record", "FORBIDDEN");
  Object.assign(record, input);
  if (["completed", "closed", "implemented", "resolved", "retired"].includes(input.status) && !record.completedAt) record.completedAt = new Date();
  await record.save();
  return record;
};

export const deleteRecord = async (type: string, id: string, role: UserRole) => {
  if (!["admin", "super_admin"].includes(role)) throw new AppError(403, "Only admins can delete records", "FORBIDDEN");
  const result = await Records.findOneAndDelete({ _id: id, type });
  if (!result) throw new AppError(404, "Record not found", "RECORD_NOT_FOUND");
};

export const getOverview = async () => {
  const grouped = await Records.aggregate([{ $group: { _id: "$type", total: { $sum: 1 }, overdue: { $sum: { $cond: [{ $and: [{ $lt: ["$dueAt", new Date()] }, { $not: [{ $in: ["$status", ["completed", "closed", "implemented", "resolved"]] }] }] }, 1, 0] } } } }]);
  return grouped.reduce((result: Record<string, unknown>, row: any) => ({ ...result, [row._id]: { total: row.total, overdue: row.overdue } }), {});
};
