/* =====================
   CONFIG
   ===================== */
const API_BASE =
  window.API_BASE_URL || "http://localhost:4000/api";

/* =====================
   SESSION HANDLING
   ===================== */
function handleSessionExpired() {
  localStorage.removeItem("accessToken");
  alert("Your session has expired. Please log in again.");
  window.location.href = "index.html";
}

/* =====================
   AUTHENTICATED FETCH
   ===================== */
async function fetchWithAuth(path) {
  const token = localStorage.getItem("accessToken");

  // First attempt with current access token
  let res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include", // required for refresh cookie
  });

  // If access token expired → try refresh
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      handleSessionExpired();
      return null;
    }

    const refreshData = await refreshRes.json();
    localStorage.setItem("accessToken", refreshData.accessToken);

    // Retry original request with new token
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${refreshData.accessToken}`,
      },
      credentials: "include",
    });
  }

  return res;
}

/* =====================
   LOAD DASHBOARD DATA
   ===================== */
(async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetchWithAuth("/auth/me");

  if (!res || !res.ok) {
    window.location.href = "index.html";
    return;
  }

  const user = await res.json();

  document.getElementById("welcome").innerText =
    `Welcome, ${user.displayName}`;

  document.getElementById("email").innerText =
    user.email;

  document.getElementById("createdAt").innerText =
    new Date(user.createdAt).toLocaleDateString();
})();

/* =====================
   LOGOUT
   ===================== */
document.getElementById("logout")?.addEventListener("click", async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    // Even if request fails, clear local session
  }

  localStorage.removeItem("accessToken");
  window.location.href = "index.html";
});
