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
      email: "login@example.com",
      password: strongPwd,
      displayName: "Login User",
    });
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/auth/login", () => {
  test("login with correct credentials issues tokens", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: strongPwd,
      });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("wrong password returns generic error", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "WrongPassword123!@#WithEnoughLength",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  test("non-existent email returns same generic error", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nope@example.com",
        password: strongPwd,
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });
});
