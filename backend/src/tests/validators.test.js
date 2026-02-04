const {
  normalizeEmail,
  isValidEmail,
  isStrongPassword,
  isValidDisplayName,
} = require("../utils/validators");

describe("Email validation", () => {
  test("normalizes email correctly", () => {
    expect(normalizeEmail(" User@Email.COM "))
      .toBe("user@email.com");
  });

  test("valid email passes", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
  });

  test("invalid email fails", () => {
    expect(isValidEmail("bad-email")).toBe(false);
  });
});

describe("Password validation", () => {
  test("strong password passes", () => {
    const strongPassword =
      "VeryStrongPassword123!@#WithEnoughLength";
    expect(isStrongPassword(strongPassword)).toBe(true);
  });

  test("short password fails", () => {
    expect(isStrongPassword("Short123!")).toBe(false);
  });

  test("missing special character fails", () => {
    const pwd =
      "VeryStrongPassword123WithEnoughLength";
    expect(isStrongPassword(pwd)).toBe(false);
  });
});

describe("Display name validation", () => {
  test("valid display name passes", () => {
    expect(isValidDisplayName("Nani Babu")).toBe(true);
  });

  test("too short name fails", () => {
    expect(isValidDisplayName("AB")).toBe(false);
  });

  test("invalid characters fail", () => {
    expect(isValidDisplayName("<script>")).toBe(false);
  });
});
