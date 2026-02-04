const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

const strongPwd = "VeryStrongPassword123!@#WithEnoughLength";

beforeAll(async () => {
  await pool.query("DELETE FROM refresh_tokens");
  await pool.query("DELETE FROM users");

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "refresh@example.com",
      password: strongPwd,
      displayName: "Refresh User",
    });
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/auth/refresh", () => {
  test("valid refresh rotates token and issues new access token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "refresh@example.com",
        password: strongPwd,
      });

    const cookie = loginRes.headers["set-cookie"];

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.headers["set-cookie"]).toBeDefined();
  });

  test("reusing old refresh token triggers security response", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "refresh@example.com",
        password: strongPwd,
      });

    const cookie = loginRes.headers["set-cookie"];

    // First refresh (valid)
    await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    // Reuse old cookie → should be detected
    const reuseRes = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);

    expect(reuseRes.status).toBe(401);
  });
});
