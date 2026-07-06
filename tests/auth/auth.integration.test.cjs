const request = require("supertest");

let app;
let connectDb;

beforeAll(async () => {
  ({ app } = await import("../../dist/app.js"));
  ({ connectDb } = await import("../../dist/config/db.js"));
  await connectDb();
});

describe("auth flow", () => {
  it("registers, logs in, refreshes, and logs out", async () => {
    const register = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "Test User", email: "test@example.com", password: "Password123!" })
      .expect(201);

    expect(register.body.success).toBe(true);
    expect(register.body.data.accessToken).toBeTruthy();

    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "Password123!" })
      .expect(200);

    const cookie = login.headers["set-cookie"];
    expect(cookie).toBeTruthy();

    await request(app).post("/api/v1/auth/refresh-token").set("Cookie", cookie).expect(200);
    await request(app).post("/api/v1/auth/logout").set("Cookie", cookie).expect(200);
  });
});
