const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

const strongPwd = "VeryStrongPassword123!@#WithEnoughLength";

let accessToken;

beforeAll(async () => {
  await pool.query("DELETE FROM refresh_tokens");
  await pool.query("DELETE FROM users");

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "me@example.com",
      password: strongPwd,
      displayName: "Me User",
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "me@example.com",
      password: strongPwd,
    });

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/auth/me", () => {
  test("returns current user when token is valid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("me@example.com");
  });

  test("fails with missing token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("fails with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });
});
