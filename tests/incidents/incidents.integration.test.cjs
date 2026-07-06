const request = require("supertest");

let app;
let connectDb;

beforeAll(async () => {
  ({ app } = await import("../../dist/app.js"));
  ({ connectDb } = await import("../../dist/config/db.js"));
  await connectDb();
});

const auth = async () => {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ name: "Incident User", email: "incident@example.com", password: "Password123!" });
  return res.body.data.accessToken;
};

describe("incident CRUD", () => {
  it("creates, lists, reads, and updates an incident", async () => {
    const token = await auth();

    const created = await request(app)
      .post("/api/v1/incidents")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Email outage", description: "Users cannot send mail", priority: "high", tags: ["email"] })
      .expect(201);

    const id = created.body.data.incident._id;
    await request(app).get("/api/v1/incidents").set("Authorization", `Bearer ${token}`).expect(200);
    await request(app).get(`/api/v1/incidents/${id}`).set("Authorization", `Bearer ${token}`).expect(200);
    await request(app).patch(`/api/v1/incidents/${id}`).set("Authorization", `Bearer ${token}`).send({ priority: "urgent" }).expect(200);
  });
});
