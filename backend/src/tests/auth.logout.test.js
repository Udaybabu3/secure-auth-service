const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

const strongPwd = "VeryStrongPassword123!@#WithEnoughLength";

let cookie;

beforeAll(async () => {
  await pool.query("DELETE FROM refresh_tokens");
  await pool.query("DELETE FROM users");

  await request(app)
    .post("/api/auth/register")
    .send({
      email: "logout@example.com",
      password: strongPwd,
      displayName: "Logout User",
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "logout@example.com",
      password: strongPwd,
    });

  cookie = loginRes.headers["set-cookie"];
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/auth/logout", () => {
  test("logout invalidates refresh token and clears cookie", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });
});
