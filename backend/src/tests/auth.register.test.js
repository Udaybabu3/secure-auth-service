const request = require("supertest");
const app = require("../app");
const pool = require("../config/db");

const strongPwd = "VeryStrongPassword123!@#WithEnoughLength";

beforeAll(async () => {
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /api/auth/register", () => {
  test("registers with valid data", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "User@Example.com",
        password: strongPwd,
        displayName: "Nani Babu",
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("user@example.com");
    expect(res.body).not.toHaveProperty("password");
  });

  test("rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "user@example.com",
        password: strongPwd,
        displayName: "Another Name",
      });

    expect(res.status).toBe(409);
  });

  test("rejects weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "weak@example.com",
        password: "Short123!",
        displayName: "Weak User",
      });

    expect(res.status).toBe(400);
  });
});
