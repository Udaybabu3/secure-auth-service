/* =====================
   PASSWORD COUNTER (REGISTER)
   ===================== */
const pwdInput = document.getElementById("password");
const pwdCount = document.getElementById("pwdCount");

pwdInput?.addEventListener("input", () => {
  if (pwdCount) {
    pwdCount.innerText = `${pwdInput.value.length} / 32 characters`;
  }
});

/* =====================
   LOGIN
   ===================== */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");
  const button = e.target.querySelector("button");

  errorEl.innerText = "";
  button.disabled = true;
  button.innerText = "Logging in...";

  try {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // IMPORTANT for refresh token cookie
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.innerText = data.error || "Login failed";
      return;
    }

    // Store access token
    localStorage.setItem("accessToken", data.accessToken);

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (err) {
    errorEl.innerText = "Server not reachable";
  } finally {
    button.disabled = false;
    button.innerText = "Login";
  }
});

/* =====================
   REGISTER
   ===================== */
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const displayName = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  const errorEl = document.getElementById("error");
  const successEl = document.getElementById("success");
  const button = e.target.querySelector("button");

  errorEl.innerText = "";
  successEl.innerText = "";
  button.disabled = true;
  button.innerText = "Creating account...";

  // Frontend UX validation
  if (password !== confirm) {
    errorEl.innerText = "Passwords do not match";
    button.disabled = false;
    button.innerText = "Register";
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.innerText = data.error || "Registration failed";
      return;
    }

    successEl.innerText = "Account created successfully";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    errorEl.innerText = "Server not reachable";
  } finally {
    button.disabled = false;
    button.innerText = "Register";
  }
});
