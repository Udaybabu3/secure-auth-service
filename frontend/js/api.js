const API_BASE = "http://localhost:4000/api";

async function apiRequest(path, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // IMPORTANT: sends refresh cookie
  });

  // Access token expired → try refresh
  if (res.status === 401 && accessToken) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiRequest(path, options);
    }
  }

  return res;
}

async function refreshToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    localStorage.removeItem("accessToken");
    window.location.href = "index.html";
    return false;
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  return true;
}
