import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb, disconnectDb } from "../config/db.js";
import { IncidentModel } from "../modules/incidents/incident.model.js";
import { ServiceRecordModel } from "../modules/serviceManagement/serviceRecord.model.js";
import { UserModel } from "../modules/users/user.model.js";
import { WorkNoteModel } from "../modules/workNotes/workNote.model.js";
const password = "DemoPassword123!";
const people = [["Alex Morgan", "super_admin"], ["Jordan Lee", "admin"], ["Priya Shah", "admin"], ["Mia Chen", "agent"], ["Noah Williams", "agent"], ["Sofia Patel", "agent"], ["Liam Brown", "agent"], ["Ava Wilson", "user"], ["Ethan Davis", "user"], ["Isla Taylor", "user"], ["Lucas Martin", "user"], ["Zoe Anderson", "user"]];
const categories = ["Network", "Email", "Hardware", "Access", "Business Applications", "Security"];
const seed = async () => {
    await connectDb();
    const passwordHash = await bcrypt.hash(password, 12);
    const users = [];
    for (const [name, role] of people) {
        const email = `${name.toLowerCase().replace(/\s/g, ".")}@clearqueue.demo`;
        users.push(await UserModel.findOneAndUpdate({ email }, { name, email, role, passwordHash, status: "active", isEmailVerified: true }, { upsert: true, new: true, setDefaultsOnInsert: true }));
    }
    const agents = users.filter((user) => user.role === "agent");
    const customers = users.filter((user) => user.role === "user");
    await WorkNoteModel.deleteMany({ note: /^\[DEMO\]/ });
    await IncidentModel.deleteMany({ tags: "demo-seed" });
    await ServiceRecordModel.deleteMany({ demoKey: /^clearqueue-v1/ });
    const titles = ["VPN disconnects during meetings", "Shared mailbox is not updating", "Laptop battery drains rapidly", "Cannot access finance drive", "CRM shows a blank dashboard", "Suspicious sign-in notification", "Office printer remains offline", "MFA prompt loops after approval"];
    const incidents = [];
    for (let index = 0; index < 40; index += 1) {
        const priority = ["low", "medium", "high", "urgent"][index % 4];
        const status = ["open", "in_progress", "resolved", "closed"][index % 4];
        const createdAt = new Date(Date.now() - (index + 1) * 5 * 3_600_000);
        incidents.push(await IncidentModel.create({ number: `INC${String(index + 1001).padStart(6, "0")}`, title: titles[index % titles.length], description: `Demonstration incident with realistic ownership, SLA and activity history for ${categories[index % categories.length]}.`, status, priority, category: categories[index % categories.length], tags: ["demo-seed", index % 3 === 0 ? "recurring" : "employee-support"], createdBy: customers[index % customers.length]._id, assignedTo: index % 6 === 0 ? undefined : agents[index % agents.length]._id, assignmentGroup: ["Service Desk", "Network Operations", "Business Apps", "Security Operations"][index % 4], createdAt, updatedAt: createdAt, lastActivityAt: createdAt, responseDueAt: new Date(createdAt.getTime() + 3_600_000), resolutionDueAt: new Date(createdAt.getTime() + [72, 24, 8, 4][index % 4] * 3_600_000), slaStatus: index % 7 === 0 ? "breached" : status === "closed" ? "met" : index % 5 === 0 ? "at_risk" : "on_track", closedAt: status === "closed" ? new Date(createdAt.getTime() + 3_600_000) : undefined }));
    }
    const data = {
        request: ["New laptop for designer", "Microsoft 365 licence", "New starter onboarding", "Shared drive access", "Development software access", "Mobile phone replacement", "Password reset assistance", "Meeting room equipment", "VPN access", "Distribution list membership", "Ergonomic keyboard", "Analytics dashboard access", "Employee offboarding", "Adobe licence", "Guest Wi-Fi access"].map((title, i) => ({ title, category: i % 2 ? "Access" : "Equipment", status: ["submitted", "pending_approval", "approved", "in_fulfillment", "completed"][i % 5], approvalStatus: i % 3 === 0 ? "pending" : "approved", dueAt: new Date(Date.now() + (i - 4) * 86_400_000), requestedBy: customers[i % customers.length]._id, owner: agents[i % agents.length]._id })),
        problem: ["Intermittent VPN disconnections", "Printer spooler failures", "Email delivery delays", "Low disk capacity alerts", "SSO sessions expire early"].map((title, i) => ({ title, status: i === 4 ? "resolved" : "investigating", priority: i < 2 ? "high" : "medium", rootCause: i === 4 ? "Token lifetime policy mismatch" : "Investigation in progress", workaround: "A service-desk workaround is documented", knownError: i % 2 === 0, relatedIncidents: incidents.filter((_, n) => n % 5 === i).slice(0, 4).map((item) => item._id), owner: agents[i % agents.length]._id })),
        change: ["Upgrade VPN gateway", "Database maintenance", "Update firewall rules", "Email platform migration", "Production application release", "Emergency certificate renewal"].map((title, i) => ({ title, status: ["draft", "awaiting_cab", "scheduled", "implemented"][i % 4], risk: ["low", "medium", "high", "critical"][i % 4], impact: "Managed window with stakeholder communication", implementationPlan: "Validate backups, notify users, implement and monitor", testPlan: "Run smoke tests and health checks", rollbackPlan: "Restore the previous configuration", dueAt: new Date(Date.now() + (i + 1) * 86_400_000), owner: agents[i % agents.length]._id })),
        ci: ["Customer Portal", "Identity Service", "VPN Gateway 01", "Primary MongoDB", "Email Relay", "Finance Application", "Core Switch SYD", "Backup Server", "Monitoring Platform", "HR Application", "Design Laptop 014", "Sales Laptop 021", "Sydney Printer 03", "Public Website", "API Gateway", "File Server", "Wireless Controller", "Certificate Authority", "Payroll Database", "Service Desk Platform"].map((title, i) => ({ title, status: i % 8 === 0 ? "maintenance" : "active", ciType: ["Business Service", "Application", "Server", "Database", "Network Device", "Laptop"][i % 6], environment: i % 3 === 0 ? "Production" : "Corporate", location: i % 2 ? "Sydney" : "Melbourne", lifecycle: "Operational", serialNumber: `CQ-${10000 + i}`, owner: agents[i % agents.length]._id })),
        knowledge: ["How to reset your password", "Connect to the corporate VPN", "Set up multi-factor authentication", "Request approved software", "Troubleshoot email synchronisation", "Report a suspected phishing email", "Connect to office Wi-Fi", "Prepare a laptop for remote work"].map((title, i) => ({ title, status: "published", category: categories[i % categories.length], description: `Step-by-step guidance for: ${title}. Follow each check in order and contact the service desk if the issue continues.`, tags: ["self-service", "how-to"] })),
    };
    const prefix = { request: "REQ", problem: "PRB", change: "CHG", ci: "CI", knowledge: "KB" };
    for (const [type, rows] of Object.entries(data))
        for (let i = 0; i < rows.length; i += 1)
            await ServiceRecordModel.create({ type, number: `${prefix[type]}${String(i + 1).padStart(6, "0")}`, description: `${rows[i].title} demonstration record`, priority: "medium", demoKey: `clearqueue-v1-${type}-${i}`, ...rows[i] });
    for (let i = 0; i < 12; i += 1)
        await WorkNoteModel.create({ incidentId: incidents[i]._id, authorId: agents[i % agents.length]._id, note: `[DEMO] ${i % 2 ? "Customer update sent and next diagnostic scheduled." : "Logs reviewed; remediation is being tested."}`, isInternal: i % 3 === 0 });
    console.log(`Seeded ${users.length} users, ${incidents.length} incidents, ${Object.values(data).flat().length} service records and 12 work notes.`);
    console.log(`Demo login: alex.morgan@clearqueue.demo / ${password}`);
};
seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { if (mongoose.connection.readyState)
    await disconnectDb(); });
